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
  ApiConflictResponse,
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
import {
  projectExample,
  projectMemberExample,
  projectStatsExample,
} from '../common/swagger/api-examples';
import { SafeUser } from '../users/user.types';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a project' })
  @ApiCreatedResponse({ description: 'Project created.', example: projectExample })
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: SafeUser) {
    return this.projectsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List projects visible to the current user' })
  @ApiOkResponse({
    description: 'Projects visible to the current user.',
    example: [projectExample],
  })
  findAll(@CurrentUser() user: SafeUser) {
    return this.projectsService.findAccessible(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by id' })
  @ApiOkResponse({ description: 'Requested project.', example: projectExample })
  @ApiForbiddenResponse({ description: 'Current user is not a project member.' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: SafeUser) {
    return this.projectsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project owned by the current user' })
  @ApiOkResponse({ description: 'Updated project.', example: projectExample })
  @ApiForbiddenResponse({ description: 'Only the project owner may update this project.' })
  @ApiNotFoundResponse({ description: 'Project not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: SafeUser,
  ) {
    return this.projectsService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a project owned by the current user' })
  @ApiNoContentResponse({ description: 'Project deleted.' })
  @ApiForbiddenResponse({ description: 'Only the project owner may delete this project.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: SafeUser) {
    return this.projectsService.remove(id, user);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List project members' })
  @ApiOkResponse({ description: 'Project members.', example: [projectMemberExample] })
  @ApiForbiddenResponse({ description: 'Current user is not a project member.' })
  listMembers(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: SafeUser) {
    return this.projectsService.listMembers(id, user);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a project member as the project owner' })
  @ApiCreatedResponse({ description: 'Project member added.', example: projectMemberExample })
  @ApiForbiddenResponse({ description: 'Only the project owner may add members.' })
  @ApiConflictResponse({ description: 'User is already a member of this project.' })
  addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMemberDto,
    @CurrentUser() user: SafeUser,
  ) {
    return this.projectsService.addMember(id, dto, user);
  }

  @Delete(':id/members/:userId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a project member as the project owner' })
  @ApiNoContentResponse({ description: 'Project member removed.' })
  @ApiForbiddenResponse({ description: 'Only the project owner may remove members.' })
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() user: SafeUser,
  ) {
    return this.projectsService.removeMember(id, userId, user);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get simple task statistics for a project' })
  @ApiOkResponse({ description: 'Task statistics for the project.', example: projectStatsExample })
  @ApiForbiddenResponse({ description: 'Current user is not a project member.' })
  getStats(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: SafeUser) {
    return this.projectsService.getStats(id, user);
  }
}
