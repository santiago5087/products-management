import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import type { IValidateTokenUseCase } from '../../../domain/ports/inbound/auth-use-cases.port';
import { VALIDATE_TOKEN_USE_CASE } from '../../../domain/ports/inbound/auth-use-cases.port';

/**
 * Adaptador de Entrada (Inbound Adapter): Guard de Autenticación JWT
 * 
 * Este guard es un adaptador que:
 * 1. Extrae el token JWT del header Authorization
 * 2. Usa el caso de uso ValidateTokenUseCase para validar el token
 * 3. Adjunta el usuario al request si el token es válido
 * 
 * Es un adaptador porque implementa la lógica específica de HTTP/NestJS
 * pero delega la validación real al caso de uso (dominio/aplicación).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(VALIDATE_TOKEN_USE_CASE)
    private readonly validateTokenUseCase: IValidateTokenUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      // Validar token usando el caso de uso
      const user = await this.validateTokenUseCase.execute(token);
      
      // Adjuntar usuario al request (sin password)
      request.user = user.toPublic();
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Extrae el token del header Authorization
   * Formato esperado: "Bearer <token>"
   */
  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    
    return type === 'Bearer' ? token : null;
  }
}
