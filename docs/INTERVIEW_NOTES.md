# Interview Notes

## Node.js

Simple answer: Node.js runs JavaScript on the server.

Technical answer: Node.js is a runtime built on the V8 engine with an event-driven, non-blocking I/O model.

How this project uses it: The NestJS API runs on Node.js and serves HTTP requests.

Likely interview question: Why is Node.js a good fit for APIs with many I/O operations?

## NestJS

Simple answer: NestJS is a structured framework for building Node.js backends.

Technical answer: It organizes code into modules, controllers, providers, guards, pipes, and dependency-injected services.

How this project uses it: The app separates auth, users, projects, tasks, comments, and database concerns into modules.

Likely interview question: What problem does NestJS solve compared with plain Express?

## Module

Simple answer: A module groups related backend code.

Technical answer: A NestJS module declares providers, controllers, imports, and exports for a feature boundary.

How this project uses it: `ProjectsModule` owns project controllers/services and exports `ProjectsService` for task authorization.

Likely interview question: When should one NestJS module import another?

## Controller

Simple answer: A controller handles HTTP routes.

Technical answer: It maps request methods and paths to handler methods, then delegates business logic to services.

How this project uses it: `TasksController` maps task endpoints and passes validated input to `TasksService`.

Likely interview question: Why should controllers stay thin?

## Service

Simple answer: A service contains business logic.

Technical answer: Services are injectable providers that coordinate repositories, validation decisions, and authorization rules.

How this project uses it: `ProjectsService` enforces project access and owner-only member changes.

Likely interview question: What belongs in a service instead of a controller?

## Dependency Injection

Simple answer: Dependency injection gives classes what they need instead of creating dependencies manually.

Technical answer: NestJS resolves providers from its container based on constructor types and module metadata.

How this project uses it: Services receive repositories, config, JWT helpers, and other services through constructors.

Likely interview question: How does dependency injection help with testing?

## DTO

Simple answer: A DTO defines the shape of incoming data.

Technical answer: Data Transfer Objects pair TypeScript classes with validation decorators for runtime request checks.

How this project uses it: Register, project, task, comment, and query inputs are validated by DTOs.

Likely interview question: Why validate DTOs at the API boundary?

## Entity

Simple answer: An entity maps a TypeScript class to a database table.

Technical answer: TypeORM entity decorators define columns, relations, indexes, and primary keys.

How this project uses it: `Task` maps to the `tasks` table and relates to projects, users, and comments.

Likely interview question: How are one-to-many and many-to-one relationships represented?

## TypeORM

Simple answer: TypeORM connects TypeScript code to SQL tables.

Technical answer: It provides repositories, query builders, entities, migrations, and relation mapping.

How this project uses it: Services use repositories for CRUD and query builders for task filtering.

Likely interview question: When would you use a query builder instead of `find`?

## PostgreSQL

Simple answer: PostgreSQL is the relational database for the API.

Technical answer: It provides tables, constraints, indexes, foreign keys, transactions, and SQL querying.

How this project uses it: Projects, members, tasks, comments, and users are stored in related PostgreSQL tables.

Likely interview question: Why use a relational database for project/task data?

## REST API

Simple answer: A REST API exposes resources over HTTP.

Technical answer: REST-style APIs use URLs for resources, HTTP verbs for actions, and status codes for outcomes.

How this project uses it: `/projects`, `/tasks/:id`, and `/comments/:id` expose resource operations.

Likely interview question: What makes an endpoint RESTful?

## GET vs POST vs PATCH vs DELETE

Simple answer: GET reads, POST creates, PATCH updates, and DELETE removes.

Technical answer: HTTP methods communicate intent and expected behavior to clients, servers, caches, and tools.

How this project uses it: Project CRUD maps directly to these methods.

Likely interview question: Why use PATCH instead of POST for updates?

## Authentication vs Authorization

Simple answer: Authentication asks who you are; authorization asks what you may do.

Technical answer: Authentication verifies identity, while authorization checks permissions for a specific action or resource.

How this project uses it: JWT guards authenticate; services enforce ownership and membership rules.

Likely interview question: Can a user be authenticated but unauthorized?

## JWT

Simple answer: A JWT is a signed token used to authenticate API requests.

Technical answer: It contains claims and is verified with a secret or key before trusting its subject.

How this project uses it: Login/register issue access tokens used in `Authorization: Bearer <token>`.

Likely interview question: What should not be stored in a JWT?

## Password Hashing

Simple answer: Password hashing stores a one-way transformed password instead of the original.

Technical answer: bcrypt salts and hashes passwords with configurable work cost, making direct password recovery impractical.

How this project uses it: `AuthService` hashes registration passwords and compares hashes on login.

Likely interview question: Why is encryption not the same as password hashing?

## Database Migration

Simple answer: A migration changes the database schema in a tracked way.

Technical answer: Migrations are versioned scripts with `up` and `down` methods for applying and reverting schema changes.

How this project uses it: `src/database/migrations/1789040000000-InitialSchema.ts` creates the initial schema.

Likely interview question: Why not use `synchronize: true` in production?

## Docker

Simple answer: Docker packages software so it runs consistently.

Technical answer: It builds images and runs isolated containers with defined filesystem, environment, and process configuration.

How this project uses it: The API and PostgreSQL run together through Docker Compose.

Likely interview question: How does Docker improve local development?

## Image vs Container

Simple answer: An image is the blueprint; a container is a running instance.

Technical answer: Images are immutable layers, while containers add runtime state, networking, and processes.

How this project uses it: `Dockerfile` builds the API image; Compose runs it as the `api` container.

Likely interview question: Can multiple containers run from one image?

## Dockerfile vs Docker Compose

Simple answer: A Dockerfile builds one image; Compose runs multiple services together.

Technical answer: Dockerfiles define build steps, while Compose defines services, networks, volumes, dependencies, and environment.

How this project uses it: `Dockerfile` builds the NestJS API, and `docker-compose.yml` runs API plus PostgreSQL.

Likely interview question: Why does the database belong in Compose instead of the API Dockerfile?

## Why `postgres` Is Used Instead of `localhost`

Simple answer: Inside Docker Compose, services reach each other by service name.

Technical answer: `localhost` inside the API container points to the API container itself, not the database container.

How this project uses it: `DATABASE_HOST=postgres` lets the API connect to the Compose PostgreSQL service.

Likely interview question: Why does `localhost` work outside Docker but fail between containers?

## What Happens When `GET /api/v1/projects/:id` Is Called

Simple answer: The API verifies the token, validates the id, checks project access, then returns the project.

Technical answer: NestJS routes to `ProjectsController.findOne`, `JwtAuthGuard` authenticates the user, `ParseUUIDPipe` validates the id, and `ProjectsService.findOne` enforces ownership/membership before reading the project through TypeORM.

How this project uses it: The endpoint is implemented in `src/projects/projects.controller.ts` and `src/projects/projects.service.ts`.

Likely interview question: Where is project authorization enforced and why?
