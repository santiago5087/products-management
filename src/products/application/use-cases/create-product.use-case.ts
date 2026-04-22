import { Inject, Injectable, ConflictException } from '@nestjs/common';
import type { IProductRepository } from '../../domain/ports/outbound/product.repository.port';
import { PRODUCT_REPOSITORY } from '../../domain/ports/outbound/product.repository.port';
import { ProductDto } from '../dto/product.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { Product } from '../../domain/entities/product.entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * Caso de Uso: Crear un producto
 */
@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(dto: CreateProductDto): Promise<ProductDto> {
    // Verificar si ya existe un producto con el mismo nombre
    const allProducts = await this.productRepository.findAll();
    const exists = allProducts.some(p => 
      p.name.toLowerCase() === dto.name.toLowerCase()
    );

    if (exists) {
      throw new ConflictException(`Ya existe un producto con el nombre "${dto.name}"`);
    }

    // Crear entidad de dominio
    const product = new Product(
      uuidv4(), // Generar ID único
      dto.name,
      dto.description,
      dto.price,
      dto.stock,
      new Date(),
      new Date(),
    );

    // Guardar en repositorio
    const saved = await this.productRepository.create(product);

    return this.toDto(saved);
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
