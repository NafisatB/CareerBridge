import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { UserStatus } from 'generated/prisma/client';

export class UpdateUserStatusDto {
  @ApiProperty({
    enum: UserStatus,
    example: UserStatus.DEACTIVATED,
    description: 'New account status.',
  })
  @IsEnum(UserStatus)
  status: UserStatus;
}