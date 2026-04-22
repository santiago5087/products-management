import { Inject, Injectable } from '@nestjs/common';
import type { IProductRepository } from '../../domain/ports/outbound/product.repository.port';
import { PRODUCT_REPOSITORY } from '../../domain/ports/outbound/product.repository.port';
import type { IGetAllProductsUseCase } from '../../domain/ports/inbound/product-use-cases.port';
import { ProductDto } from '../dto/product.dto';
import { Product } from '../../domain/entities/product.entity';

/**
 * Caso de Uso: Obtener todos los productos
 * 
 * Este caso de uso IMPLEMENTA el puerto de entrada IGetAllProductsUseCase
 * y USA el puerto de salida IProductRepository
 */
@Injectable()
export class GetAllProductsUseCase implements IGetAllProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(): Promise<ProductDto[]> {
    const products = await this.productRepository.findAll();
    return products.map(this.toDto);
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
