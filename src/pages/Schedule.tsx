import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import AddEventDialog from '@/components/Schedule/AddEventDialog';
import CalendarContent from '@/components/Schedule/CalendarContent';
import CalendarSidebar from '@/components/Schedule/CalendarSidebar';
import { toast } from "@/components/ui/use-toast";
import { mockEvents } from '@/components/Schedule/mockData';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from 'date-fns';

interface Event {
  id: number;
  title: string;
  date: Date;
  time: string;
  duration: number;
  type: string;
  attendees?: string[];
  category: string;
  owner: string;
}

interface WeeklyEvent {
  date: Date;
  events: Event[];
}

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
});

const Schedule = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('daily');

  const handleAddEvent = (eventData: any) => {
    console.log('Adding event:', eventData);
    toast({
      title: "Event Added",
      description: "Your event has been successfully added to the calendar.",
    });
    setIsAddEventOpen(false);
  };

  // Get events based on view mode
  const getEventsForViewMode = () => {
    if (!date) return [];

    switch (viewMode) {
      case 'weekly': {
        const start = startOfWeek(date);
        const end = endOfWeek(date);
        const weekDays = eachDayOfInterval({ start, end });
        
        return weekDays.map(day => ({
          date: day,
          events: mockEvents.filter(event => 
            event.date.toDateString() === day.toDateString()
          )
        }));
      }
      case 'monthly':
        return mockEvents.filter(event => 
          isSameMonth(new Date(event.date), date)
        );
      case 'daily':
      default:
        return mockEvents.filter(event => 
          event.date.toDateString() === date.toDateString()
        );
    }
  };

  const selectedDateEvents = getEventsForViewMode();
  const weeklyEvents = viewMode === 'weekly' ? selectedDateEvents as WeeklyEvent[] : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Schedule</h1>
            <Button onClick={() => setIsAddEventOpen(true)}>Add Event</Button>
          </div>
          <div className="flex items-center gap-4">
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value)}>
              <ToggleGroupItem value="daily" aria-label="Daily view">
                Daily
              </ToggleGroupItem>
              <ToggleGroupItem value="weekly" aria-label="Weekly view">
                Weekly
              </ToggleGroupItem>
              <ToggleGroupItem value="monthly" aria-label="Monthly view">
                Monthly
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search events..."
                className="pl-9 h-9 w-[200px] rounded-md border border-input bg-background px-3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          <div className="md:col-span-1">
            <CalendarSidebar 
              date={date}
              onSelect={setDate}
            />
          </div>

          <div className="space-y-4 md:col-span-1">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-full overflow-x-auto">
              <CalendarContent 
                timeSlots={timeSlots} 
                selectedDateEvents={viewMode === 'weekly' ? [] : selectedDateEvents as Event[]}
                onAddEvent={handleAddEvent}
                selectedDate={date || new Date()}
                viewMode={viewMode}
                weeklyEvents={weeklyEvents}
              />
            </div>
          </div>
        </div>
      </div>

      <AddEventDialog
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        selectedDate={date || new Date()}
        selectedTime=""
        onAddEvent={handleAddEvent}
      />
    </div>
  );
};

export default Schedule;
