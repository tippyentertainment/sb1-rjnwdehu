import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { Scope } from '@/types/sprint';

export const useScopesData = () => {
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchScopes = async () => {
    try {
      setLoading(true);
      const { data: scopesData, error } = await supabase
        .from('scopes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedScopes = scopesData.map(scope => ({
        ...scope,
        createdAt: new Date(scope.created_at),
        updatedAt: new Date(scope.updated_at),
        features: scope.features || [],
        acceptanceCriteria: scope.acceptance_criteria || [],
        runIds: [] // Will be populated when needed
      }));

      console.log('Fetched scopes:', formattedScopes);
      setScopes(formattedScopes);
    } catch (error) {
      console.error('Error fetching scopes:', error);
      toast({
        title: "Error fetching scopes",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateScope = async (scope: Scope) => {
    try {
      const { error } = await supabase
        .from('scopes')
        .update({
          name: scope.name,
          description: scope.description,
          vision: scope.vision,
          features: scope.features,
          acceptance_criteria: scope.acceptanceCriteria
        })
        .eq('id', scope.id);

      if (error) throw error;

      toast({
        title: "Scope updated",
        description: "The scope has been updated successfully"
      });

      await fetchScopes();
    } catch (error) {
      console.error('Error updating scope:', error);
      toast({
        title: "Error updating scope",
        description: "Failed to update scope. Please try again.",
        variant: "destructive"
      });
    }
  };

  const createScope = async (scope: Omit<Scope, 'id'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('No authenticated user');

      const { data: orgData, error: orgError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userData.user.id)
        .single();

      if (orgError) throw orgError;

      const { error } = await supabase
        .from('scopes')
        .insert({
          name: scope.name,
          description: scope.description,
          vision: scope.vision,
          features: scope.features || [],
          acceptance_criteria: scope.acceptanceCriteria || [],
          organization_id: orgData.organization_id,
          created_by: userData.user.id
        });

      if (error) throw error;

      toast({
        title: "Scope created",
        description: "The scope has been created successfully"
      });

      await fetchScopes();
    } catch (error) {
      console.error('Error creating scope:', error);
      toast({
        title: "Error creating scope",
        description: "Failed to create scope. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchScopes();
  }, []);

  return {
    scopes,
    loading,
    updateScope,
    createScope
  };
};