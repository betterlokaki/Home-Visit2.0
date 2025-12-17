import React from 'react';
import type { Group } from '@home-visit/common';

interface GroupInfoProps {
  group: Group;
}

export const GroupInfo: React.FC<GroupInfoProps> = ({ group }) => {
  return (
    <div className="mb-6 p-4 bg-container rounded-lg border border-border">
      <p className="text-text">
        קבוצה: <span className="font-semibold text-text-solid">{group.groupDisplayName}</span>
      </p>
    </div>
  );
};

