import { Controller, Get, UseGuards } from '@nestjs/common';
import {ApiBearerAuth,ApiOperation,ApiResponse,ApiTags} from '@nestjs/swagger';

import { UserRole } from 'generated/prisma/client';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

import { MatchingService } from './matching.service';

@ApiTags('Matching')
@Controller('v1/matching')
export class MatchingController {
  constructor(
    private readonly matchingService: MatchingService,
  ) {}

  @Get('mentors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.GRADUATE)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Find matching mentors',
    description:
      'Returns approved and available mentors ranked by compatibility with the authenticated student or graduate profile.',
  })
  @ApiResponse({
    status: 200,
    description: 'Mentor matches retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Student has not added any skills or career interests.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Only students and graduates can request mentor matches.',
  })
  findMentorMatches(@CurrentUser() user: { id: string }) {
    return this.matchingService.findMentorMatches(user.id);
  }
}