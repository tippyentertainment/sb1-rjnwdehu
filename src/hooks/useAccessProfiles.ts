import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocalState } from './useLocalState';
import _ from 'lodash';

export const useAccessProfiles = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const syncToDatabase = async (profiles: any[]) => {
    console.log('Syncing access profiles to database:', profiles);
    const { error } = await supabase
      .from('access_profiles')
      .upsert(
        profiles.map(profile => ({
          ...profile,
          updated_at: new Date().toISOString()
        }))
      );

    if (error) throw error;
  };

  const {
    localData: profiles,
    updateLocalData: setProfiles,
    isDirty,
    syncToDatabase: sync
  } = useLocalState([], syncToDatabase);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');

        const { data: orgMember } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();

        if (!orgMember?.organization_id) {
          throw new Error('No organization found');
        }

        const { data, error } = await supabase
          .from('access_profiles')
          .select('*')
          .eq('organization_id', orgMember.organization_id);

        if (error) throw error;

        // Remove duplicates using lodash
        const uniqueProfiles = _.uniqBy(data, profile => 
          `${profile.id}-${profile.name}`
        );

        setProfiles(uniqueProfiles);
        setError(null);
      } catch (err) {
        console.error('Error fetching access profiles:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [setProfiles]);

  return {
    profiles,
    loading,
    error,
    isDirty,
    updateProfiles: setProfiles,
    syncToDatabase: sync
  };
};