/**
 * DTO para transferir datos de productos
 */
export interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  available: boolean;
  totalValue: number;
  createdAt: Date;
  updatedAt: Date;
}
