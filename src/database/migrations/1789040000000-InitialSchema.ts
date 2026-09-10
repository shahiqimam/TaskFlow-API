import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1789040000000 implements MigrationInterface {
  name = 'InitialSchema1789040000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(120) NOT NULL,
        "email" varchar(255) NOT NULL,
        "password_hash" varchar NOT NULL,
        "role" varchar(20) NOT NULL DEFAULT 'USER',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "CHK_users_role" CHECK ("role" IN ('ADMIN', 'USER'))
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(160) NOT NULL,
        "description" text,
        "owner_id" uuid NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_projects_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "project_members" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "project_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "member_role" varchar(20) NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_project_members_project_user" UNIQUE ("project_id", "user_id"),
        CONSTRAINT "CHK_project_members_role" CHECK ("member_role" IN ('OWNER', 'MEMBER')),
        CONSTRAINT "FK_project_members_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_project_members_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" varchar(180) NOT NULL,
        "description" text,
        "status" varchar(20) NOT NULL DEFAULT 'TODO',
        "priority" varchar(20) NOT NULL DEFAULT 'MEDIUM',
        "project_id" uuid NOT NULL,
        "assignee_id" uuid,
        "created_by_id" uuid NOT NULL,
        "due_date" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_tasks_status" CHECK ("status" IN ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE')),
        CONSTRAINT "CHK_tasks_priority" CHECK ("priority" IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
        CONSTRAINT "FK_tasks_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tasks_assignee" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tasks_created_by" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "content" text NOT NULL,
        "task_id" uuid NOT NULL,
        "author_id" uuid NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "FK_comments_task" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comments_author" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_projects_owner_id" ON "projects" ("owner_id")');
    await queryRunner.query(
      'CREATE INDEX "IDX_project_members_project_id" ON "project_members" ("project_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_project_members_user_id" ON "project_members" ("user_id")',
    );
    await queryRunner.query('CREATE INDEX "IDX_tasks_status" ON "tasks" ("status")');
    await queryRunner.query('CREATE INDEX "IDX_tasks_priority" ON "tasks" ("priority")');
    await queryRunner.query('CREATE INDEX "IDX_tasks_project_id" ON "tasks" ("project_id")');
    await queryRunner.query('CREATE INDEX "IDX_tasks_assignee_id" ON "tasks" ("assignee_id")');
    await queryRunner.query('CREATE INDEX "IDX_tasks_created_by_id" ON "tasks" ("created_by_id")');
    await queryRunner.query('CREATE INDEX "IDX_comments_task_id" ON "comments" ("task_id")');
    await queryRunner.query('CREATE INDEX "IDX_comments_author_id" ON "comments" ("author_id")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_comments_author_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_comments_task_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_tasks_created_by_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_tasks_assignee_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_tasks_project_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_tasks_priority"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_tasks_status"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_project_members_user_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_project_members_project_id"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_projects_owner_id"');
    await queryRunner.query('DROP TABLE "comments"');
    await queryRunner.query('DROP TABLE "tasks"');
    await queryRunner.query('DROP TABLE "project_members"');
    await queryRunner.query('DROP TABLE "projects"');
    await queryRunner.query('DROP TABLE "users"');
  }
}
