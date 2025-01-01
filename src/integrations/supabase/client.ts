import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'defined' : 'missing',
    key: supabaseAnonKey ? 'defined' : 'missing'
  });
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: localStorage,
    storageKey: 'supabase.auth.token',
    debug: true
  },
  global: {
    headers: {
      'X-Client-Info': 'tasking-tech'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Monitor connection status
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth state changed:', { event, timestamp: new Date().toISOString() });
  if (event === 'SIGNED_IN') {
    console.log('User signed in, checking database connection...');
    // Test database connection
    checkDatabaseConnection().then(isConnected => {
      if (!isConnected) {
        console.error('Database connection test failed after sign in');
      } else {
        console.log('Database connection test successful after sign in');
      }
    });
  }
});

// Log configuration for debugging
console.log('Supabase client initialized with URL:', supabaseUrl);
console.log('Auth configuration:', {
  persistSession: true,
  detectSessionInUrl: true,
  storage: 'localStorage',
  debug: true
});

// Add connection health check function with proper count syntax
export const checkDatabaseConnection = async () => {
  try {
    const start = Date.now();
    const { data, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    
    const duration = Date.now() - start;
    
    if (error) {
      console.error('Database health check failed:', {
        error,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
      return false;
    }

    console.log('Database health check successful:', {
      data,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Database health check error:', {
      error,
      timestamp: new Date().toISOString()
    });
    return false;
  }
};

// Perform initial connection test
checkDatabaseConnection().then(isConnected => {
  console.log('Initial database connection status:', {
    connected: isConnected,
    timestamp: new Date().toISOString()
  });
});