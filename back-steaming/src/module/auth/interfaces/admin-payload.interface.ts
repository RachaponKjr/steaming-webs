import { AdminRole } from '@prisma/client';

export interface AdminPayload {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: AdminRole;
}
