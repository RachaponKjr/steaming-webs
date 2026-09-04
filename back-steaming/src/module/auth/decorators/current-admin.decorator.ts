/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AdminPayload } from '../interfaces/admin-payload.interface';

export const CurrentAdmin = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AdminPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AdminPayload;
  },
);
