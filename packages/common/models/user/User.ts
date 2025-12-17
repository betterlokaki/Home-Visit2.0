import { Group } from '../group/Group';

export interface User {
  userId: number;
  username: string;
  userDisplayName: string;
  group: Group;
}

