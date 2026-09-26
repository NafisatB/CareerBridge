import {UserRole,UserStatus} from 'generated/prisma/client';

export interface UserWithPassword {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
}