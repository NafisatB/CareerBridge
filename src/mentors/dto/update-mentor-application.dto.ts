import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { MentorApplicationStatus } from 'generated/prisma/client';

export class UpdateMentorApplicationDto {
  @ApiProperty({
    enum: MentorApplicationStatus,
    example: MentorApplicationStatus.APPROVED,
    description: 'Decision on the mentor application.',
  })
  @IsEnum(MentorApplicationStatus)
  status: MentorApplicationStatus;
}