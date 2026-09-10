import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Comment } from '../comments/comment.entity';
import { ProjectMember } from '../projects/project-member.entity';
import { Project } from '../projects/project.entity';
import { Task } from '../tasks/task.entity';
import { User } from '../users/user.entity';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER ?? 'taskflow',
  password: process.env.DATABASE_PASSWORD ?? 'change_me',
  database: process.env.DATABASE_NAME ?? 'taskflow',
  entities: [User, Project, ProjectMember, Task, Comment],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  synchronize: false,
});
