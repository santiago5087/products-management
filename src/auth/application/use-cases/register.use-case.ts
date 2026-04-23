import { Inject, Injectable, ConflictException } from '@nestjs/common';
import type { IRegisterUseCase } from '../../domain/ports/inbound/auth-use-cases.port';
import type { IUserRepository } from '../../domain/ports/outbound/user.repository.port';
import type { IPasswordService } from '../../domain/ports/outbound/password.service.port';
import type { ITokenService } from '../../domain/ports/outbound/token.service.port';
import { USER_REPOSITORY } from '../../domain/ports/outbound/user.repository.port';
import { PASSWORD_SERVICE } from '../../domain/ports/outbound/password.service.port';
import { TOKEN_SERVICE } from '../../domain/ports/outbound/token.service.port';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { User } from '../../domain/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de Uso: Registro de Usuario
 * 
 * Implementa la lógica de registro de nuevos usuarios:
 * 1. Verifica que el email no exista
 * 2. Hashea el password
 * 3. Crea el usuario
 * 4. Genera un token JWT
 */
@Injectable()
export class RegisterUseCase implements IRegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(PASSWORD_SERVICE)
    private readonly passwordService: IPasswordService,

    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: RegisterDto): Promise<AuthResponseDto> {
    // 1. Verificar si el email ya existe
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException(`El email ${dto.email} ya está registrado`);
    }

    // 2. Hashear password
    const hashedPassword = await this.passwordService.hash(dto.password);

    // 3. Crear entidad de usuario
    const user = new User(
      uuidv4(),
      dto.email,
      hashedPassword,
      dto.name,
      dto.roles || ['user'], // Rol por defecto: 'user'
      true, // Usuario activo por defecto
      new Date(),
      new Date(),
    );

    // 4. Guardar usuario en repositorio
    const savedUser = await this.userRepository.create(user);

    // 5. Generar token JWT
    const token = this.tokenService.generateToken({
      sub: savedUser.id,
      email: savedUser.email,
      roles: savedUser.roles,
    });

    // 6. Retornar respuesta
    return {
      access_token: token,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        roles: savedUser.roles,
      },
    };
  }
}
