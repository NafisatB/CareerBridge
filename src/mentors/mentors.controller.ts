import {Body, Controller,Get,Param,Patch,UseGuards} from '@nestjs/common';

import {ApiBearerAuth,ApiOperation,ApiResponse,ApiTags} from '@nestjs/swagger';

import { UserRole } from 'generated/prisma/client';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

import { MentorsService } from './mentors.service';
import { UpdateMentorApplicationDto } from './dto/update-mentor-application.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UpdateMentorProfileDto } from './dto/update-mentor-profile.dto';
import { UpdateMentorAvailabilityDto } from './dto/update-mentor-availability.dto';

@ApiTags('Mentors')
@Controller('v1/mentors')
export class MentorsController {
  constructor(
    private readonly mentorsService: MentorsService,
  ) {}

  @Get('applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get mentor applications',
    description:
      'Returns mentor applications for administrative review.',
  })
  @ApiResponse({
    status: 200,
    description: 'Mentor applications retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only administrators can view mentor applications.',
  })
  findApplications() {
    return this.mentorsService.findApplications();
  }

@Get('me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MENTOR)
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Get my mentor profile',
  description: 'Returns the authenticated mentor profile.',
})
@ApiResponse({
  status: 200,
  description: 'Mentor profile retrieved successfully.',
})
@ApiResponse({
  status: 401,
  description: 'Authentication required.',
})
@ApiResponse({
  status: 403,
  description: 'Only mentors can access this endpoint.',
})
getMyProfile(@CurrentUser() user: { id: string }) {
  return this.mentorsService.getMyProfile(user.id);
}

@Patch('me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MENTOR)
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Update my mentor profile',
  description:
    'Allows the authenticated mentor to update their professional profile.',
})
@ApiResponse({
  status: 200,
  description: 'Mentor profile updated successfully.',
})
@ApiResponse({
  status: 400,
  description: 'Invalid profile data.',
})
@ApiResponse({
  status: 401,
  description: 'Authentication required.',
})
@ApiResponse({
  status: 403,
  description: 'Only mentors can update this profile.',
})
updateMyProfile(
  @CurrentUser() user: { id: string },
  @Body() updateMentorProfileDto: UpdateMentorProfileDto,
) {
  return this.mentorsService.updateMyProfile(
    user.id,
    updateMentorProfileDto,
  );
}

@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT, UserRole.GRADUATE)
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Discover available mentors',
  description:
    'Returns approved and currently available mentors for students and graduates.',
})
@ApiResponse({
  status: 200,
  description: 'Available mentors retrieved successfully.',
})
@ApiResponse({
  status: 401,
  description: 'Authentication required.',
})
@ApiResponse({
  status: 403,
  description: 'Only students and graduates can discover mentors.',
})
findAvailableMentors() {
  return this.mentorsService.findAvailableMentors();
}

  @Patch(':mentorProfileId/application')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Approve or reject a mentor application',
  description:
    'Allows an administrator to approve or reject a pending mentor application.',
})
@ApiResponse({
  status: 200,
  description: 'Mentor application updated successfully.',
})
@ApiResponse({
  status: 400,
  description: 'Application has already been reviewed or request is invalid.',
})
@ApiResponse({
  status: 401,
  description: 'Authentication required.',
})
@ApiResponse({
  status: 403,
  description: 'Only administrators can review mentor applications.',
})
@ApiResponse({
  status: 404,
  description: 'Mentor application not found.',
})
updateApplicationStatus(
  @Param('mentorProfileId') mentorProfileId: string,
  @Body() updateMentorApplicationDto: UpdateMentorApplicationDto,
) {
  return this.mentorsService.updateApplicationStatus(
    mentorProfileId,
    updateMentorApplicationDto.status,
  );
}

@Patch('me/availability')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MENTOR)
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Update my availability',
  description:
    'Allows an approved mentor to enable or disable their availability for mentorship requests.',
})
@ApiResponse({
  status: 200,
  description: 'Mentor availability updated successfully.',
})
@ApiResponse({
  status: 400,
  description: 'Mentor is not approved or request data is invalid.',
})
@ApiResponse({
  status: 401,
  description: 'Authentication required.',
})
@ApiResponse({
  status: 403,
  description: 'Only mentors can update availability.',
})
updateMyAvailability(
  @CurrentUser() user: { id: string },
  @Body() updateMentorAvailabilityDto: UpdateMentorAvailabilityDto,
) {
  return this.mentorsService.updateMyAvailability(
    user.id,
    updateMentorAvailabilityDto.isAvailable,
  );
}
}