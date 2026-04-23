import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ILoginUseCase } from '../../domain/ports/inbound/auth-use-cases.port';
import type { IUserRepository } from '../../domain/ports/outbound/user.repository.port';
import type { IPasswordService } from '../../domain/ports/outbound/password.service.port';
import type { ITokenService } from '../../domain/ports/outbound/token.service.port';
import { USER_REPOSITORY } from '../../domain/ports/outbound/user.repository.port';
import { PASSWORD_SERVICE } from '../../domain/ports/outbound/password.service.port';
import { TOKEN_SERVICE } from '../../domain/ports/outbound/token.service.port';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';

/**
 * Caso de Uso: Login de Usuario
 * 
 * Implementa la lógica de autenticación de usuarios:
 * 1. Busca el usuario por email
 * 2. Verifica el password
 * 3. Genera un token JWT
 */
@Injectable()
export class LoginUseCase implements ILoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(PASSWORD_SERVICE)
    private readonly passwordService: IPasswordService,

    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    // 1. Buscar usuario por email
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Verificar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // 3. Verificar password
    const isPasswordValid = await this.passwordService.compare(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Generar token JWT
    const token = this.tokenService.generateToken({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });

    // 5. Retornar respuesta
    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    };
  }
}
