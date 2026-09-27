// import { Body, Controller, Post, UseGuards } from '@nestjs/common';
// import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
// import { UsersService } from './users.service';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { RolesGuard } from 'src/auth/guards/roles.guard';
// import { Roles } from 'src/common/roles.decorator';
// import { UserRole } from 'generated/prisma/enums';
// import { CreateAdminDto } from './dto/create-admin.dto';

// @ApiTags('Users')
// @Controller('users')
// export class UsersController {
//     constructor(private readonly usersService: UsersService){}

//     @Post('admin')
//     @UseGuards(JwtAuthGuard, RolesGuard)
//     @Roles(UserRole.ADMIN)
//     @ApiBearerAuth('access-token')
//     @ApiOperation({
//         summary: 'Create an administrator',
//         description: 'Creates a new administrator'
//     })
//     @ApiResponse({
//         status: 201,
//         description: 'Administrator created successfully'
//     })
//     @ApiResponse({
//         status: 401,
//         description: 'Authentication required'
//     })
//     @ApiResponse({
//         status: 403,
//         description: 'Only administrators can create administrators'
//     })
//     @ApiResponse({
//         status: 409,
//         description: 'Email already exists'
//     })
//     async createAdmin(@Body() createAdminDto: CreateAdminDto){
//         return this.usersService.createAdmin(createAdminDto)
//     }


// }

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserRole } from 'generated/prisma/client';

import { UsersService } from './users.service';
import { CreateAdminDto } from './dto/create-admin.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateUserStatusDto } from './dto/user-status.dto';

@ApiTags('Users')
@Controller('v1/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'List all users',
    description:
      'Returns all registered users. Only administrators can access this endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only administrators can access this endpoint.',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Get user details',
  description:
    'Returns the details of a specific user. Only administrators can access this endpoint.',
})
@ApiResponse({
  status: 200,
  description: 'User details retrieved successfully.',
})
@ApiResponse({
  status: 401,
  description: 'Authentication required.',
})
@ApiResponse({
  status: 403,
  description: 'Only administrators can access this endpoint.',
})
@ApiResponse({
  status: 404,
  description: 'User not found.',
})
findUserDetails(@Param('id') id: string) {
  return this.usersService.findUserDetails(id);
}

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create an administrator',
    description: 'Creates a new administrator account.',
  })
  @ApiResponse({
    status: 201,
    description: 'Administrator created successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required.',
  })
  @ApiResponse({
    status: 403,
    description: 'Only administrators can create administrators.',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists.',
  })
  createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.usersService.createAdmin(createAdminDto);
  }

  @Patch(':id/status')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Update user account status',
  description:
    'Activates or deactivates a user account. Only administrators can perform this action.',
})
@ApiResponse({
  status: 200,
  description: 'User status updated successfully.',
})
@ApiResponse({
  status: 400,
  description: 'Invalid user status.',
})
@ApiResponse({
  status: 401,
  description: 'Authentication required.',
})
@ApiResponse({
  status: 403,
  description: 'Only administrators can update user status.',
})
@ApiResponse({
  status: 404,
  description: 'User not found.',
})
updateStatus(
  @Param('id') id: string,
  @Body() updateUserStatusDto: UpdateUserStatusDto,
) {
  return this.usersService.updateStatus(
    id,
    updateUserStatusDto.status,
  );
}
}