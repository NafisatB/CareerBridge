import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RoadmapTaskStatus } from 'generated/prisma/client';

export class UpdateRoadmapTaskDto {
  @ApiProperty({
    enum: RoadmapTaskStatus,
    example: RoadmapTaskStatus.IN_PROGRESS,
    description: 'New status for the roadmap task.',
  })
  @IsEnum(RoadmapTaskStatus)
  status: RoadmapTaskStatus;
}