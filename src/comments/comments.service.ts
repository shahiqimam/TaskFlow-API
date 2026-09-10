import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import { TasksService } from '../tasks/tasks.service';
import { SafeUser } from '../users/user.types';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly tasksService: TasksService,
  ) {}

  async create(taskId: string, dto: CreateCommentDto, user: SafeUser): Promise<Comment> {
    await this.tasksService.findOne(taskId, user);
    return this.commentsRepository.save(
      this.commentsRepository.create({
        content: dto.content,
        taskId,
        authorId: user.id,
      }),
    );
  }

  async findForTask(taskId: string, user: SafeUser): Promise<Comment[]> {
    await this.tasksService.findOne(taskId, user);
    return this.commentsRepository.find({
      where: { taskId },
      order: { createdAt: 'ASC' },
    });
  }

  async update(id: string, dto: UpdateCommentDto, user: SafeUser): Promise<Comment> {
    const comment = await this.getCommentOrThrow(id);
    this.assertCanMutateComment(comment, user);
    comment.content = dto.content ?? comment.content;
    return this.commentsRepository.save(comment);
  }

  async remove(id: string, user: SafeUser): Promise<void> {
    const comment = await this.getCommentOrThrow(id);
    this.assertCanMutateComment(comment, user);
    await this.commentsRepository.remove(comment);
  }

  private async getCommentOrThrow(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  private assertCanMutateComment(comment: Comment, user: SafeUser): void {
    if (comment.authorId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can edit or delete only your own comments');
    }
  }
}
