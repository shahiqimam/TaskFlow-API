import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { safeUserExample } from '../common/swagger/api-examples';
import { SafeUser } from './user.types';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Return the current user' })
  @ApiOkResponse({ description: 'Current user profile.', example: safeUserExample })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  getMe(@CurrentUser() user: SafeUser) {
    return user;
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update the current user profile' })
  @ApiOkResponse({ description: 'Updated current user profile.', example: safeUserExample })
  updateMe(@CurrentUser() user: SafeUser, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(user.id, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List users (admin only)' })
  @ApiOkResponse({ description: 'Users visible to an admin.', example: [safeUserExample] })
  @ApiForbiddenResponse({ description: 'Admin role is required.' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a user by id (admin only)' })
  @ApiOkResponse({ description: 'Requested user.', example: safeUserExample })
  @ApiForbiddenResponse({ description: 'Admin role is required.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getSafeById(id);
  }
}
