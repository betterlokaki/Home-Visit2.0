import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Site } from './Site';

@Entity('statuses')
@Index(['siteId', 'windowStartTime'], { unique: true })
export class Status {
  @PrimaryGeneratedColumn({ name: 'status_id' })
  statusId!: number;

  @Column({ name: 'site_id' })
  siteId!: number;

  @Column({ name: 'seen_status', type: 'enum', enum: ['Seen', 'Partial Seen', 'Not Seen'], enumName: 'seen_status_enum' })
  seenStatus!: 'Seen' | 'Partial Seen' | 'Not Seen';

  @Column({ type: 'timestamp' })
  time!: Date;

  @Column({ name: 'window_start_time', type: 'timestamp' })
  windowStartTime!: Date;

  @ManyToOne(() => Site, (site) => site.statuses)
  @JoinColumn({ name: 'site_id' })
  site!: Site;
}

