/**
 * DTO de usuario (sin password)
 */
export interface UserDto {
  id: string;
  email: string;
  name: string;
  roles: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
