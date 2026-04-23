/**
 * DTO de respuesta de autenticación
 */
export interface AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  };
}
