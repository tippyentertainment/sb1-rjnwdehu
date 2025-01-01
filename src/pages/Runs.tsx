import React from 'react';
import RunGuide from '@/components/RunGuide';
import { Button } from '@/components/ui/button';
import RunEditDialog from '@/components/Runs/RunEditDialog';
import RunsList from '@/components/Runs/RunsList';
import { useRunsData } from '@/hooks/useRunsData';
import { useScopesData } from '@/hooks/useScopesData';
import type { Run } from '@/types/sprint';

const Runs = () => {
  const { runs, loading: runsLoading, createRun, updateRun } = useRunsData();
  const { scopes, loading: scopesLoading } = useScopesData();
  const [showGuide, setShowGuide] = React.useState(true);

  const handleUpdateRun = async (run: Run) => {
    console.log('Updating run:', run);
    if (run.id) {
      await updateRun(run);
    } else {
      await createRun(run);
      setShowGuide(false);
    }
  };

  const emptyRun: Run = {
    id: '',
    name: '',
    description: 'New sprint run',
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    status: 'planned',
    goals: [],
    organization_members: [],
    tasks: [],
    tags: [],
    metrics: {
      pace: 0,
      planned: 0,
      completed: 0
    }
  };

  if (runsLoading || scopesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Runs</h1>
          <RunEditDialog run={emptyRun} onUpdateRun={handleUpdateRun} scopes={scopes}>
            <Button>New Run</Button>
          </RunEditDialog>
        </div>

        <RunsList 
          runs={runs}
          onUpdateRun={handleUpdateRun}
          scopes={scopes}
        />

        {showGuide && runs.length === 0 && (
          <div className="mt-8">
            <RunGuide />
          </div>
        )}
      </div>
    </div>
  );
};

export default Runs;