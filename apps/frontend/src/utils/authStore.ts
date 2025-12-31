import type { User, Group } from '@home-visit/common';

let currentUser: User | null = null;
let currentGroup: Group | null = null;

export const authStore = {
  setUser: (user: User | null): void => {
    currentUser = user;
  },
  setGroup: (group: Group | null): void => {
    currentGroup = group;
  },
  getUser: (): User | null => currentUser,
  getGroup: (): Group | null => currentGroup,
};

