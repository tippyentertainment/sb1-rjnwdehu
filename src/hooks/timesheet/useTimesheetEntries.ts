import { useState } from 'react';
import { TimeEntry, TimeEntryType } from '@/types/timesheet';

export const useTimesheetEntries = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([
    {
      project: 'Consulting Partners:Internal',
      type: 'Standard Time' as TimeEntryType,
      hours: { Mon: '0', Tue: '0', Wed: '0', Thu: '0', Fri: '0', Sat: '0', Sun: '0' },
      total: 0
    },
    {
      project: 'Consulting Partners:Pre-Sales Work',
      type: 'Non-Billable' as TimeEntryType,
      hours: { Mon: '0', Tue: '0', Wed: '0', Thu: '0', Fri: '0', Sat: '0', Sun: '0' },
      total: 0
    }
  ]);

  const addNewEntry = () => {
    const newEntry: TimeEntry = {
      project: '',
      type: 'Standard Time',
      hours: { Mon: '0', Tue: '0', Wed: '0', Thu: '0', Fri: '0', Sat: '0', Sun: '0' },
      total: 0
    };
    setEntries([...entries, newEntry]);
  };

  const clearBlankEntries = () => {
    const filteredEntries = entries.filter(entry => entry.total > 0 || entry.project);
    setEntries(filteredEntries);
  };

  const updateEntry = (index: number, updatedEntry: TimeEntry) => {
    const newEntries = [...entries];
    newEntries[index] = updatedEntry;
    setEntries(newEntries);
  };

  return {
    entries,
    setEntries,
    addNewEntry,
    clearBlankEntries,
    updateEntry
  };
};