import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para registro de usuarios
 */
export class RegisterDto {
  @ApiProperty({
    description: 'Email único del usuario',
    example: 'user@example.com',
    type: String,
  })
  @IsEmail({}, { message: 'Email debe ser válido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email!: string;

  @ApiProperty({
    description: 'Contraseña del usuario (entre 6 y 50 caracteres)',
    example: 'password123',
    minLength: 6,
    maxLength: 50,
    type: String,
  })
  @IsString({ message: 'Password debe ser texto' })
  @IsNotEmpty({ message: 'Password es requerido' })
  @MinLength(6, { message: 'Password debe tener al menos 6 caracteres' })
  @MaxLength(50, { message: 'Password no debe exceder 50 caracteres' })
  password!: string;

  @ApiProperty({
    description: 'Nombre completo del usuario (entre 2 y 100 caracteres)',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
    type: String,
  })
  @IsString({ message: 'Name debe ser texto' })
  @IsNotEmpty({ message: 'Name es requerido' })
  @MinLength(2, { message: 'Name debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'Name no debe exceder 100 caracteres' })
  name!: string;

  @ApiProperty({
    description: 'Roles del usuario (opcional, por defecto ["user"])',
    example: ['user'],
    type: [String],
    required: false,
  })
  @IsArray({ message: 'Roles debe ser un array' })
  @IsOptional()
  roles?: string[];
}
