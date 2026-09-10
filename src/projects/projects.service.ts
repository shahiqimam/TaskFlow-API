import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProjectMemberRole } from '../common/enums/project-member-role.enum';
import { TaskStatus } from '../common/enums/task-status.enum';
import { Task } from '../tasks/task.entity';
import { SafeUser } from '../users/user.types';
import { User } from '../users/user.entity';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectMember } from './project-member.entity';
import { Project } from './project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly membersRepository: Repository<ProjectMember>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateProjectDto, user: SafeUser): Promise<Project> {
    return this.dataSource.transaction(async (manager) => {
      const project = await manager.getRepository(Project).save(
        manager.getRepository(Project).create({
          name: dto.name,
          description: dto.description ?? null,
          ownerId: user.id,
        }),
      );

      await manager.getRepository(ProjectMember).save(
        manager.getRepository(ProjectMember).create({
          projectId: project.id,
          userId: user.id,
          memberRole: ProjectMemberRole.OWNER,
        }),
      );

      return project;
    });
  }

  async findAccessible(user: SafeUser): Promise<Project[]> {
    return this.projectsRepository
      .createQueryBuilder('project')
      .leftJoin('project.members', 'member')
      .where('project.ownerId = :userId', { userId: user.id })
      .orWhere('member.userId = :userId', { userId: user.id })
      .orderBy('project.createdAt', 'DESC')
      .distinct(true)
      .getMany();
  }

  async findOne(id: string, user: SafeUser): Promise<Project> {
    const project = await this.getProjectOrThrow(id);
    await this.assertProjectAccess(id, user);
    return project;
  }

  async update(id: string, dto: UpdateProjectDto, user: SafeUser): Promise<Project> {
    const project = await this.assertProjectOwner(id, user);
    if (dto.name !== undefined) {
      project.name = dto.name;
    }
    if (dto.description !== undefined) {
      project.description = dto.description;
    }
    return this.projectsRepository.save(project);
  }

  async remove(id: string, user: SafeUser): Promise<void> {
    const project = await this.assertProjectOwner(id, user);
    await this.projectsRepository.remove(project);
  }

  async listMembers(projectId: string, user: SafeUser) {
    await this.assertProjectAccess(projectId, user);
    const members = await this.membersRepository.find({
      where: { projectId },
      relations: { user: true },
      order: { createdAt: 'ASC' },
    });

    return members.map((member) => ({
      id: member.id,
      projectId: member.projectId,
      userId: member.userId,
      memberRole: member.memberRole,
      createdAt: member.createdAt,
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.user.role,
        createdAt: member.user.createdAt,
        updatedAt: member.user.updatedAt,
      },
    }));
  }

  async addMember(projectId: string, dto: AddMemberDto, user: SafeUser) {
    await this.assertProjectOwner(projectId, user);

    const targetUser = await this.usersRepository.findOne({ where: { id: dto.userId } });
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.membersRepository.findOne({
      where: { projectId, userId: dto.userId },
    });
    if (existing) {
      throw new ConflictException('User is already a project member');
    }

    return this.membersRepository.save(
      this.membersRepository.create({
        projectId,
        userId: dto.userId,
        memberRole: dto.memberRole ?? ProjectMemberRole.MEMBER,
      }),
    );
  }

  async removeMember(projectId: string, userId: string, user: SafeUser): Promise<void> {
    const project = await this.assertProjectOwner(projectId, user);
    if (project.ownerId === userId) {
      throw new BadRequestException('Project owner cannot be removed');
    }

    const member = await this.membersRepository.findOne({ where: { projectId, userId } });
    if (!member) {
      throw new NotFoundException('Project member not found');
    }

    await this.membersRepository.remove(member);
  }

  async getStats(projectId: string, user: SafeUser) {
    await this.assertProjectAccess(projectId, user);
    const tasks = await this.dataSource.getRepository(Task).find({ where: { projectId } });
    const totalTasks = tasks.length;
    const done = tasks.filter((task) => task.status === TaskStatus.DONE).length;

    return {
      totalTasks,
      todo: tasks.filter((task) => task.status === TaskStatus.TODO).length,
      inProgress: tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length,
      inReview: tasks.filter((task) => task.status === TaskStatus.IN_REVIEW).length,
      done,
      completionPercentage: totalTasks === 0 ? 0 : Math.round((done / totalTasks) * 100),
    };
  }

  async assertProjectAccess(projectId: string, user: SafeUser): Promise<Project> {
    const project = await this.getProjectOrThrow(projectId);
    const member = await this.membersRepository.findOne({
      where: { projectId, userId: user.id },
    });

    if (!member && project.ownerId !== user.id) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async assertProjectOwner(projectId: string, user: SafeUser): Promise<Project> {
    const project = await this.getProjectOrThrow(projectId);
    if (project.ownerId !== user.id) {
      throw new ForbiddenException('Only the project owner can perform this action');
    }
    return project;
  }

  async assertUserIsProjectMember(projectId: string, userId: string): Promise<void> {
    const member = await this.membersRepository.findOne({ where: { projectId, userId } });
    if (!member) {
      throw new BadRequestException('Task assignee must belong to the project');
    }
  }

  private async getProjectOrThrow(id: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }
}
