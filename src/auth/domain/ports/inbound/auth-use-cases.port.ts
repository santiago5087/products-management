import type { LoginDto } from '../../../application/dto/login.dto';
import type { RegisterDto } from '../../../application/dto/register.dto';
import type { AuthResponseDto } from '../../../application/dto/auth-response.dto';
import type { User } from '../../entities/user.entity';

/**
 * Puerto de Entrada (Inbound Port): Caso de Uso de Login
 */
export interface ILoginUseCase {
  execute(dto: LoginDto): Promise<AuthResponseDto>;
}

/**
 * Puerto de Entrada (Inbound Port): Caso de Uso de Registro
 */
export interface IRegisterUseCase {
  execute(dto: RegisterDto): Promise<AuthResponseDto>;
}

/**
 * Puerto de Entrada (Inbound Port): Caso de Uso de Validación de Token
 */
export interface IValidateTokenUseCase {
  execute(token: string): Promise<User>;
}

/**
 * Tokens de inyección de dependencias
 */
export const LOGIN_USE_CASE = Symbol('LOGIN_USE_CASE');
export const REGISTER_USE_CASE = Symbol('REGISTER_USE_CASE');
export const VALIDATE_TOKEN_USE_CASE = Symbol('VALIDATE_TOKEN_USE_CASE');
