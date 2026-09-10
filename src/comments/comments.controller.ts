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
import { commentExample } from '../common/swagger/api-examples';
import { SafeUser } from '../users/user.types';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('tasks/:taskId/comments')
  @ApiOperation({ summary: 'Create a comment on a task' })
  @ApiCreatedResponse({ description: 'Comment created.', example: commentExample })
  @ApiForbiddenResponse({ description: 'Current user cannot access this task project.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  create(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: SafeUser,
  ) {
    return this.commentsService.create(taskId, dto, user);
  }

  @Get('tasks/:taskId/comments')
  @ApiOperation({ summary: 'List comments for a task' })
  @ApiOkResponse({ description: 'Comments for the requested task.', example: [commentExample] })
  @ApiForbiddenResponse({ description: 'Current user cannot access this task project.' })
  @ApiNotFoundResponse({ description: 'Task not found.' })
  findForTask(@Param('taskId', ParseUUIDPipe) taskId: string, @CurrentUser() user: SafeUser) {
    return this.commentsService.findForTask(taskId, user);
  }

  @Patch('comments/:id')
  @ApiOperation({ summary: 'Update an owned comment, or any comment as admin' })
  @ApiOkResponse({ description: 'Updated comment.', example: commentExample })
  @ApiForbiddenResponse({ description: 'Only the comment author or an admin may update it.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: SafeUser,
  ) {
    return this.commentsService.update(id, dto, user);
  }

  @Delete('comments/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an owned comment, or any comment as admin' })
  @ApiNoContentResponse({ description: 'Comment deleted.' })
  @ApiForbiddenResponse({ description: 'Only the comment author or an admin may delete it.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: SafeUser) {
    return this.commentsService.remove(id, user);
  }
}
