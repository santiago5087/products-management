import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { IValidateTokenUseCase } from '../../domain/ports/inbound/auth-use-cases.port';
import type { IUserRepository } from '../../domain/ports/outbound/user.repository.port';
import type { ITokenService } from '../../domain/ports/outbound/token.service.port';
import { USER_REPOSITORY } from '../../domain/ports/outbound/user.repository.port';
import { TOKEN_SERVICE } from '../../domain/ports/outbound/token.service.port';
import { User } from '../../domain/entities/user.entity';

/**
 * Caso de Uso: Validar Token JWT
 * 
 * Implementa la lógica de validación de tokens:
 * 1. Verifica el token JWT
 * 2. Busca el usuario por ID
 * 3. Verifica que el usuario esté activo
 */
@Injectable()
export class ValidateTokenUseCase implements IValidateTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  async execute(token: string): Promise<User> {
    try {
      // 1. Verificar y decodificar token
      const payload = this.tokenService.verifyToken(token);

      // 2. Buscar usuario por ID
      const user = await this.userRepository.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // 3. Verificar que el usuario esté activo
      if (!user.isActive) {
        throw new UnauthorizedException('Usuario inactivo');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
