import { UserRole } from 'generated/prisma/client';

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  role: UserRole;
}