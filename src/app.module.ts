import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { Comment } from './comments/comment.entity';
import { HealthController } from './health.controller';
import { ProjectMember } from './projects/project-member.entity';
import { Project } from './projects/project.entity';
import { ProjectsModule } from './projects/projects.module';
import { Task } from './tasks/task.entity';
import { TasksModule } from './tasks/tasks.module';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        if (configService.get<string>('DATABASE_TYPE') === 'pg-mem') {
          return {
            type: 'postgres',
            database: 'taskflow_test',
            host: 'localhost',
            username: 'test',
            password: 'test',
            entities: [User, Project, ProjectMember, Task, Comment],
            synchronize: true,
            retryAttempts: 0,
          };
        }

        return {
          type: 'postgres',
          host: configService.get<string>('DATABASE_HOST', 'localhost'),
          port: configService.get<number>('DATABASE_PORT', 5432),
          username: configService.get<string>('DATABASE_USER', 'taskflow'),
          password: configService.get<string>('DATABASE_PASSWORD', 'change_me'),
          database: configService.get<string>('DATABASE_NAME', 'taskflow'),
          autoLoadEntities: true,
          synchronize: false,
        };
      },
      dataSourceFactory: async (options?: DataSourceOptions) => {
        if (!options) {
          throw new Error('Missing TypeORM options');
        }

        if (process.env.DATABASE_TYPE === 'pg-mem') {
          const pgMem = await import('pg-mem');
          const pgMemApi = pgMem.default ?? pgMem;
          const db = pgMemApi.newDb({ autoCreateForeignKeyIndices: true });
          db.public.registerFunction({
            name: 'current_database',
            returns: pgMemApi.DataType.text,
            implementation: () => 'taskflow_test',
          });
          db.public.registerFunction({
            name: 'version',
            returns: pgMemApi.DataType.text,
            implementation: () => 'PostgreSQL test database',
          });
          db.public.registerFunction({
            name: 'uuid_generate_v4',
            returns: pgMemApi.DataType.uuid,
            implementation: () => randomUUID(),
            impure: true,
          });
          const dataSource = db.adapters.createTypeormDataSource({
            ...options,
            type: 'postgres',
            entities: [User, Project, ProjectMember, Task, Comment],
          });
          await dataSource.initialize();
          return dataSource;
        }

        return new DataSource(options).initialize();
      },
    }),
    UsersModule,
    AuthModule,
    ProjectsModule,
    TasksModule,
    CommentsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
