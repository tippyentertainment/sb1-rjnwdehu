import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { LoginForm } from '@/components/auth/LoginForm';
import { DisabledAccountModal } from '@/components/auth/DisabledAccountModal';

export default function Login() {
  const navigate = useNavigate();
  const [showDisabledModal, setShowDisabledModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const authListenerRef = useRef<{ data: { subscription: any } } | null>(null);
  const mounted = useRef(true);

  const checkMemberStatus = useCallback(async (userId: string) => {
    try {
      console.log('Login: Checking member status for user:', userId);
      
      if (!userId) {
        console.error('Login: Invalid user ID');
        return null;
      }

      const { data: memberStatus, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id, is_enabled')
        .eq('user_id', userId)
        .maybeSingle();

      if (memberError) {
        console.error('Login: Error checking member status:', memberError);
        throw memberError;
      }

      return memberStatus;
    } catch (error) {
      console.error('Login: Error in checkMemberStatus:', error);
      throw error;
    }
  }, []);

  const handleAuthStateChange = useCallback(async (event: string, session: any) => {
    console.log('Login: Auth state changed:', event);
    
    if (!mounted.current) return;

    if (event === 'SIGNED_IN' && session?.user?.id) {
      try {
        const memberStatus = await checkMemberStatus(session.user.id);

        if (!memberStatus) {
          console.log('Login: No organization found for user');
          toast({
            title: "No Organization",
            description: "You are not a member of any organization. Please contact support.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return;
        }

        if (memberStatus.is_enabled === false) {
          console.log('Login: Account is disabled');
          setShowDisabledModal(true);
          await supabase.auth.signOut();
          return;
        }

        if (memberStatus.organization_id) {
          console.log('Login: Setting organization ID and redirecting:', memberStatus.organization_id);
          localStorage.setItem('currentOrganizationId', memberStatus.organization_id);
          navigate('/');
        }
      } catch (error) {
        console.error('Login: Error processing sign in:', error);
        toast({
          title: "Error",
          description: "Failed to verify account status. Please try again.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
      }
    }
  }, [navigate, toast, checkMemberStatus]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Login: Checking current session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Login: Error checking session:', error);
          setIsLoading(false);
          return;
        }
        
        if (session?.user?.id) {
          await handleAuthStateChange('SIGNED_IN', session);
        }
      } catch (error) {
        console.error('Login: Error in initializeAuth:', error);
      } finally {
        if (mounted.current) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state change listener
    authListenerRef.current = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Only check session if we're actually on the login page
    if (window.location.pathname === '/login') {
      initializeAuth();
    }

    return () => {
      mounted.current = false;
      if (authListenerRef.current) {
        console.log('Login: Cleaning up auth subscription');
        authListenerRef.current.data.subscription.unsubscribe();
      }
    };
  }, [handleAuthStateChange]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center"
      style={{
        backgroundImage: "url('/lovable-uploads/2d5ecf4b-df50-4cdd-9deb-5cf105245dd5.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 w-full max-w-md p-8">
        <div className="backdrop-blur-xl bg-white/10 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-lg p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold whitespace-nowrap">
              <span className="text-white">tasking</span>
              <span className="text-[#F97316]">.tech</span>
              <span className="text-xs align-super text-white">®</span>
            </h1>
            <p className="mt-2 text-gray-200">
              Streamline your workflow, collaborate seamlessly, and achieve more.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>

      <DisabledAccountModal 
        open={showDisabledModal} 
        onOpenChange={setShowDisabledModal} 
      />
    </div>
  );
}