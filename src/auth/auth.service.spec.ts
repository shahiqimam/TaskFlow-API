import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/enums/user-role.enum';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const jwtService = { sign: jest.fn().mockReturnValue('signed-token') };
  const configService = { get: jest.fn((_key: string, fallback: string) => fallback) };
  const usersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('registers users with a hashed password and returns a token', async () => {
    usersService.create.mockResolvedValue({
      id: 'user-id',
      name: 'Alex Morgan',
      email: 'alex@example.com',
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.register({
      name: 'Alex Morgan',
      email: 'alex@example.com',
      password: 'StrongPassword123!',
    });

    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'alex@example.com',
        passwordHash: expect.any(String),
      }),
    );
    expect(usersService.create.mock.calls[0][0].passwordHash).not.toBe('StrongPassword123!');
    expect(result.accessToken).toBe('signed-token');
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('uses a generic invalid credentials response for unknown users', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    await expect(
      service.login({ email: 'missing@example.com', password: 'StrongPassword123!' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('logs in with a valid password', async () => {
    const passwordHash = await bcrypt.hash('StrongPassword123!', 4);
    usersService.findByEmail.mockResolvedValue({
      id: 'user-id',
      name: 'Alex Morgan',
      email: 'alex@example.com',
      passwordHash,
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.login({
      email: 'alex@example.com',
      password: 'StrongPassword123!',
    });

    expect(result.accessToken).toBe('signed-token');
    expect(result.user).not.toHaveProperty('passwordHash');
  });
});
