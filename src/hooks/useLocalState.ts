import { useState, useCallback } from 'react';
import _ from 'lodash';

export function useLocalState<T>(
  initialData: T,
  onSync: (data: T) => Promise<void>
) {
  const [localData, setLocalData] = useState<T>(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const updateLocalData = useCallback((newData: T) => {
    setLocalData(newData);
    setIsDirty(true);
  }, []);

  const syncToDatabase = useCallback(async () => {
    if (!isDirty || isSyncing) return;

    try {
      setIsSyncing(true);
      await onSync(localData);
      setIsDirty(false);
      console.log('Successfully synced data to database');
    } catch (error) {
      console.error('Error syncing data:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isDirty, isSyncing, localData, onSync]);

  return {
    localData,
    updateLocalData,
    isDirty,
    isSyncing,
    syncToDatabase
  };
}