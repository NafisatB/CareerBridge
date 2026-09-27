import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import {ApiBearerAuth,ApiOperation,ApiResponse,ApiTags} from '@nestjs/swagger';

import { UserRole } from 'generated/prisma/client';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

import { MentorRequestsService } from './mentor-requests.service';
import { CreateMentorRequestDto } from './dto/mentor-request.dto';
import { RespondMentorRequestDto } from './dto/respond-mentor-request.dto';

@ApiTags('Mentor Requests')
@Controller('v1/mentor-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT, UserRole.GRADUATE)
export class MentorRequestsController {
  constructor(
    private readonly mentorRequestsService: MentorRequestsService,
  ) {}

  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create a mentor request',
    description:
      'Allows a student or graduate to send a mentorship request to an approved and available mentor.',
  })
  @ApiResponse({
    status: 201,
    description: 'Mentor request created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only students and graduates can request mentors.',
  })
  @ApiResponse({
    status: 404,
    description: 'Mentor not found.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Mentor is inactive, unavailable, not approved, or a pending request already exists.',
  })
  createRequest(
    @CurrentUser() user: { id: string },
    @Body() createMentorRequestDto: CreateMentorRequestDto,
  ) {
    return this.mentorRequestsService.createRequest(
      user.id,
      createMentorRequestDto,
    );
  }

  @Get('my')
@Roles(UserRole.STUDENT, UserRole.GRADUATE)
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Get my mentor requests',
  description:
    'Returns mentor requests created by the authenticated student or graduate.',
})
@ApiResponse({
  status: 200,
  description: 'Mentor requests retrieved successfully.',
})
@ApiResponse({
  status: 401,
  description: 'Authentication required.',
})
@ApiResponse({
  status: 403,
  description: 'Only students and graduates can access their requests.',
})
getMyRequests(@CurrentUser() user: { id: string }) {
  return this.mentorRequestsService.findMyRequests(user.id);
}

@Get('received')
@Roles(UserRole.MENTOR)
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Get received mentor requests',
  description:
    'Returns mentorship requests received by the authenticated mentor.',
})
@ApiResponse({
  status: 200,
  description: 'Received mentor requests retrieved successfully.',
})
@ApiResponse({
  status: 401,
  description: 'Authentication required.',
})
@ApiResponse({
  status: 403,
  description: 'Only mentors can access received requests.',
})
getReceivedRequests(@CurrentUser() user: { id: string }) {
  return this.mentorRequestsService.findReceivedRequests(user.id);
}

@Patch(':requestId/respond')
@Roles(UserRole.MENTOR)
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Accept or decline a mentor request',
  description:
    'Allows an approved mentor to accept or decline a pending mentorship request assigned to them.',
})
@ApiResponse({
  status: 200,
  description: 'Mentor request response recorded successfully.',
})
@ApiResponse({
  status: 400,
  description: 'Invalid response status.',
})
@ApiResponse({
  status: 401,
  description: 'Authentication required.',
})
@ApiResponse({
  status: 403,
  description: 'Only mentors can respond to mentor requests.',
})
@ApiResponse({
  status: 404,
  description: 'Mentor request not found.',
})
@ApiResponse({
  status: 409,
  description:
    'The mentor is not authorized for this request, or the request has already been responded to.',
})
respondToRequest(
  @CurrentUser() user: { id: string },
  @Param('requestId', new ParseUUIDPipe()) requestId: string,
  @Body() respondMentorRequestDto: RespondMentorRequestDto,
) {
  return this.mentorRequestsService.respondToRequest(
    user.id,
    requestId,
    respondMentorRequestDto.status,
  );
}

@Patch(':requestId/complete')
@Roles(UserRole.MENTOR)
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Complete a mentor request',
  description:
    'Allows a mentor to mark their own accepted mentorship request as completed.',
})
@ApiResponse({
  status: 200,
  description: 'Mentor request completed successfully.',
})
@ApiResponse({
  status: 400,
  description: 'Invalid request ID.',
})
@ApiResponse({
  status: 401,
  description: 'Authentication required.',
})
@ApiResponse({
  status: 403,
  description: 'Only mentors can complete mentor requests.',
})
@ApiResponse({
  status: 404,
  description: 'Mentor request not found.',
})
@ApiResponse({
  status: 409,
  description:
    'The mentor is not authorized for this request or the request is not accepted.',
})
completeRequest(
  @CurrentUser() user: { id: string },
  @Param('requestId', new ParseUUIDPipe()) requestId: string,
) {
  return this.mentorRequestsService.completeRequest(
    user.id,
    requestId,
  );
}

@Patch(':requestId/cancel')
@Roles(UserRole.STUDENT, UserRole.GRADUATE)
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Cancel a mentor request',
  description:
    'Allows a student or graduate to cancel their own pending mentor request.',
})
@ApiResponse({
  status: 200,
  description: 'Mentor request cancelled successfully.',
})
@ApiResponse({
  status: 400,
  description: 'Invalid request ID.',
})
@ApiResponse({
  status: 401,
  description: 'Authentication required.',
})
@ApiResponse({
  status: 403,
  description:
    'Only students and graduates can cancel mentor requests.',
})
@ApiResponse({
  status: 404,
  description: 'Mentor request not found.',
})
@ApiResponse({
  status: 409,
  description:
    'The request does not belong to the student or is no longer pending.',
})
cancelRequest(
  @CurrentUser() user: { id: string },
  @Param('requestId', new ParseUUIDPipe()) requestId: string,
) {
  return this.mentorRequestsService.cancelRequest(
    user.id,
    requestId,
  );
}
}