import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskPriority } from '../common/enums/task-priority.enum';
import { TaskStatus } from '../common/enums/task-status.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { ProjectsService } from '../projects/projects.service';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  const user = {
    id: 'user-id',
    name: 'Alex',
    email: 'alex@example.com',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const projectsService = {
    assertProjectAccess: jest.fn(),
    assertUserIsProjectMember: jest.fn(),
  };
  const tasksRepository = {
    create: jest.fn((value) => value),
    save: jest.fn((value) => Promise.resolve({ id: 'task-id', ...value })),
    createQueryBuilder: jest.fn(),
  };
  let service: TasksService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: tasksRepository },
        { provide: ProjectsService, useValue: projectsService },
      ],
    }).compile();

    service = moduleRef.get(TasksService);
  });

  it('creates tasks only after project access and assignee membership checks', async () => {
    await service.create(
      'project-id',
      {
        title: 'Draft API docs',
        priority: TaskPriority.HIGH,
        status: TaskStatus.TODO,
        assigneeId: 'assignee-id',
      },
      user,
    );

    expect(projectsService.assertProjectAccess).toHaveBeenCalledWith('project-id', user);
    expect(projectsService.assertUserIsProjectMember).toHaveBeenCalledWith(
      'project-id',
      'assignee-id',
    );
    expect(tasksRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'project-id',
        createdById: user.id,
      }),
    );
  });

  it('returns paginated filtered task results', async () => {
    const builder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'task-id' }], 1]),
    };
    tasksRepository.createQueryBuilder.mockReturnValue(builder);

    const result = await service.findProjectTasks(
      'project-id',
      {
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        assignee: 'assignee-id',
        title: 'api',
        page: 2,
        limit: 10,
        sortBy: 'createdAt',
        order: 'DESC',
      },
      user,
    );

    expect(builder.andWhere).toHaveBeenCalledTimes(4);
    expect(builder.skip).toHaveBeenCalledWith(10);
    expect(result.meta).toEqual({ page: 2, limit: 10, total: 1, totalPages: 1 });
  });
});
