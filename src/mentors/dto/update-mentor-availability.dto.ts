import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateMentorAvailabilityDto {
  @ApiProperty({
    example: true,
    description:
      'Whether the mentor is currently available to receive mentorship requests.',
  })
  @IsBoolean()
  isAvailable: boolean;
}