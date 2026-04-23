import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenService, TokenPayload } from '../../domain/ports/outbound/token.service.port';

/**
 * Adaptador de Salida (Outbound Adapter): Servicio de Tokens JWT
 * 
 * Implementa ITokenService usando @nestjs/jwt.
 */
@Injectable()
export class JwtTokenServiceAdapter implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(payload: TokenPayload): string {
    return this.jwtService.sign({
      sub: payload.sub,
      email: payload.email,
      roles: payload.roles,
    });
  }

  verifyToken(token: string): TokenPayload {
    return this.jwtService.verify<TokenPayload>(token);
  }
}
