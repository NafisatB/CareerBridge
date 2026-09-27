import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {IsOptional,IsString,IsUUID,MaxLength} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMentorRequestDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User ID of the mentor being requested.',
  })
  @IsUUID('4')
  mentorId: string;

  @ApiPropertyOptional({
    example:
      'I would like guidance on transitioning into software development.',
    description: 'Optional message to the mentor.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  message?: string;
}