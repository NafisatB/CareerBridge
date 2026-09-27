import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {IsEnum,IsInt,IsOptional,IsString,MaxLength,Min} from 'class-validator';
import {Gender, GraduationStatus} from 'generated/prisma/client';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: '08012345678',
    description: 'User phone number.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  phoneNumber?: string;

  @ApiPropertyOptional({
    enum: Gender,
    example: Gender.FEMALE,
    description: 'User gender.',
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    example: 'University of Lagos',
    description: 'Name of the university or institution.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  institutionName?: string;

  @ApiPropertyOptional({
    example: 'Industrial Chemistry',
    description: 'User field of study.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  fieldOfStudy?: string;

  @ApiPropertyOptional({
    enum: GraduationStatus,
    example: GraduationStatus.FINAL_YEAR,
    description: 'Current graduation status.',
  })
  @IsOptional()
  @IsEnum(GraduationStatus)
  graduationStatus?: GraduationStatus;

  @ApiPropertyOptional({
    example: 2027,
    description: 'Expected or actual graduation year.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1950)
  graduationYear?: number;

  @ApiPropertyOptional({
    example:
      'Interested in software development and computational chemistry.',
    description: 'Short professional or career biography.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  bio?: string;
}