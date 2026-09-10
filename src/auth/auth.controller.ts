import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { authResponseExample, safeUserExample } from '../common/swagger/api-examples';
import { SafeUser } from '../users/user.types';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a user and issue an access token' })
  @ApiCreatedResponse({
    description: 'User registered and access token issued.',
    example: authResponseExample,
  })
  @ApiConflictResponse({ description: 'Email is already registered.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate a user and issue an access token' })
  @ApiCreatedResponse({
    description: 'User authenticated and access token issued.',
    example: authResponseExample,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return the current authenticated user' })
  @ApiOkResponse({
    description: 'Current authenticated user.',
    example: safeUserExample,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
  me(@CurrentUser() user: SafeUser) {
    return user;
  }
}
