import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeStatus = () => {
  const lastStatusRef = useRef<string>('online');
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const updateUserStatus = async (status: 'online' | 'offline') => {
      // Don't update if status hasn't changed
      if (status === lastStatusRef.current) {
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Updating user status to:', status, 'Previous status:', lastStatusRef.current);
      
      try {
        await supabase.rpc('update_user_status', {
          p_user_id: user.id,
          p_status: status
        });
        lastStatusRef.current = status;
        console.log('Status successfully updated in database');
      } catch (error) {
        console.error('Error updating status:', error);
      }
    };

    const handleVisibilityChange = () => {
      // Clear any pending debounce timer
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }

      // Debounce the status update
      debounceTimerRef.current = window.setTimeout(() => {
        const newStatus = document.hidden ? 'offline' : 'online';
        updateUserStatus(newStatus);
      }, 2000); // 2 second debounce
    };

    const channel = supabase.channel('online_users')
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('Presence state synced:', state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await updateUserStatus('online');
          
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      updateUserStatus('offline');
      channel.unsubscribe();
    };
  }, []);
};