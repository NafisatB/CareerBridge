import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { MentorRequestStatus } from 'generated/prisma/client';

export class RespondMentorRequestDto {
  @ApiProperty({
    enum: [
      MentorRequestStatus.ACCEPTED,
      MentorRequestStatus.DECLINED,
    ],
    example: MentorRequestStatus.ACCEPTED,
    description: 'The mentor response to the request.',
  })
  @IsEnum(MentorRequestStatus)
  status: MentorRequestStatus;
}