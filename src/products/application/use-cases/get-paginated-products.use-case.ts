import { Inject, Injectable } from '@nestjs/common';
import type { IProductRepository } from '../../domain/ports/outbound/product.repository.port';
import { PRODUCT_REPOSITORY } from '../../domain/ports/outbound/product.repository.port';
import type { IGetPaginatedProductsUseCase } from '../../domain/ports/inbound/product-use-cases.port';
import { ProductDto } from '../dto/product.dto';
import { PaginatedResponseDto, PaginationQueryDto } from '../dto/pagination.dto';
import { Product } from '../../domain/entities/product.entity';

/**
 * Caso de Uso: Obtener productos paginados
 * 
 * Este caso de uso IMPLEMENTA el puerto de entrada IGetPaginatedProductsUseCase
 * y USA el puerto de salida IProductRepository
 */
@Injectable()
export class GetPaginatedProductsUseCase implements IGetPaginatedProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: PaginationQueryDto): Promise<PaginatedResponseDto<ProductDto>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = query;

    const result = await this.productRepository.findAllPaginated({
      page,
      limit,
      sortBy,
      order,
    });

    const productDtos = result.data.map(this.toDto);

    return new PaginatedResponseDto(productDtos, page, limit, result.total);
  }

  private toDto(product: Product): ProductDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      available: product.isAvailable(),
      totalValue: product.getTotalValue(),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
