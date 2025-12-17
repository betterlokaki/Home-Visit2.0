import React, { useState, useEffect } from 'react';
import type { User, SeenStatus, CoverStatus } from '@home-visit/common';
import { UserDropdown } from './UserDropdown';
import { usersService } from '../../services/usersService';

interface SitesFiltersProps {
  groupName: string;
  onFiltersChange: (filters: {
    usernames?: string[];
    status?: SeenStatus[];
    coverStatus?: CoverStatus[];
    awaitingVisit?: boolean;
  }) => void;
}

export const SitesFilters: React.FC<SitesFiltersProps> = ({
  groupName,
  onFiltersChange,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsernames, setSelectedUsernames] = useState<string[]>([]);
  const [emptyCover, setEmptyCover] = useState(false);
  const [awaitingVisit, setAwaitingVisit] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const groupUsers = await usersService.getUsersByGroup(groupName);
        setUsers(groupUsers);
        setSelectedUsernames(groupUsers.map((u) => u.username));
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };

    if (groupName) {
      loadUsers();
    }
  }, [groupName]);

  useEffect(() => {
    const filters: {
      usernames?: string[];
      status?: SeenStatus[];
      coverStatus?: CoverStatus[];
      awaitingVisit?: boolean;
    } = {};

    if (selectedUsernames.length > 0) {
      filters.usernames = selectedUsernames;
    }

    const statusFilters: SeenStatus[] = [];
    if (completed) {
      statusFilters.push('Seen' as SeenStatus);
    }
    if (statusFilters.length > 0) {
      filters.status = statusFilters;
    }

    const coverStatusFilters: CoverStatus[] = [];
    if (emptyCover) {
      coverStatusFilters.push('Empty' as CoverStatus);
    }
    if (coverStatusFilters.length > 0) {
      filters.coverStatus = coverStatusFilters;
    }

    if (awaitingVisit) {
      filters.awaitingVisit = true;
    }

    onFiltersChange(filters);
  }, [selectedUsernames, emptyCover, awaitingVisit, completed, users.length, onFiltersChange]);

  return (
    <div className="flex flex-wrap gap-2 items-center p-2 border-b border-gray-700">
      <UserDropdown
        users={users}
        selectedUsernames={selectedUsernames}
        onSelectionChange={setSelectedUsernames}
      />

      <button
        type="button"
        onClick={() => setEmptyCover(!emptyCover)}
        className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
          emptyCover
            ? 'bg-blue-600 hover:bg-blue-500 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-100'
        }`}
      >
        אין איסוף
      </button>

      <button
        type="button"
        onClick={() => setAwaitingVisit(!awaitingVisit)}
        className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
          awaitingVisit
            ? 'bg-blue-600 hover:bg-blue-500 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-100'
        }`}
      >
        מחכה לביקור
      </button>

      <button
        type="button"
        onClick={() => setCompleted(!completed)}
        className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
          completed
            ? 'bg-blue-600 hover:bg-blue-500 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-100'
        }`}
      >
        בוצע
      </button>
    </div>
  );
};

