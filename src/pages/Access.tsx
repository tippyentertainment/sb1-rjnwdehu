import { useState } from 'react';
import { useApplications } from '@/hooks/useApplications';
import { useRoles } from '@/hooks/useRoles';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ApplicationList } from '@/components/Access/ApplicationList';
import { RoleList } from '@/components/Access/RoleList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Access() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('applications');
  const [searchQuery, setSearchQuery] = useState('');
  const { applications = [], isLoading: isLoadingApps } = useApplications();
  const { role = [], isLoading: isLoadingRoles } = useRoles();

  console.log('Access page rendering with:', { 
    applications,
    role,
    activeTab,
    searchQuery
  });

  const handleCreateNew = () => {
    if (activeTab === 'applications') {
      navigate('/access/applications/new');
    } else {
      navigate('/access/roles/new');
    }
  };

  const filteredApplications = applications.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRoles = role.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Access Management</h1>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New {activeTab === 'applications' ? 'Application' : 'Role'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>
      </Tabs>

      <Input
        placeholder={`Search ${activeTab}...`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />

      {activeTab === 'applications' ? (
        <ApplicationList 
          applications={filteredApplications}
          isLoading={isLoadingApps}
        />
      ) : (
        <RoleList 
          roles={filteredRoles}
          isLoading={isLoadingRoles}
        />
      )}
    </div>
  );
}