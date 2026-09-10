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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
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
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: SafeUser) {
    return this.projectsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List projects visible to the current user' })
  findAll(@CurrentUser() user: SafeUser) {
    return this.projectsService.findAccessible(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by id' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: SafeUser) {
    return this.projectsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project owned by the current user' })
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
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: SafeUser) {
    return this.projectsService.remove(id, user);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List project members' })
  listMembers(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: SafeUser) {
    return this.projectsService.listMembers(id, user);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a project member as the project owner' })
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
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() user: SafeUser,
  ) {
    return this.projectsService.removeMember(id, userId, user);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get simple task statistics for a project' })
  getStats(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: SafeUser) {
    return this.projectsService.getStats(id, user);
  }
}
