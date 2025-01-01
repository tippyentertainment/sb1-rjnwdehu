import React from 'react';
import ScopeCard from '@/components/Scopes/ScopeCard';
import ScopeGuide from '@/components/Scopes/ScopeGuide';
import { Button } from '@/components/ui/button';
import ScopeEditDialog from '@/components/Scopes/ScopeEditDialog';
import { useScopesData } from '@/hooks/useScopesData';
import type { Scope } from '@/types/sprint';

const Scopes = () => {
  const { scopes, loading, createScope, updateScope } = useScopesData();
  const [showGuide, setShowGuide] = React.useState(true);

  const handleUpdateScope = async (scope: Scope) => {
    console.log('Updating scope:', scope);
    if (scope.id) {
      await updateScope(scope);
    } else {
      await createScope(scope);
      setShowGuide(false);
    }
  };

  const emptyScope: Scope = {
    id: '',
    name: '',
    description: 'New project scope',
    vision: '',
    features: [],
    acceptanceCriteria: [],
    runIds: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  if (loading) {
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
          <h1 className="text-2xl font-bold">Scopes</h1>
          <ScopeEditDialog scope={emptyScope} onSaveScope={handleUpdateScope}>
            <Button>New Scope</Button>
          </ScopeEditDialog>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scopes.map((scope) => (
            <ScopeCard 
              key={scope.id} 
              scope={scope} 
              onUpdateScope={handleUpdateScope} 
            />
          ))}
        </div>
        {showGuide && scopes.length === 0 && (
          <div className="mt-8">
            <ScopeGuide />
          </div>
        )}
      </div>
    </div>
  );
};

export default Scopes;