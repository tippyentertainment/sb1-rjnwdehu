import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Task } from '../types/task';
import { useToast } from '@/components/ui/use-toast';

export const useTaskOperations = () => {
  const { toast } = useToast();

  const createTask = async (columnId: string, organizationId?: string) => {
    try {
      console.log('Creating new task in column:', columnId);
      console.log('Organization ID:', organizationId);

      // First get the authenticated user
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('Auth error:', userError);
        throw userError;
      }

      if (!user) {
        console.error('No authenticated user found');
        throw new Error('No authenticated user found');
      }

      // Get the user's profile to ensure we have the correct data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      if (!profile) {
        console.error('No profile found for user:', user.id);
        throw new Error('No profile found');
      }

      // If organizationId wasn't provided, use the one from the profile
      const effectiveOrgId = organizationId || profile.organization_id;
      
      if (!effectiveOrgId) {
        console.error('No organization ID available');
        throw new Error('No organization ID available');
      }

      console.log('Creating task with profile:', profile);
      console.log('Organization ID for new task:', effectiveOrgId);

      const newTaskData = {
        title: 'New Task',
        description: '',
        status: columnId,
        created_by: profile.id,
        organization_id: effectiveOrgId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Inserting task with data:', newTaskData);

      const { data: insertedTask, error: insertError } = await supabase
        .from('tasks')
        .insert([newTaskData])
        .select('*')
        .single();

      if (insertError) {
        console.error('Error inserting task:', insertError);
        throw insertError;
      }

      console.log('Task created successfully:', insertedTask);

      const newTask: Task = {
        id: insertedTask.id,
        title: insertedTask.title,
        description: insertedTask.description || '',
        status: insertedTask.status,
        created_at: insertedTask.created_at,
        updated_at: insertedTask.updated_at,
        assignees: [],
        comments: [],
        attachments: [],
        tags: [],
        dependencies: [],
        checklist: [],
        created_by: insertedTask.created_by,
        organization_id: insertedTask.organization_id,
        deleted: false,
      };

      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  return {
    createTask,
  };
};