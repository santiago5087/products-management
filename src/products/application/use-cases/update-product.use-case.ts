import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IProductRepository } from '../../domain/ports/outbound/product.repository.port';
import { PRODUCT_REPOSITORY } from '../../domain/ports/outbound/product.repository.port';
import { ProductDto } from '../dto/product.dto';
import { UpdateProductDto } from '../dto/create-product.dto';
import { Product } from '../../domain/entities/product.entity';

/**
 * Caso de Uso: Actualizar un producto
 */
@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string, dto: UpdateProductDto): Promise<ProductDto> {
    const existingProduct = await this.productRepository.findById(id);

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Actualizar entidad
    const updated = await this.productRepository.update(id, dto);

    if (!updated) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.toDto(updated);
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
