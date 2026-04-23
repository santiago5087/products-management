import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { envs } from '../config';

// Domain
import { USER_REPOSITORY } from './domain/ports/outbound/user.repository.port';
import { PASSWORD_SERVICE } from './domain/ports/outbound/password.service.port';
import { TOKEN_SERVICE } from './domain/ports/outbound/token.service.port';
import { LOGIN_USE_CASE, REGISTER_USE_CASE, VALIDATE_TOKEN_USE_CASE } from './domain/ports/inbound/auth-use-cases.port';

// Use Cases
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { ValidateTokenUseCase } from './application/use-cases/validate-token.use-case';

// Infrastructure - Outbound
import { MongooseUserRepositoryAdapter } from './infrastructure/outbound/persistence/mongoose-user.repository.adapter';
import { BcryptPasswordServiceAdapter } from './infrastructure/outbound/bcrypt-password.service.adapter';
import { JwtTokenServiceAdapter } from './infrastructure/outbound/jwt-token.service.adapter';
import { UserDocument, UserSchema } from './infrastructure/outbound/persistence/schemas/user.schema';

// Infrastructure - Inbound
import { AuthController } from './infrastructure/inbound/http/auth.controller';
import { JwtAuthGuard } from './infrastructure/inbound/guards/jwt-auth.guard';
import { RolesGuard } from './infrastructure/inbound/guards/roles.guard';

/**
 * Módulo de Autenticación con Arquitectura Hexagonal
 * 
 * Este módulo conecta todos los puertos con sus adaptadores:
 * 
 * PUERTOS DE ENTRADA (Inbound Ports):
 * - ILoginUseCase → implementado por LoginUseCase
 * - IRegisterUseCase → implementado por RegisterUseCase
 * - IValidateTokenUseCase → implementado por ValidateTokenUseCase
 * 
 * ADAPTADORES DE ENTRADA (Inbound Adapters):
 * - AuthController → maneja peticiones HTTP
 * - JwtAuthGuard → guard de autenticación
 * - RolesGuard → guard de autorización por roles
 * 
 * PUERTOS DE SALIDA (Outbound Ports):
 * - IUserRepository → interfaz para persistencia de usuarios
 * - IPasswordService → interfaz para hashear passwords
 * - ITokenService → interfaz para generar/validar tokens
 * 
 * ADAPTADORES DE SALIDA (Outbound Adapters):
 * - MongooseUserRepositoryAdapter → implementa IUserRepository con MongoDB
 * - BcryptPasswordServiceAdapter → implementa IPasswordService con bcrypt
 * - JwtTokenServiceAdapter → implementa ITokenService con @nestjs/jwt
 */
@Module({
  imports: [
    // Configuración de JWT
    JwtModule.register({
      secret: envs.jwtSecret,
      signOptions: {
        expiresIn: envs.jwtExpiresIn as any,
      },
    }),

    // Configuración de Mongoose para User
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema }
    ]),
  ],

  controllers: [
    AuthController, // Adaptador de entrada HTTP
  ],

  providers: [
    // Casos de Uso (implementan puertos de entrada)
    {
      provide: LOGIN_USE_CASE,
      useClass: LoginUseCase,
    },
    {
      provide: REGISTER_USE_CASE,
      useClass: RegisterUseCase,
    },
    {
      provide: VALIDATE_TOKEN_USE_CASE,
      useClass: ValidateTokenUseCase,
    },

    // Adaptadores de Salida (implementan puertos de salida)
    {
      provide: USER_REPOSITORY,
      useClass: MongooseUserRepositoryAdapter,
    },
    {
      provide: PASSWORD_SERVICE,
      useClass: BcryptPasswordServiceAdapter,
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenServiceAdapter,
    },

    // Guards (adaptadores de entrada)
    JwtAuthGuard,
    RolesGuard,
  ],

  exports: [
    // Exportar guards para usar en otros módulos
    JwtAuthGuard,
    RolesGuard,
    // Exportar casos de uso si otros módulos los necesitan
    VALIDATE_TOKEN_USE_CASE,
  ],
})
export class AuthModule {}
