import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import KanbanBoard from '@/components/KanbanBoard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Index() {
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string | null>(
    localStorage.getItem('currentOrganizationId')
  );
  const { toast } = useToast();
  const navigate = useNavigate();

  // Memoized function to fetch organizations
  const fetchOrganizations = useCallback(async () => {
    try {
      console.log('Fetching organization memberships...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        console.log('No authenticated user found');
        return;
      }

      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id);

      if (memberError) {
        console.error('Error fetching member data:', memberError);
        throw memberError;
      }

      console.log('Member data:', memberData);

      if (memberData && memberData.length > 0) {
        const orgIds = memberData.map(m => m.organization_id);
        console.log('Fetching organizations for IDs:', orgIds);
        
        const { data: orgsData, error: orgsError } = await supabase
          .from('organizations')
          .select('id, name')
          .in('id', orgIds);

        if (orgsError) {
          console.error('Error fetching organizations:', orgsError);
          throw orgsError;
        }

        console.log('Organizations data:', orgsData);
        setOrganizations(orgsData || []);

        // If we have organizations but none selected, select the first one
        if (orgsData && orgsData.length > 0 && !selectedOrganization) {
          console.log('Auto-selecting first organization:', orgsData[0].id);
          handleOrganizationSelect(orgsData[0].id);
        }
      } else {
        console.log('No organization memberships found');
      }
    } catch (error) {
      console.error('Error in fetchOrganizations:', error);
      toast({
        title: "Error",
        description: "Failed to load organizations. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedOrganization, toast]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleOrganizationSelect = useCallback((orgId: string) => {
    console.log('Selecting organization:', orgId);
    setSelectedOrganization(orgId);
    localStorage.setItem('currentOrganizationId', orgId);
    
    // Find the organization name before showing the toast
    const selectedOrg = organizations.find(org => org.id === orgId);
    if (selectedOrg) {
      toast({
        title: "Organization Selected",
        description: `You are now viewing ${selectedOrg.name}`,
      });
    } else {
      console.error('Selected organization not found in organizations list');
    }
  }, [organizations, toast]);

  if (!selectedOrganization) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Welcome to <span className="text-[#1A1F2C]">Tasking</span>
              <span className="text-[#F97316]">.tech</span>
            </CardTitle>
            <CardDescription>
              Please select an organization to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {organizations.length > 0 ? (
              <Select onValueChange={handleOrganizationSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  You are not a member of any organization yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Please reach out to our support team at{' '}
                  <a href="mailto:support@tasking.tech" className="text-primary hover:underline">
                    support@tasking.tech
                  </a>{' '}
                  to check on the status of your account provisioning
                </p>
                <Button onClick={() => navigate('/settings')}>
                  Create Organization
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render KanbanBoard without aria-hidden wrapper
  return (
    <div className="flex-col flex h-screen">
      <KanbanBoard />
    </div>
  );
}