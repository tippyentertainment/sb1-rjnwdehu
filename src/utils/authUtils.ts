import { supabase } from '@/integrations/supabase/client';

export const checkMemberStatus = async (userId: string) => {
  try {
    console.log('Checking member status for user:', userId, new Date().toISOString());
    
    // First check if user exists in any organization with a simpler query
    const { data: memberData, error: memberError } = await supabase
      .from('organization_members')
      .select('organization_id, is_enabled')
      .eq('user_id', userId)
      .maybeSingle();

    if (memberError) {
      console.error('Error in initial member check:', memberError, new Date().toISOString());
      
      // Check for specific error types
      if (memberError.code === '42P17') {
        console.error('Permission error in member check:', memberError);
        throw new Error('Permission error');
      }
      
      throw new Error('Failed to verify account status');
    }

    if (!memberData) {
      console.log('No organization membership found', new Date().toISOString());
      throw new Error('No organization found');
    }

    // If user is disabled, throw error
    if (memberData.is_enabled === false) {
      console.log('Account is disabled', new Date().toISOString());
      throw new Error('Account disabled');
    }

    // If we get here, the user is valid and enabled
    console.log('Setting organization ID:', memberData.organization_id, new Date().toISOString());
    localStorage.setItem('currentOrganizationId', memberData.organization_id);

    // Now get the full member data including role
    const { data: fullMemberData, error: roleError } = await supabase
      .from('organization_members')
      .select('organization_id, is_enabled, role')
      .eq('user_id', userId)
      .single();

    if (roleError) {
      console.error('Error fetching member role:', roleError, new Date().toISOString());
      // Don't throw here, we already validated the basic membership
    }

    return fullMemberData || memberData;
  } catch (error) {
    console.error('Error in checkMemberStatus:', error, new Date().toISOString());
    throw error;
  }
};