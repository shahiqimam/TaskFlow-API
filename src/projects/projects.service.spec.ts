import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/user.entity';
import { ProjectMember } from './project-member.entity';
import { Project } from './project.entity';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  const user = {
    id: 'user-id',
    name: 'Alex',
    email: 'alex@example.com',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const projectsRepository = {
    findOne: jest.fn(),
  };
  const membersRepository = {
    findOne: jest.fn(),
  };
  const usersRepository = {};
  const dataSource = { transaction: jest.fn(), getRepository: jest.fn() };
  let service: ProjectsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: projectsRepository },
        { provide: getRepositoryToken(ProjectMember), useValue: membersRepository },
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = moduleRef.get(ProjectsService);
  });

  it('allows a project member to access a project', async () => {
    projectsRepository.findOne.mockResolvedValue({ id: 'project-id', ownerId: 'owner-id' });
    membersRepository.findOne.mockResolvedValue({ projectId: 'project-id', userId: user.id });

    await expect(service.assertProjectAccess('project-id', user)).resolves.toEqual(
      expect.objectContaining({ id: 'project-id' }),
    );
  });

  it('rejects users who are not project members or owners', async () => {
    projectsRepository.findOne.mockResolvedValue({ id: 'project-id', ownerId: 'owner-id' });
    membersRepository.findOne.mockResolvedValue(null);

    await expect(service.assertProjectAccess('project-id', user)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
