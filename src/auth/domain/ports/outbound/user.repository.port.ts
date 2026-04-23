import type { User } from '../../entities/user.entity';

/**
 * Puerto de Salida (Outbound Port): Repositorio de Usuarios
 * 
 * Define el contrato para persistir usuarios.
 * Las implementaciones concretas (adaptadores) estarán en infrastructure/outbound.
 */
export interface IUserRepository {
  /**
   * Busca un usuario por email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Busca un usuario por ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Crea un nuevo usuario
   */
  create(user: User): Promise<User>;

  /**
   * Actualiza un usuario existente
   */
  update(id: string, userData: Partial<User>): Promise<User | null>;

  /**
   * Verifica si existe un usuario con el email dado
   */
  existsByEmail(email: string): Promise<boolean>;
}

/**
 * Token de inyección de dependencias
 */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
