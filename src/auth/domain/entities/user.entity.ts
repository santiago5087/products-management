/**
 * Entidad de Dominio: User
 * 
 * Representa un usuario en el sistema.
 * Esta entidad contiene la lógica de negocio relacionada con usuarios.
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string, // Hash del password
    public readonly name: string,
    public readonly roles: string[],
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validate();
  }

  /**
   * Validaciones de dominio
   */
  private validate(): void {
    if (!this.email || this.email.trim().length === 0) {
      throw new Error('Email is required');
    }

    if (!this.isValidEmail(this.email)) {
      throw new Error('Invalid email format');
    }

    if (!this.password || this.password.trim().length === 0) {
      throw new Error('Password is required');
    }

    if (!this.name || this.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }

    if (!this.roles || this.roles.length === 0) {
      throw new Error('User must have at least one role');
    }
  }

  /**
   * Valida formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  /**
   * Verifica si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Crea una copia del usuario sin el password
   */
  toPublic(): Omit<User, 'password'> {
    const { password, ...publicUser } = this;
    return publicUser as Omit<User, 'password'>;
  }
}
