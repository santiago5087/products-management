import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IProductRepository } from '../../domain/ports/outbound/product.repository.port';
import { PRODUCT_REPOSITORY } from '../../domain/ports/outbound/product.repository.port';

/**
 * Caso de Uso: Eliminar un producto
 */
@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const deleted = await this.productRepository.delete(id);

    if (!deleted) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
