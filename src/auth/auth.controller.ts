import {Body,Controller,Get,Post,Req,Res,UseGuards} from '@nestjs/common';
import {ApiBearerAuth,ApiOperation,ApiTags} from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedUser } from './types/authenticated-request';

@ApiTags('Authentication')
@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new account',
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login to an account',
  })
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(
      loginDto,
      response,
    );
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh the access token',
    description:
      'Issues a new access token using the refresh token stored in the HttpOnly cookie.',
  })
  refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.refresh(
      request,
      response,
    );
  }

  @Post('logout')
@ApiOperation({
  summary: 'Logout from the current session',
})
logout(
  @Req() request: Request,
  @Res({ passthrough: true }) response: Response,
) {
  return this.authService.logout(
    request,
    response,
  );
}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get the authenticated user',
  })
  getMe(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      success: true,
      data: { user },
      message:
        'Authenticated user retrieved successfully.',
    };
  }
}