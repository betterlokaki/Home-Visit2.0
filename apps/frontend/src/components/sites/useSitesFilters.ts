import { useState, useEffect } from 'react';
import type { User, SeenStatus, CoverStatus } from '@home-visit/common';
import { usersService } from '../../services/usersService';

interface UseSitesFiltersProps {
  groupName: string;
  onFiltersChange: (filters: {
    usernames?: string[];
    status?: SeenStatus[];
    coverStatus?: CoverStatus[];
    awaitingVisit?: boolean;
  }) => void;
}

export function useSitesFilters({ groupName, onFiltersChange }: UseSitesFiltersProps) {
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

  return {
    users,
    selectedUsernames,
    setSelectedUsernames,
    emptyCover,
    setEmptyCover,
    awaitingVisit,
    setAwaitingVisit,
    completed,
    setCompleted,
  };
}

