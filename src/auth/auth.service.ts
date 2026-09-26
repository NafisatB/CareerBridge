import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';

import { UserRole, UserStatus } from 'generated/prisma/enums';

import { PasswordService } from 'src/common/password.service';
import { DatabaseService } from 'src/database/database.service';
import { UsersService } from 'src/users/users.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenService } from './refresh-token.service';

const REFRESH_TOKEN_COOKIE = 'refresh_token';

interface RefreshTokenPayload {
    sub: string;
    sessionId: string;
    role: UserRole;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly passwordService: PasswordService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly prisma: DatabaseService,
        private readonly refreshTokenService: RefreshTokenService,
    ) { }

    async register(registerDto: RegisterDto) {
        const email = registerDto.email.trim().toLowerCase();

        const existingUser =
            await this.usersService.findByEmail(email);

        if (existingUser) {
            throw new ConflictException(
                'An account with this email already exists.',
            );
        }

        const passwordHash =
            await this.passwordService.hash(registerDto.password);

        const user = await this.usersService.create({
            email,
            passwordHash,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            role: registerDto.role,
        });

        return {
            message: 'Registration successful.',
            user,
        };
    }

    async login(
        loginDto: LoginDto,
        response: Response,
    ) {
        const email = loginDto.email.trim().toLowerCase();

        const user =
            await this.usersService.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException(
                'Invalid email or password.',
            );
        }

        const passwordValid =
            await this.passwordService.verify(
                user.passwordHash,
                loginDto.password,
            );

        if (!passwordValid) {
            throw new UnauthorizedException(
                'Invalid email or password.',
            );
        }

        if (user.status !== UserStatus.ACTIVE) {
            throw new UnauthorizedException(
                'Your account is not currently active.',
            );
        }

        const accessToken =
            await this.jwtService.signAsync({
                sub: user.id,
                email: user.email,
                role: user.role,
            });

        const sessionId = randomUUID();
        const refreshTokenExpiry =
            this.getRefreshTokenExpiry();

        const refreshSession =
            await this.prisma.refreshSession.create({
                data: {
                    id: sessionId,
                    userId: user.id,
                    tokenHash: randomUUID(),
                    expiresAt: refreshTokenExpiry,
                },
            });

        const refreshToken =
            await this.jwtService.signAsync(
                {
                    sub: user.id,
                    sessionId: refreshSession.id,
                    role: user.role,
                },
                {
                    secret:
                        this.configService.getOrThrow<string>(
                            'jwt.refreshSecret',
                        ),
                    expiresIn:
                        this.configService.getOrThrow<string>(
                            'jwt.refreshExpiresIn',
                        ) as JwtSignOptions['expiresIn'],
                },
            );

        await this.prisma.refreshSession.update({
            where: {
                id: refreshSession.id,
            },
            data: {
                tokenHash:
                    this.refreshTokenService.hashToken(
                        refreshToken,
                    ),
            },
        });

        response.cookie(
            REFRESH_TOKEN_COOKIE,
            refreshToken,
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/api/v1/auth',
                expires: refreshTokenExpiry,
            },
        );

        return {
            message: 'Login successful.',
            accessToken,
            tokenType: 'Bearer',
            expiresIn:
                this.configService.getOrThrow<string>(
                    'jwt.accessExpiresIn',
                ),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                status: user.status,
            },
        };
    }

    async refresh(
        request: Request,
        response: Response,
    ) {
        const refreshToken =
            request.cookies?.[REFRESH_TOKEN_COOKIE];

        if (!refreshToken) {
            throw new UnauthorizedException(
                'Refresh token is required.',
            );
        }

        let payload: RefreshTokenPayload;

        try {
            payload =
                await this.jwtService.verifyAsync<RefreshTokenPayload>(
                    refreshToken,
                    {
                        secret:
                            this.configService.getOrThrow<string>(
                                'jwt.refreshSecret',
                            ),
                    },
                );
        } catch {
            throw new UnauthorizedException(
                'Invalid or expired refresh token.',
            );
        }

        const session =
            await this.prisma.refreshSession.findUnique({
                where: {
                    id: payload.sessionId,
                },
            });

        if (!session ||
            session.userId !== payload.sub ||
            session.revokedAt ||
            session.expiresAt <= new Date()) {
            throw new UnauthorizedException(
                'Invalid refresh session.',
            );
        }
        const tokenHash =
            this.refreshTokenService.hashToken(
                refreshToken,
            );

        if (tokenHash !== session.tokenHash) {
            throw new UnauthorizedException(
                'Invalid refresh token.',
            );
        }

        const user =
            await this.usersService.findById(
                payload.sub,
            );

        if (!user || user.status !== UserStatus.ACTIVE) {
            throw new UnauthorizedException(
                'Your account is not currently active.',
            );
        }

        const refreshTokenExpiry =
            this.getRefreshTokenExpiry();

        const newSessionId = randomUUID();

        const newRefreshSession =
            await this.prisma.refreshSession.create({
                data: {
                    id: newSessionId,
                    userId: user.id,
                    tokenHash: randomUUID(),
                    expiresAt: refreshTokenExpiry,
                },
            });

        const newRefreshToken =
            await this.jwtService.signAsync(
                {
                    sub: user.id,
                    sessionId: newSessionId,
                    role: user.role,
                },
                {
                    secret:
                        this.configService.getOrThrow<string>(
                            'jwt.refreshSecret',
                        ),
                    expiresIn:
                        this.configService.getOrThrow<string>(
                            'jwt.refreshExpiresIn',
                        ) as JwtSignOptions['expiresIn'],
                },
            );

        await this.prisma.$transaction([
            this.prisma.refreshSession.update({
                where: {
                    id: session.id,
                },
                data: {
                    revokedAt: new Date(),
                },
            }),

            this.prisma.refreshSession.update({
                where: {
                    id: newRefreshSession.id,
                },
                data: {
                    tokenHash:
                        this.refreshTokenService.hashToken(
                            newRefreshToken,
                        ),
                },
            }),
        ]);

        const accessToken =
            await this.jwtService.signAsync({
                sub: user.id,
                email: user.email,
                role: user.role,
            });

        response.cookie(
            REFRESH_TOKEN_COOKIE,
            newRefreshToken,
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/api/v1/auth',
                expires: refreshTokenExpiry,
            },
        );

        return {
            message: 'Access token refreshed successfully.',
            accessToken,
            tokenType: 'Bearer',
            expiresIn:
                this.configService.getOrThrow<string>(
                    'jwt.accessExpiresIn',
                ),
        };
    }

    private getRefreshTokenExpiry(): Date {
        const expiresIn =
            this.configService.getOrThrow<string>(
                'jwt.refreshExpiresIn',
            );

        const match =
            expiresIn.match(/^(\d+)([smhd])$/);

        if (!match) {
            throw new InternalServerErrorException(
                'Invalid refresh token expiration configuration.',
            );
        }

        const value = Number(match[1]);
        const unit = match[2];

        const millisecondsPerUnit: Record<
            string,
            number
        > = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };

        return new Date(
            Date.now() +
            value * millisecondsPerUnit[unit],
        );
    }

    async logout(request: Request, response: Response) {
  const refreshToken =
    request.cookies?.[REFRESH_TOKEN_COOKIE];

  if (refreshToken) {
    try {
      const payload =
        await this.jwtService.verifyAsync<RefreshTokenPayload>(
          refreshToken,
          {
            secret:
              this.configService.getOrThrow<string>(
                'jwt.refreshSecret',
              ),
          },
        );

      await this.prisma.refreshSession.updateMany({
        where: {
          id: payload.sessionId,
          userId: payload.sub,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    } catch {
      // The token is already invalid or expired.
      // Continue clearing the browser cookie.
    }
  }

  response.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
  });

  return {
    message: 'Logout successful.',
  };
}
}