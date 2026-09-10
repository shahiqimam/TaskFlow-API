import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskPriority } from '../common/enums/task-priority.enum';
import { TaskStatus } from '../common/enums/task-status.enum';
import { ProjectsService } from '../projects/projects.service';
import { SafeUser } from '../users/user.types';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './task.entity';

const sortableColumns: Record<string, string> = {
  createdAt: 'task.createdAt',
  updatedAt: 'task.updatedAt',
  dueDate: 'task.dueDate',
  title: 'task.title',
  status: 'task.status',
  priority: 'task.priority',
};

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(projectId: string, dto: CreateTaskDto, user: SafeUser): Promise<Task> {
    await this.projectsService.assertProjectAccess(projectId, user);
    if (dto.assigneeId) {
      await this.projectsService.assertUserIsProjectMember(projectId, dto.assigneeId);
    }

    return this.tasksRepository.save(
      this.tasksRepository.create({
        title: dto.title,
        description: dto.description ?? null,
        status: dto.status ?? TaskStatus.TODO,
        priority: dto.priority ?? TaskPriority.MEDIUM,
        projectId,
        assigneeId: dto.assigneeId ?? null,
        createdById: user.id,
        dueDate: dto.dueDate ?? null,
      }),
    );
  }

  async findProjectTasks(projectId: string, query: TaskQueryDto, user: SafeUser) {
    await this.projectsService.assertProjectAccess(projectId, user);

    const page = query.page;
    const limit = query.limit;
    const builder = this.tasksRepository
      .createQueryBuilder('task')
      .where('task.projectId = :projectId', { projectId });

    if (query.status) {
      builder.andWhere('task.status = :status', { status: query.status });
    }
    if (query.priority) {
      builder.andWhere('task.priority = :priority', { priority: query.priority });
    }
    if (query.assignee) {
      builder.andWhere('task.assigneeId = :assigneeId', { assigneeId: query.assignee });
    }
    if (query.title) {
      builder.andWhere('LOWER(task.title) LIKE :title', {
        title: `%${query.title.toLowerCase()}%`,
      });
    }

    const [data, total] = await builder
      .orderBy(sortableColumns[query.sortBy], query.order)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: SafeUser): Promise<Task> {
    const task = await this.getTaskOrThrow(id);
    await this.projectsService.assertProjectAccess(task.projectId, user);
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, user: SafeUser): Promise<Task> {
    const task = await this.getTaskOrThrow(id);
    await this.projectsService.assertProjectAccess(task.projectId, user);
    if (dto.assigneeId) {
      await this.projectsService.assertUserIsProjectMember(task.projectId, dto.assigneeId);
    }

    Object.assign(task, {
      title: dto.title ?? task.title,
      description: dto.description !== undefined ? dto.description : task.description,
      status: dto.status ?? task.status,
      priority: dto.priority ?? task.priority,
      assigneeId: dto.assigneeId !== undefined ? dto.assigneeId : task.assigneeId,
      dueDate: dto.dueDate !== undefined ? dto.dueDate : task.dueDate,
    });

    return this.tasksRepository.save(task);
  }

  async remove(id: string, user: SafeUser): Promise<void> {
    const task = await this.getTaskOrThrow(id);
    await this.projectsService.assertProjectAccess(task.projectId, user);
    await this.tasksRepository.remove(task);
  }

  async getStats(projectId: string, user: SafeUser) {
    await this.projectsService.assertProjectAccess(projectId, user);
    const tasks = await this.tasksRepository.find({ where: { projectId } });
    const totalTasks = tasks.length;
    const todo = tasks.filter((task) => task.status === TaskStatus.TODO).length;
    const inProgress = tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length;
    const inReview = tasks.filter((task) => task.status === TaskStatus.IN_REVIEW).length;
    const done = tasks.filter((task) => task.status === TaskStatus.DONE).length;

    return {
      totalTasks,
      todo,
      inProgress,
      inReview,
      done,
      completionPercentage: totalTasks === 0 ? 0 : Math.round((done / totalTasks) * 100),
    };
  }

  async getTaskOrThrow(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }
}
