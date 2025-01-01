import { supabase } from '@/integrations/supabase/client';

export const getGoogleApiKey = async () => {
  try {
    console.log('Attempting to fetch Google API key from Supabase secrets...');
    const { data, error } = await supabase
      .from('secrets')
      .select('value')
      .eq('key', 'Google_API_TT_KEY')
      .single();

    if (error) {
      console.error('Supabase error fetching Google API key:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      throw error;
    }

    console.log('API key fetch response:', data);

    if (!data || !data.value) {
      console.error('No Google API key found in response:', data);
      throw new Error('Google API key not found in secrets');
    }

    console.log('Successfully retrieved Google API key');
    return data.value;
  } catch (error) {
    console.error('Exception in getGoogleApiKey:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

export const saveGoogleApiKey = async (apiKey: string) => {
  try {
    console.log('Attempting to save Google API key to Supabase secrets...');
    const { error } = await supabase
      .from('secrets')
      .upsert({ key: 'Google_API_TT_KEY', value: apiKey });

    if (error) {
      console.error('Supabase error saving Google API key:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      throw error;
    }

    console.log('Successfully saved Google API key to secrets table');
  } catch (error) {
    console.error('Exception in saveGoogleApiKey:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};