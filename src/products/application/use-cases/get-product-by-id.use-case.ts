import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IProductRepository } from '../../domain/ports/outbound/product.repository.port';
import { PRODUCT_REPOSITORY } from '../../domain/ports/outbound/product.repository.port';
import type { IGetProductByIdUseCase } from '../../domain/ports/inbound/product-use-cases.port';
import { ProductDto } from '../dto/product.dto';
import { Product } from '../../domain/entities/product.entity';

/**
 * Caso de Uso: Obtener un producto por ID
 * 
 * Este caso de uso IMPLEMENTA el puerto de entrada IGetProductByIdUseCase
 * y USA el puerto de salida IProductRepository
 */
@Injectable()
export class GetProductByIdUseCase implements IGetProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string): Promise<ProductDto> {
    const product = await this.productRepository.findById(id);
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.toDto(product);
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
