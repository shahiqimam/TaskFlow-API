import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TaskPriority } from '../src/common/enums/task-priority.enum';
import { TaskStatus } from '../src/common/enums/task-status.enum';

describe('TaskFlow API (e2e)', () => {
  jest.setTimeout(30_000);

  let app: INestApplication;
  let ownerToken: string;
  let outsiderToken: string;
  let projectId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_TYPE = 'pg-mem';
    process.env.JWT_SECRET = 'test_secret_with_enough_length';

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('registers and logs in users', async () => {
    const owner = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: 'Alex Morgan',
        email: 'alex@example.com',
        password: 'StrongPassword123!',
      })
      .expect(201);

    expect(owner.body.user.email).toBe('alex@example.com');
    expect(owner.body.user.passwordHash).toBeUndefined();
    ownerToken = owner.body.accessToken;

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: 'Taylor Smith',
        email: 'taylor@example.com',
        password: 'StrongPassword123!',
      })
      .expect(201);

    const outsider = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'taylor@example.com', password: 'StrongPassword123!' })
      .expect(201);
    outsiderToken = outsider.body.accessToken;
  });

  it('rejects unauthenticated protected routes', async () => {
    await request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
  });

  it('creates projects and rejects access by non-members', async () => {
    const project = await request(app.getHttpServer())
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Website Redesign', description: 'Refresh launch site.' })
      .expect(201);

    projectId = project.body.id;

    await request(app.getHttpServer())
      .get(`/api/v1/projects/${projectId}`)
      .set('Authorization', `Bearer ${outsiderToken}`)
      .expect(403);
  });

  it('creates tasks and supports filtering and pagination', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Draft API documentation',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Clean seed script',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(
        `/api/v1/projects/${projectId}/tasks?status=${TaskStatus.IN_PROGRESS}&priority=${TaskPriority.HIGH}&page=1&limit=10&sortBy=createdAt&order=DESC`,
      )
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe('Draft API documentation');
    expect(response.body.meta).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
  });
});
