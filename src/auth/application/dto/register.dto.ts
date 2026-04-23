import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsArray, IsOptional } from 'class-validator';

/**
 * DTO para registro de usuarios
 */
export class RegisterDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email!: string;

  @IsString({ message: 'Password debe ser texto' })
  @IsNotEmpty({ message: 'Password es requerido' })
  @MinLength(6, { message: 'Password debe tener al menos 6 caracteres' })
  @MaxLength(50, { message: 'Password no debe exceder 50 caracteres' })
  password!: string;

  @IsString({ message: 'Name debe ser texto' })
  @IsNotEmpty({ message: 'Name es requerido' })
  @MinLength(2, { message: 'Name debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'Name no debe exceder 100 caracteres' })
  name!: string;

  @IsArray({ message: 'Roles debe ser un array' })
  @IsOptional()
  roles?: string[];
}
