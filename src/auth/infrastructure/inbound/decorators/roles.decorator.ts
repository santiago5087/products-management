import { SetMetadata } from '@nestjs/common';

/**
 * Clave de metadata para roles
 */
export const ROLES_KEY = 'roles';

/**
 * Decorador de Roles
 * 
 * Define los roles requeridos para acceder a un endpoint.
 * Se usa en conjunto con RolesGuard.
 * 
 * Uso:
 * ```typescript
 * @Post()
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin')
 * create(@Body() dto: CreateProductDto) {
 *   // ...
 * }
 * ```
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
