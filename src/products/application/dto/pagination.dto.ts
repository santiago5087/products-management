import { IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para Query Parameters de Paginación
 */
export class PaginationQueryDto {
  @ApiProperty({
    description: 'Número de página (comienza en 1)',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Cantidad de elementos por página (máximo 100)',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Campo por el cual ordenar los resultados',
    example: 'createdAt',
    default: 'createdAt',
    required: false,
  })
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Orden de los resultados (ascendente o descendente)',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc',
    required: false,
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}

/**
 * Metadata de Paginación para la respuesta
 */
export class PaginationMetaDto {
  @ApiProperty({
    description: 'Página actual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Cantidad de elementos por página',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total de elementos en la base de datos',
    example: 45,
  })
  total: number;

  @ApiProperty({
    description: 'Total de páginas disponibles',
    example: 5,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Indica si existe una página siguiente',
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Indica si existe una página anterior',
    example: false,
  })
  hasPreviousPage: boolean;
}

/**
 * DTO genérico para respuestas paginadas
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array de elementos de la página actual',
    type: 'array',
    items: { type: 'object' },
  })
  data: T[];

  @ApiProperty({
    description: 'Metadata de paginación',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;

  constructor(data: T[], page: number, limit: number, total: number) {
    this.data = data;
    this.meta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  }
}
