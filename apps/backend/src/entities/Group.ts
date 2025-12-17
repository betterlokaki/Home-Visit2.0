import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './User';
import { Site } from './Site';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn({ name: 'group_id' })
  groupId!: number;

  @Column({ name: 'group_name', unique: true })
  groupName!: string;

  @Column({ name: 'group_display_name' })
  groupDisplayName!: string;

  @Column({ name: 'group_default_refresh_seconds' })
  groupDefaultRefreshSeconds!: number;

  @OneToMany(() => User, (user) => user.group)
  users!: User[];

  @OneToMany(() => Site, (site) => site.group)
  sites!: Site[];
}

