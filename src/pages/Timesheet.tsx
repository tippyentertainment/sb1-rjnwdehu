import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, endOfWeek } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Printer, X, Send } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { pdf } from '@react-pdf/renderer';
import TimesheetPDF from '@/components/TimesheetPDF';
import { WeekNavigation } from '@/components/timesheet/WeekNavigation';
import TimesheetRow from '@/components/timesheet/TimesheetRow';
import TimesheetTotals from '@/components/timesheet/TimesheetTotals';
import { TimeEntry, TimeEntryType } from '@/types/timesheet';
import { useTimesheetData } from '@/hooks/timesheet/useTimesheetData';
import { useTimesheetStatus } from '@/hooks/timesheet/useTimesheetStatus';
import { useTimesheetEntries } from '@/hooks/timesheet/useTimesheetEntries';
import { useUser } from '@supabase/auth-helpers-react';

const Timesheet = () => {
  const [selectedDate, setSelectedDate] = useState(endOfWeek(new Date(), { weekStartsOn: 1 }));
  const {
    entries,
    addNewEntry,
    clearBlankEntries,
    updateEntry
  } = useTimesheetEntries();

  const user = useUser();
  const { saveTimesheet, submitTimesheet, isSubmitting, isSaving } = useTimesheetData(selectedDate, user?.id);
  const { data: timesheetStatus } = useTimesheetStatus(selectedDate, user?.id);

  useEffect(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const newWeekDays = Array.from({ length: 7 }, (_, i) => ({
      short: format(addDays(weekStart, i), 'EEE'),
      full: format(addDays(weekStart, i), 'MM/dd'),
    }));
    console.log('Week days updated:', newWeekDays);
  }, [selectedDate]);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => ({
    short: format(addDays(weekStart, i), 'EEE'),
    full: format(addDays(weekStart, i), 'MM/dd'),
  }));

  const calculateRowTotal = (hours: { [key: string]: string }): number => {
    return Object.values(hours).reduce((sum, hour) => sum + (parseFloat(hour) || 0), 0);
  };

  const calculateColumnTotal = (day: string): number => {
    return entries.reduce((sum, entry) => sum + (parseFloat(entry.hours[day]) || 0), 0);
  };

  const calculateOverallTotal = (): number => {
    return entries.reduce((sum, entry) => sum + entry.total, 0);
  };

  const handleHourChange = (index: number, day: string, value: string) => {
    if (!/^\d*\.?\d*$/.test(value) && value !== '') return;

    const entry = { ...entries[index] };
    entry.hours[day] = value;
    entry.total = calculateRowTotal(entry.hours);
    updateEntry(index, entry);
    
    // Auto-save changes
    saveTimesheet(entries);
  };

  const handleTypeChange = (index: number, type: TimeEntryType) => {
    const entry = { ...entries[index] };
    entry.type = type;
    updateEntry(index, entry);
    
    // Auto-save changes
    saveTimesheet(entries);
  };

  const handleProjectChange = (index: number, project: string) => {
    const entry = { ...entries[index] };
    entry.project = project;
    updateEntry(index, entry);
    
    // Auto-save changes
    saveTimesheet(entries);
  };

  const handleSubmitTimesheet = async () => {
    try {
      await submitTimesheet();
      console.log('Timesheet submitted successfully');
      toast({
        title: "Timesheet Submitted",
        description: "Your timesheet has been sent to the scrum master for review.",
      });
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      toast({
        title: "Error",
        description: "Failed to submit timesheet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isWeekend = (day: string): boolean => {
    return day === 'Sat' || day === 'Sun';
  };

  const handlePrint = async () => {
    try {
      const blob = await pdf(<TimesheetPDF entries={entries} selectedDate={selectedDate} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `timesheet-${format(selectedDate, 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('PDF generated and downloaded successfully');
      toast({
        title: "PDF Generated",
        description: "Your timesheet PDF has been generated and downloaded.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isSubmitDisabled = timesheetStatus?.status === 'submitted' || isSubmitting;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Timesheet</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={addNewEntry} disabled={isSubmitDisabled}>
            <Plus className="h-4 w-4 mr-2" />
            Add Timesheet Row
          </Button>
          <Button variant="outline" onClick={clearBlankEntries} disabled={isSubmitDisabled}>
            <X className="h-4 w-4 mr-2" />
            Clear Blank Rows
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button 
            variant="default" 
            onClick={handleSubmitTimesheet}
            disabled={isSubmitDisabled}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Time'}
          </Button>
        </div>
      </div>

      {timesheetStatus?.status === 'submitted' && (
        <div className="bg-muted/50 p-4 rounded-lg text-center">
          This timesheet has been submitted and is pending review
        </div>
      )}

      <WeekNavigation 
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <Card className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="p-4 text-left">Project</th>
              <th className="p-4 text-left">Type</th>
              {weekDays.map((day, i) => (
                <th key={i} className={`p-4 text-center ${isWeekend(day.short) ? 'bg-muted' : ''}`}>
                  <div>{day.short}</div>
                  <div className="text-sm text-muted-foreground">{day.full}</div>
                </th>
              ))}
              <th className="p-4 text-center">Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <TimesheetRow
                key={i}
                entry={entry}
                index={i}
                onHourChange={handleHourChange}
                onTypeChange={handleTypeChange}
                onProjectChange={handleProjectChange}
                isWeekend={isWeekend}
              />
            ))}
          </tbody>
          <TimesheetTotals
            entries={entries}
            calculateColumnTotal={calculateColumnTotal}
            calculateOverallTotal={calculateOverallTotal}
            isWeekend={isWeekend}
          />
        </table>
      </Card>
    </div>
  );
};

export default Timesheet;