import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Group } from './Group';
import { User } from './User';
import { Status } from './Status';

@Entity('sites')
export class Site {
  @PrimaryGeneratedColumn({ name: 'site_id' })
  siteId!: number;

  @Column({ name: 'site_name', unique: true })
  siteName!: string;

  @Column({ name: 'site_display_name' })
  siteDisplayName!: string;

  @Column({ name: 'site_group_id' })
  siteGroupId!: number;

  @Column({ name: 'site_user_id' })
  siteUserId!: number;

  @Column({ name: 'refresh_seconds', type: 'integer', nullable: true })
  refreshSeconds!: number | null;

  @Column({ type: 'geometry', spatialFeatureType: 'Polygon', srid: 4326, nullable: true })
  geometry!: string | null;

  @ManyToOne(() => Group, (group) => group.sites)
  @JoinColumn({ name: 'site_group_id' })
  group!: Group;

  @ManyToOne(() => User, (user) => user.sites)
  @JoinColumn({ name: 'site_user_id' })
  user!: User;

  @OneToMany(() => Status, (status) => status.site)
  statuses!: Status[];
}

