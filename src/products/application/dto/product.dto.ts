import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para transferir datos de productos
 */
export class ProductDto {
  @ApiProperty({
    description: 'ID único del producto',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Dell XPS 15',
  })
  name: string;

  @ApiProperty({
    description: 'Descripción detallada del producto',
    example: 'Laptop potente con procesador Intel i7, 16GB RAM y pantalla 4K',
  })
  description: string;

  @ApiProperty({
    description: 'Precio del producto',
    example: 1299.99,
  })
  price: number;

  @ApiProperty({
    description: 'Cantidad disponible en inventario',
    example: 50,
  })
  stock: number;

  @ApiProperty({
    description: 'Indica si el producto está disponible (stock > 0)',
    example: true,
  })
  available: boolean;

  @ApiProperty({
    description: 'Valor total del inventario (price * stock)',
    example: 64999.50,
  })
  totalValue: number;

  @ApiProperty({
    description: 'Fecha de creación del producto',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del producto',
    example: '2024-01-16T14:20:00.000Z',
  })
  updatedAt: Date;
}
