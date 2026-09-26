import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {IsEmail,IsEnum,IsNotEmpty,IsString,MaxLength,MinLength} from 'class-validator';

export enum RegistrationRole {
  STUDENT = 'STUDENT',
  GRADUATE = 'GRADUATE',
  MENTOR = 'MENTOR',
}

export class RegisterDto {
  @ApiProperty({
    example: 'student@example.com',
    description: 'Unique email address for the new account',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Account password. Must contain at least 12 characters.',
    minLength: 12,
    maxLength: 128,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(128)
  password: string;

  @ApiProperty({
    example: 'Amina',
    description: 'User first name',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    example: 'Yusuf',
    description: 'User last name',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    enum: RegistrationRole,
    example: RegistrationRole.STUDENT,
    description:
      'Account type. ADMIN cannot be selected during public registration.',
  })
  @IsEnum(RegistrationRole)
  role: RegistrationRole;
}