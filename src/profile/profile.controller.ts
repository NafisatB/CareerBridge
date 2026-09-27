import {Body, Controller,Get,Patch,UseGuards} from '@nestjs/common';
import {ApiBearerAuth,ApiOperation,ApiResponse,ApiTags} from '@nestjs/swagger';
import { UserRole } from 'generated/prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ProfileService } from './profile.service';
import type { AuthenticatedUser } from 'src/auth/types/authenticated-request';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateProfileInterestsDto } from './dto/update-profile-interest.dto';

@ApiTags('Profile')
@Controller('v1/profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.GRADUATE)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Returns the authenticated student or graduate profile, including selected skills and career interests.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Only students and graduates can access this profile.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found.',
  })
  getMyProfile(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.profileService.getMyProfile(user.id);
  }

  @Patch('me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT, UserRole.GRADUATE)
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Update current user profile',
  description:
    'Updates the authenticated student or graduate basic onboarding profile.',
})
@ApiResponse({
  status: 200,
  description: 'Profile updated successfully.',
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
  description:
    'Only students and graduates can update this profile.',
})
@ApiResponse({
  status: 404,
  description: 'Profile not found.',
})
updateMyProfile(
  @CurrentUser() user: AuthenticatedUser,
  @Body() updateProfileDto: UpdateProfileDto,
) {
  return this.profileService.updateMyProfile(
    user.id,
    updateProfileDto,
  );
}

@Patch('me/interests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT, UserRole.GRADUATE)
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Update profile skills and career interests',
  description:
    'Replaces the authenticated user selected skills and career interests.',
})
@ApiResponse({
  status: 200,
  description:
    'Profile skills and career interests updated successfully.',
})
@ApiResponse({
  status: 400,
  description:
    'One or more selected skills or career interests do not exist.',
})
@ApiResponse({
  status: 401,
  description: 'Authentication required.',
})
@ApiResponse({
  status: 403,
  description:
    'Only students and graduates can update profile interests.',
})
@ApiResponse({
  status: 404,
  description: 'Profile not found.',
})
updateMyInterests(
  @CurrentUser() user: AuthenticatedUser,
  @Body()
  updateProfileInterestsDto: UpdateProfileInterestsDto,
) {
  return this.profileService.updateMyInterests(
    user.id,
    updateProfileInterestsDto,
  );
}
}