import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/**
 * Decorador Compuesto: Autenticación
 * 
 * Aplica JwtAuthGuard para requerir autenticación.
 * 
 * Uso:
 * ```typescript
 * @Get('profile')
 * @Auth()
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 * ```
 */
export function Auth(...roles: string[]) {
  if (roles.length === 0) {
    return applyDecorators(UseGuards(JwtAuthGuard));
  }

  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(...roles),
  );
}
