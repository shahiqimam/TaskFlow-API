# Request Lifecycle

This walkthrough follows:

```http
PATCH /api/v1/tasks/{taskId}
Authorization: Bearer <token>
```

## Flow

```text
HTTP request
    ↓
NestJS receives request
    ↓
JWT guard verifies token
    ↓
route/body validation
    ↓
controller
    ↓
service
    ↓
authorization check
    ↓
TypeORM
    ↓
PostgreSQL
    ↓
updated result
    ↓
JSON response
```

## What Happens

The request enters the NestJS HTTP server created in `src/main.ts`. The global prefix makes the route start with `/api/v1`.

`JwtAuthGuard` in `src/auth/guards/jwt-auth.guard.ts` uses the JWT strategy in `src/auth/strategies/jwt.strategy.ts`. The strategy verifies the bearer token, loads the user through `src/users/users.service.ts`, and attaches a safe user object to the request.

The global `ValidationPipe` in `src/main.ts` validates route parameters and the body DTO. For this endpoint, `src/tasks/dto/update-task.dto.ts` controls allowed body fields.

`TasksController.update` in `src/tasks/tasks.controller.ts` receives the UUID `id`, validated body, and current user from `src/common/decorators/current-user.decorator.ts`.

`TasksService.update` in `src/tasks/tasks.service.ts` loads the task. If the task does not exist, it throws `404 Not Found`.

The service calls `ProjectsService.assertProjectAccess` in `src/projects/projects.service.ts`. This verifies the current user owns or belongs to the task's project. If not, the request fails with `403 Forbidden`.

If `assigneeId` is being changed, `ProjectsService.assertUserIsProjectMember` verifies the assignee belongs to the same project.

TypeORM persists the updated `Task` entity from `src/tasks/task.entity.ts` to PostgreSQL.

NestJS serializes the updated task as JSON. If an exception occurs, `src/common/filters/http-exception.filter.ts` returns the consistent error structure with status code, message, path, and timestamp.
