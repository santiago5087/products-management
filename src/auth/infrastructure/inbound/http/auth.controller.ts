import { Controller, Post, Body, HttpCode, HttpStatus, Inject, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import type { ILoginUseCase, IRegisterUseCase } from '../../../domain/ports/inbound/auth-use-cases.port';
import { LOGIN_USE_CASE, REGISTER_USE_CASE } from '../../../domain/ports/inbound/auth-use-cases.port';
import { LoginDto } from '../../../application/dto/login.dto';
import { RegisterDto } from '../../../application/dto/register.dto';
import { AuthResponseDto } from '../../../application/dto/auth-response.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Auth } from '../decorators/auth.decorator';

/**
 * Adaptador de Entrada (Inbound Adapter): Controlador de Autenticación
 * 
 * Maneja los endpoints HTTP de autenticación:
 * - POST /auth/register - Registro de usuarios
 * - POST /auth/login - Login de usuarios
 * - GET /auth/profile - Obtener perfil del usuario autenticado
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(LOGIN_USE_CASE)
    private readonly loginUseCase: ILoginUseCase,

    @Inject(REGISTER_USE_CASE)
    private readonly registerUseCase: IRegisterUseCase,
  ) {}

  /**
   * Registro de nuevos usuarios
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Registrar nuevo usuario',
    description: 'Crea una nueva cuenta de usuario con email, contraseña, nombre y roles opcionales. Por defecto se asigna el rol "user".'
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos o email ya registrado',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be an email', 'password must be longer than or equal to 6 characters'],
        error: 'Bad Request'
      }
    }
  })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return await this.registerUseCase.execute(dto);
  }

  /**
   * Login de usuarios
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario con email y contraseña. Devuelve un token JWT válido por 1 día.'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciales inválidas',
    schema: {
      example: {
        statusCode: 401,
        message: 'Credenciales inválidas',
        error: 'Unauthorized'
      }
    }
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return await this.loginUseCase.execute(dto);
  }

  /**
   * Obtener perfil del usuario autenticado
   * Endpoint protegido que requiere autenticación
   */
  @Get('profile')
  @Auth() // Requiere autenticación
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener perfil del usuario autenticado',
    description: 'Devuelve la información del usuario actual. Requiere token JWT en el header Authorization.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil del usuario',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        email: 'admin@example.com',
        name: 'Admin User',
        roles: ['admin'],
        isActive: true
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autenticado o token inválido',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized'
      }
    }
  })
  async getProfile(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      isActive: user.isActive,
    };
  }
}
