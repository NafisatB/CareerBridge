import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {ArrayMaxSize,ArrayUnique,IsArray,IsInt,IsOptional,IsString,IsUUID,Max,MaxLength,Min} from 'class-validator';

export class UpdateMentorProfileDto {
  @ApiPropertyOptional({
    example: 'Senior Software Engineer',
    description: 'Mentor professional title.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  professionalTitle?: string;

  @ApiPropertyOptional({
    example: 'Tech Company',
    description: 'Mentor organisation.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  organisation?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Number of years of professional experience.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(60)
  yearsOfExperience?: number;

  @ApiPropertyOptional({
    example:
      'Software engineer with experience mentoring early-career developers.',
    description: 'Short professional biography.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  bio?: string;

  @ApiPropertyOptional({
    example: [
      '121f447a-1d52-449b-8e77-3b47d3fb68cb',
    ],
    description: 'IDs of the mentor skills.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(20)
  skillIds?: string[];

  @ApiPropertyOptional({
    example: [
      '3f9f5db6-acb3-4c22-8496-3344657bcd7b',
    ],
    description: 'IDs of the mentor career interests.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(10)
  careerInterestIds?: string[];
}