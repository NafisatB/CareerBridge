import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import {
  UserRole,
  UserStatus,
} from 'generated/prisma/client';

import { PasswordService } from 'src/common/password.service';
import { DatabaseService } from 'src/database/database.service';

import { CreateAdminDto } from './dto/create-admin.dto';
import { UserWithPassword } from './dto/user-with-passowrd.type';
import { CreateUserInput } from './dto/types/user-input.type';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: DatabaseService,
    private readonly passwordService: PasswordService,
  ) {}

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    };
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });
  }

  async create(input: CreateUserInput) {
    const email = input.email.trim().toLowerCase();

    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingUser = await tx.user.findUnique({
          where: { email },
          select: { id: true },
        });

        if (existingUser) {
          throw new ConflictException(
            'An account with this email already exists.',
          );
        }

        const user = await tx.user.create({
          data: {
            email,
            password: input.passwordHash,
            firstName: input.firstName.trim(),
            lastName: input.lastName.trim(),
            role: input.role,
            status: UserStatus.ACTIVE,
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
          },
        });

        if (
          input.role === UserRole.STUDENT ||
          input.role === UserRole.GRADUATE
        ) {
          await tx.profile.create({
            data: {
              userId: user.id,
              status: "INCOMPLETE"
            },
          });
        }

        if (input.role === UserRole.MENTOR) {
          await tx.mentorProfile.create({
            data: {
              userId: user.id,
              applicationStatus: 'PENDING',
              isAvailable: false,
            },
          });
        }

        return user;
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      this.logger.error(
        'User creation failed.',
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException(
        'Unable to create user account.',
      );
    }
  }

  async createAdmin(createAdminDto: CreateAdminDto) {
    const email = createAdminDto.email.trim().toLowerCase();

    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingUser = await tx.user.findUnique({
          where: { email },
          select: { id: true },
        });

        if (existingUser) {
          throw new ConflictException(
            'An account with this email already exists.',
          );
        }

        const passwordHash = await this.passwordService.hash(
          createAdminDto.password,
       );

        return tx.user.create({
          data: {
            email,
            password: passwordHash,
            firstName: createAdminDto.firstName.trim(),
            lastName: createAdminDto.lastName.trim(),
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
          },
        });
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      this.logger.error(
        'Administrator creation failed.',
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException(
        'Unable to create administrator account.',
      );
    }
  }
}