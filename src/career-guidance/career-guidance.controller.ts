import { Controller, Get, UseGuards } from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';

import { UserRole } from 'generated/prisma/client';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

import { CareerGuidanceService } from './career-guidance.service';

@ApiTags('Career Guidance')
@Controller('v1/career-guidance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT, UserRole.GRADUATE)
export class CareerGuidanceController {
  constructor(
    private readonly careerGuidanceService: CareerGuidanceService,
  ) {}

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get my career guidance',
    description:
      'Returns career pathways related to the authenticated user’s career interests together with profile context and matched mentors.',
  })
  @ApiResponse({
    status: 200,
    description: 'Career guidance retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Career interests are required.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Only students and graduates can access career guidance.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found.',
  })
  getMyCareerGuidance(@CurrentUser() user: { id: string }) {
    return this.careerGuidanceService.getMyCareerGuidance(user.id);
  }
}