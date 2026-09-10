import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { paginatedTasksExample, taskExample } from '../common/swagger/api-examples';
import { SafeUser } from '../users/user.types';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('projects/:projectId/tasks')
  @ApiOperation({ summary: 'Create a task in a project' })
  @ApiCreatedResponse({ description: 'Task created.', example: taskExample })
  @ApiForbiddenResponse({ description: 'Current user is not a project member.' })
  create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: SafeUser,
  ) {
    return this.tasksService.create(projectId, dto, user);
  }

  @Get('projects/:projectId/tasks')
  @ApiOperation({ summary: 'List, search, filter, sort, and paginate project tasks' })
  @ApiOkResponse({
    description: 'Filtered and paginated project tasks.',
    example: paginatedTasksExample,
  })
  @ApiForbiddenResponse({ description: 'Current user is not a project member.' })
  findProjectTasks(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: TaskQueryDto,
    @CurrentUser() user: SafeUser,
  ) {
    return this.tasksService.findProjectTasks(projectId, query, user);
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Get a task by id' })
  @ApiOkResponse({ description: 'Requested task.', example: taskExample })
  @ApiForbiddenResponse({ description: 'Current user cannot access this task project.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: SafeUser) {
    return this.tasksService.findOne(id, user);
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiOkResponse({ description: 'Updated task.', example: taskExample })
  @ApiForbiddenResponse({ description: 'Current user cannot access this task project.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: SafeUser,
  ) {
    return this.tasksService.update(id, dto, user);
  }

  @Delete('tasks/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiNoContentResponse({ description: 'Task deleted.' })
  @ApiForbiddenResponse({ description: 'Current user cannot access this task project.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: SafeUser) {
    return this.tasksService.remove(id, user);
  }
}
