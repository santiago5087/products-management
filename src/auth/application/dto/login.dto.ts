import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO para login de usuarios
 */
export class LoginDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @IsString({ message: 'Password debe ser texto' })
  @IsNotEmpty({ message: 'Password es requerido' })
  @MinLength(6, { message: 'Password debe tener al menos 6 caracteres' })
  password: string;
}
