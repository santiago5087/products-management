import { Controller, Post, Body, HttpCode, HttpStatus, Inject, Get } from '@nestjs/common';
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
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return await this.registerUseCase.execute(dto);
  }

  /**
   * Login de usuarios
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return await this.loginUseCase.execute(dto);
  }

  /**
   * Obtener perfil del usuario autenticado
   * Endpoint protegido que requiere autenticación
   */
  @Get('profile')
  @Auth() // Requiere autenticación
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
