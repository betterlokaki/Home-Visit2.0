import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Group } from './Group';
import { Site } from './Site';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ name: 'user_display_name' })
  userDisplayName!: string;

  @Column({ name: 'group_id' })
  groupId!: number;

  @ManyToOne(() => Group, (group) => group.users)
  @JoinColumn({ name: 'group_id' })
  group!: Group;

  @OneToMany(() => Site, (site) => site.user)
  sites!: Site[];
}

