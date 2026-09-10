import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ProjectMemberRole } from '../common/enums/project-member-role.enum';
import { User } from '../users/user.entity';
import { Project } from './project.entity';

@Entity('project_members')
@Unique('UQ_project_members_project_user', ['projectId', 'userId'])
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'project_id' })
  projectId: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'member_role', type: 'varchar', length: 20 })
  memberRole: ProjectMemberRole;

  @ManyToOne(() => Project, (project) => project.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
