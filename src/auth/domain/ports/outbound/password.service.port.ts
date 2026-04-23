/**
 * Puerto de Salida (Outbound Port): Servicio de Passwords
 * 
 * Define el contrato para hashear y verificar passwords.
 * Las implementaciones concretas (adaptadores) estarán en infrastructure/outbound.
 */
export interface IPasswordService {
  /**
   * Hashea un password en texto plano
   */
  hash(plainPassword: string): Promise<string>;

  /**
   * Compara un password en texto plano con su hash
   */
  compare(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

/**
 * Token de inyección de dependencias
 */
export const PASSWORD_SERVICE = Symbol('PASSWORD_SERVICE');
