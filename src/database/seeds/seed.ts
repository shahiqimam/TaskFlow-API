import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import dataSource from '../data-source';
import { Comment } from '../../comments/comment.entity';
import { ProjectMemberRole } from '../../common/enums/project-member-role.enum';
import { TaskPriority } from '../../common/enums/task-priority.enum';
import { TaskStatus } from '../../common/enums/task-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { ProjectMember } from '../../projects/project-member.entity';
import { Project } from '../../projects/project.entity';
import { Task } from '../../tasks/task.entity';
import { User } from '../../users/user.entity';

async function seed() {
  await dataSource.initialize();

  await dataSource.query(
    'TRUNCATE TABLE "comments", "tasks", "project_members", "projects", "users" RESTART IDENTITY CASCADE',
  );

  const userRepository = dataSource.getRepository(User);
  const projectRepository = dataSource.getRepository(Project);
  const memberRepository = dataSource.getRepository(ProjectMember);
  const taskRepository = dataSource.getRepository(Task);
  const commentRepository = dataSource.getRepository(Comment);
  const passwordHash = await bcrypt.hash('Example123!', 12);

  const [, alex, jordan, taylor] = await userRepository.save([
    userRepository.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash,
      role: UserRole.ADMIN,
    }),
    userRepository.create({
      name: 'Alex Morgan',
      email: 'alex@example.com',
      passwordHash,
      role: UserRole.USER,
    }),
    userRepository.create({
      name: 'Jordan Lee',
      email: 'jordan@example.com',
      passwordHash,
      role: UserRole.USER,
    }),
    userRepository.create({
      name: 'Taylor Smith',
      email: 'taylor@example.com',
      passwordHash,
      role: UserRole.USER,
    }),
  ]);

  const [website, mobile] = await projectRepository.save([
    projectRepository.create({
      name: 'Website Redesign',
      description: 'Plan and deliver a clean public website refresh.',
      ownerId: alex.id,
    }),
    projectRepository.create({
      name: 'Mobile App Launch',
      description: 'Coordinate backend tasks for the first mobile release.',
      ownerId: jordan.id,
    }),
  ]);

  await memberRepository.save([
    memberRepository.create({
      projectId: website.id,
      userId: alex.id,
      memberRole: ProjectMemberRole.OWNER,
    }),
    memberRepository.create({
      projectId: website.id,
      userId: jordan.id,
      memberRole: ProjectMemberRole.MEMBER,
    }),
    memberRepository.create({
      projectId: mobile.id,
      userId: jordan.id,
      memberRole: ProjectMemberRole.OWNER,
    }),
    memberRepository.create({
      projectId: mobile.id,
      userId: taylor.id,
      memberRole: ProjectMemberRole.MEMBER,
    }),
  ]);

  const [taskOne, taskTwo, taskThree] = await taskRepository.save([
    taskRepository.create({
      title: 'Create endpoint inventory',
      description: 'List public endpoints and request examples.',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      projectId: website.id,
      assigneeId: jordan.id,
      createdById: alex.id,
    }),
    taskRepository.create({
      title: 'Write authentication docs',
      description: 'Explain JWT login flow and protected routes.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      projectId: website.id,
      assigneeId: alex.id,
      createdById: alex.id,
    }),
    taskRepository.create({
      title: 'Review task filtering',
      description: 'Verify pagination and search behavior.',
      status: TaskStatus.TODO,
      priority: TaskPriority.URGENT,
      projectId: mobile.id,
      assigneeId: taylor.id,
      createdById: jordan.id,
    }),
  ]);

  await commentRepository.save([
    commentRepository.create({
      content: 'Endpoint list is ready for review.',
      taskId: taskOne.id,
      authorId: jordan.id,
    }),
    commentRepository.create({
      content: 'Please include one authenticated curl example.',
      taskId: taskTwo.id,
      authorId: alex.id,
    }),
    commentRepository.create({
      content: 'Filtering should cover status and priority.',
      taskId: taskThree.id,
      authorId: taylor.id,
    }),
  ]);

  console.log('Seed data created.');
  console.log('Admin: admin@example.com / Example123!');
  console.log('User: alex@example.com / Example123!');
  await dataSource.destroy();
}

seed().catch(async (error) => {
  console.error(error);
  await dataSource.destroy();
  process.exit(1);
});
