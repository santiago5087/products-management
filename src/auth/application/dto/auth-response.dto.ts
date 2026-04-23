import { ApiProperty } from '@nestjs/swagger';

/**
 * Información del usuario en la respuesta de autenticación
 */
export class UserResponseDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'admin@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Admin User',
  })
  name: string;

  @ApiProperty({
    description: 'Roles asignados al usuario',
    example: ['admin'],
    type: [String],
  })
  roles: string[];
}

/**
 * DTO de respuesta de autenticación
 */
export class AuthResponseDto {
  @ApiProperty({
    description: 'Token JWT para autenticación (válido por 1 día)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Información del usuario autenticado',
    type: UserResponseDto,
  })
  user: UserResponseDto;
}
