import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AdminPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
}

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AdminPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: AdminPayload }>();
    return request.user;
  },
);
