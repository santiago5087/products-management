/**
 * Payload del token JWT
 */
export interface TokenPayload {
  sub: string;      // User ID
  email: string;
  roles: string[];
  iat?: number;     // Issued at
  exp?: number;     // Expiration
}

/**
 * Puerto de Salida (Outbound Port): Servicio de Tokens
 * 
 * Define el contrato para generar y validar tokens JWT.
 * Las implementaciones concretas (adaptadores) estarán en infrastructure/outbound.
 */
export interface ITokenService {
  /**
   * Genera un token JWT con el payload dado
   */
  generateToken(payload: TokenPayload): string;

  /**
   * Verifica y decodifica un token JWT
   * @throws Error si el token es inválido o expirado
   */
  verifyToken(token: string): TokenPayload;
}

/**
 * Token de inyección de dependencias
 */
export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');
