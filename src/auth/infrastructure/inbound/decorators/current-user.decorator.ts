import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador de Parámetro: Usuario Actual
 * 
 * Extrae el usuario autenticado del request.
 * El usuario es adjuntado al request por el JwtAuthGuard.
 * 
 * Uso:
 * ```typescript
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
