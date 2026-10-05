import {Body,Controller,Delete,Get,Param,ParseUUIDPipe,Patch,Post,UseGuards,} from '@nestjs/common';
import {ApiBearerAuth,ApiOperation,ApiResponse,ApiTags} from '@nestjs/swagger';

import { UserRole } from 'generated/prisma/client';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { RoadmapsService } from './roadmaps.service';
import { UpdateRoadmapTaskDto } from './dto/update-roadmap-task.dto';

@ApiTags('Roadmaps')
@Controller('v1/roadmaps')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT, UserRole.GRADUATE)
export class RoadmapsController {
  constructor(
    private readonly roadmapsService: RoadmapsService,
  ) {}

  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create a career roadmap',
    description:
      'Creates a roadmap for the authenticated student or graduate based on a matching active career pathway.',
  })
  @ApiResponse({
    status: 201,
    description: 'Career roadmap created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid pathway ID.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Only students and graduates can create career roadmaps.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Profile or career pathway not found.',
  })
  @ApiResponse({
    status: 409,
    description:
      'The pathway is inactive, does not match the user interests, or a roadmap already exists for the pathway.',
  })
  createRoadmap(
    @CurrentUser() user: { id: string },
    @Body() createRoadmapDto: CreateRoadmapDto,
  ) {
    return this.roadmapsService.createRoadmap(
      user.id,
      createRoadmapDto,
    );
  }

  @Get('me')
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Get my career roadmaps',
  description:
    'Returns all career roadmaps belonging to the authenticated student or graduate, including their pathway and tasks.',
})
@ApiResponse({
  status: 200,
  description: 'Career roadmaps retrieved successfully.',
})
@ApiResponse({
  status: 401,
  description: 'Authentication required.',
})
@ApiResponse({
  status: 403,
  description:
    'Only students and graduates can view career roadmaps.',
})
@ApiResponse({
  status: 404,
  description: 'Profile not found.',
})
getMyRoadmaps(@CurrentUser() user: { id: string }) {
  return this.roadmapsService.getMyRoadmaps(user.id);
}

@Patch('tasks/:taskId')
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Update roadmap task progress',
  description:
    'Updates the status of a roadmap task belonging to the authenticated student or graduate.',
})
@ApiResponse({
  status: 200,
  description: 'Roadmap task updated successfully.',
})
@ApiResponse({
  status: 400,
  description: 'Invalid task status or task ID.',
})
@ApiResponse({
  status: 401,
  description: 'Authentication required.',
})
@ApiResponse({
  status: 403,
  description:
    'Only students and graduates can update roadmap tasks.',
})
@ApiResponse({
  status: 404,
  description:
    'Profile or roadmap task not found.',
})
@ApiResponse({
  status: 409,
  description:
    'A completed roadmap task cannot be moved back to an earlier status.',
})
updateRoadmapTask(
  @CurrentUser() user: { id: string },
  @Param('taskId') taskId: string,
  @Body() updateRoadmapTaskDto: UpdateRoadmapTaskDto,
) {
  return this.roadmapsService.updateRoadmapTask(
    user.id,
    taskId,
    updateRoadmapTaskDto,
  );
}

@Delete(':roadmapId')
@ApiBearerAuth('access-token')
async deleteRoadmap(
  @CurrentUser() user: { id: string },
  @Param('roadmapId', new ParseUUIDPipe()) roadmapId: string,
) {
  return this.roadmapsService.deleteRoadmap(
    user.id,
    roadmapId,
  );
}
}