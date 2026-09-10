import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { SafeUser, toSafeUser } from './user.types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(params: {
    name: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
  }): Promise<SafeUser> {
    const existing = await this.usersRepository.findOne({ where: { email: params.email } });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const user = this.usersRepository.create({
      name: params.name,
      email: params.email.toLowerCase(),
      passwordHash: params.passwordHash,
      role: params.role ?? UserRole.USER,
    });
    return toSafeUser(await this.usersRepository.save(user));
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email: email.toLowerCase() } });
  }

  async findSafeById(id: string): Promise<SafeUser | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user ? toSafeUser(user) : null;
  }

  async getSafeById(id: string): Promise<SafeUser> {
    const user = await this.findSafeById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateMe(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.name !== undefined) {
      user.name = dto.name;
    }

    return toSafeUser(await this.usersRepository.save(user));
  }

  async findAll(): Promise<SafeUser[]> {
    const users = await this.usersRepository.find({ order: { createdAt: 'DESC' } });
    return users.map(toSafeUser);
  }
}
