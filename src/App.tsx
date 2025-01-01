import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import Tasks from '@/pages/Tasks';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Chat from '@/pages/Chat';
import Schedule from '@/pages/Schedule';
import Timesheet from '@/pages/Timesheet';
import FAQ from '@/pages/FAQ';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthStateHandler } from '@/components/auth/AuthStateHandler';
import AuthCallback from '@/components/auth/AuthCallback';
import Runs from '@/pages/Runs';
import Scopes from '@/pages/Scopes';
import Subscription from '@/pages/Subscription';
import Access from '@/pages/Access';
import Tickets from '@/pages/Tickets';
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const authSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const initializationAttempted = useRef(false);

  // Memoize the initialization function
  const initializeApp = useCallback(async () => {
    if (initializationAttempted.current) return;
    initializationAttempted.current = true;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Initial session found');
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    // Only initialize once
    if (!isInitialized) {
      initializeApp();
    }

    // Set up auth state change listener if not already set
    if (!authSubscriptionRef.current) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (_event === 'SIGNED_IN') {
          console.log('User signed in');
        } else if (_event === 'SIGNED_OUT') {
          console.log('User signed out');
        }
      });

      authSubscriptionRef.current = subscription;
    }

    // Cleanup subscription on unmount
    return () => {
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe();
        authSubscriptionRef.current = null;
      }
    };
  }, [isInitialized, initializeApp]);

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <>
      <AuthStateHandler />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Index />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings/*" element={<Settings />} />
          <Route path="chat" element={<Chat />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="timesheet" element={<Timesheet />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="runs" element={<Runs />} />
          <Route path="scopes" element={<Scopes />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="access" element={<Access />} />
          <Route path="tickets" element={<Tickets />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;