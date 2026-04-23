import { IsString, IsNumber, IsNotEmpty, MinLength, MaxLength, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear un producto
 * Contiene validaciones usando class-validator
 */
export class CreateProductDto {
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Dell XPS 15',
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name!: string;

  @ApiProperty({
    description: 'Descripción detallada del producto',
    example: 'Laptop potente con procesador Intel i7, 16GB RAM y pantalla 4K',
    minLength: 10,
    maxLength: 500,
  })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description!: string;

  @ApiProperty({
    description: 'Precio del producto en la moneda local',
    example: 1299.99,
    minimum: 0,
    type: Number,
  })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Type(() => Number)
  @Min(0, { message: 'El precio no puede ser negativo' })
  price!: number;

  @ApiProperty({
    description: 'Cantidad disponible en inventario',
    example: 50,
    minimum: 0,
    type: Number,
  })
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Type(() => Number)
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock!: number;
}

/**
 * DTO para actualizar un producto
 * Todos los campos son opcionales
 */
export class UpdateProductDto {
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Dell XPS 15 (Actualizado)',
    minLength: 3,
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;

  @ApiProperty({
    description: 'Descripción detallada del producto',
    example: 'Laptop con especificaciones mejoradas',
    minLength: 10,
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description?: string;

  @ApiProperty({
    description: 'Precio del producto',
    example: 1199.99,
    minimum: 0,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Type(() => Number)
  @Min(0, { message: 'El precio no puede ser negativo' })
  price?: number;

  @ApiProperty({
    description: 'Cantidad disponible en inventario',
    example: 75,
    minimum: 0,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Type(() => Number)
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock?: number;
}
