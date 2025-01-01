import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Focus, Bug, Search, Link } from 'lucide-react';

const RunGuide = () => {
  return (
    <Card className="prose dark:prose-invert max-w-none space-y-8 p-6 rounded-lg shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-primary">Runs: Time-boxed Iterations</h2>
        <p className="text-muted-foreground leading-relaxed">
          Runs are focused, time-boxed iterations that help teams make steady progress towards project goals. They provide structure and rhythm to your development process while maintaining flexibility.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3 text-secondary">Why Runs Matter</h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Runs help teams maintain momentum and deliver value consistently. By working in focused iterations, you can:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-primary mt-1" />
            <span>Deliver value incrementally</span>
          </div>
          <div className="flex items-start gap-3">
            <Focus className="h-5 w-5 text-primary mt-1" />
            <span>Maintain team momentum</span>
          </div>
          <div className="flex items-start gap-3">
            <Bug className="h-5 w-5 text-primary mt-1" />
            <span>Adapt to changes quickly</span>
          </div>
          <div className="flex items-start gap-3">
            <Search className="h-5 w-5 text-primary mt-1" />
            <span>Track progress effectively</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3 text-secondary">Components of a Run</h3>
        <ul className="space-y-2 list-none pl-0">
          <li className="text-muted-foreground">
            <span className="font-medium text-foreground">Goals:</span> Clear objectives that the team aims to achieve during the Run.
          </li>
          <li className="text-muted-foreground">
            <span className="font-medium text-foreground">Tasks:</span> Specific work items that contribute to achieving the Run's goals.
          </li>
          <li className="text-muted-foreground">
            <span className="font-medium text-foreground">Team members:</span> The individuals responsible for completing the tasks and achieving the Run's goals.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3 text-secondary flex items-center gap-2">
          <Link className="h-5 w-5" />
          Run Schedules
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          Regular schedules help keep the team aligned and focused. These include planning sessions to define goals, daily check-ins to track progress, and retrospectives to reflect on what worked well and what could be improved.
        </p>
      </div>
    </Card>
  );
};

export default RunGuide;