import { IsString, IsNumber, IsNotEmpty, MinLength, MaxLength, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para crear un producto
 * Contiene validaciones usando class-validator
 */
export class CreateProductDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @IsString({ message: 'La descripción debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description: string;

  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Type(() => Number)
  @Min(0, { message: 'El precio no puede ser negativo' })
  price: number;

  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Type(() => Number)
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;
}

/**
 * DTO para actualizar un producto
 * Todos los campos son opcionales
 */
export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Type(() => Number)
  @Min(0, { message: 'El precio no puede ser negativo' })
  price?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Type(() => Number)
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock?: number;
}
