import React from 'react';
import type { ChecklistItem as ChecklistItemType } from '../types/task';
import ChecklistContainer from './Checklist/ChecklistContainer';

interface ChecklistSectionProps {
  checklist?: ChecklistItemType[];
  onUpdate: (checklist: ChecklistItemType[]) => void;
  taskId?: string;
}

const ChecklistSection: React.FC<ChecklistSectionProps> = ({
  checklist = [],
  onUpdate,
  taskId
}) => {
  console.log('ChecklistSection rendering with:', { checklist, taskId });
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Checklist</h3>
      <ChecklistContainer 
        checklist={checklist} 
        onUpdate={onUpdate} 
        taskId={taskId} 
      />
    </div>
  );
};

export default ChecklistSection;