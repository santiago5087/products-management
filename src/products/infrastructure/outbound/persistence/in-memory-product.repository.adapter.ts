import { Injectable } from '@nestjs/common';
import { IProductRepository, PaginationOptions, PaginatedResult } from '../../../domain/ports/outbound/product.repository.port';
import { Product } from '../../../domain/entities/product.entity';

/**
 * Adaptador de Salida (Outbound Adapter / Secondary Adapter)
 * 
 * Este adaptador IMPLEMENTA el puerto de salida IProductRepository.
 * Es un adaptador "secundario" porque implementa infraestructura para persistencia.
 * 
 * En este caso, es una implementación en memoria con datos de ejemplo.
 * Podría ser reemplazado fácilmente por:
 * - MongooseProductRepositoryAdapter
 * - PrismaProductRepositoryAdapter
 * - TypeOrmProductRepositoryAdapter
 * - MongoProductRepositoryAdapter
 * 
 * Sin cambiar ninguna línea de código en domain o application!
 */
@Injectable()
export class InMemoryProductRepositoryAdapter implements IProductRepository {
  private products: Product[] = [
    new Product(
      '1',
      'Laptop Dell XPS 15',
      'Laptop de alto rendimiento con procesador Intel i7',
      1299.99,
      15,
      new Date('2024-01-15'),
      new Date('2024-01-15'),
    ),
    new Product(
      '2',
      'Mouse Logitech MX Master 3',
      'Mouse ergonómico inalámbrico de precisión',
      99.99,
      50,
      new Date('2024-02-10'),
      new Date('2024-02-10'),
    ),
    new Product(
      '3',
      'Teclado Mecánico Keychron K8',
      'Teclado mecánico inalámbrico con switches Gateron',
      89.99,
      30,
      new Date('2024-03-05'),
      new Date('2024-03-05'),
    ),
    new Product(
      '4',
      'Monitor LG UltraWide 34"',
      'Monitor curvo UltraWide con resolución QHD',
      599.99,
      8,
      new Date('2024-03-20'),
      new Date('2024-03-20'),
    ),
    new Product(
      '5',
      'Webcam Logitech C920',
      'Webcam HD 1080p con enfoque automático',
      79.99,
      0,
      new Date('2024-04-01'),
      new Date('2024-04-01'),
    ),
  ];

  async findAll(): Promise<Product[]> {
    return [...this.products];
  }

  async findAllPaginated(options: PaginationOptions): Promise<PaginatedResult<Product>> {
    const { page, limit, sortBy = 'createdAt', order = 'desc' } = options;
    const skip = (page - 1) * limit;

    // Clonar y ordenar
    let sorted = [...this.products];
    sorted.sort((a, b) => {
      const aValue = a[sortBy as keyof Product];
      const bValue = b[sortBy as keyof Product];
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });

    // Paginar
    const data = sorted.slice(skip, skip + limit);
    
    return {
      data,
      total: this.products.length,
    };
  }

  async findById(id: string): Promise<Product | null> {
    const product = this.products.find((p) => p.id === id);
    return product || null;
  }

  async create(product: Product): Promise<Product> {
    this.products.push(product);
    return product;
  }

  async update(id: string, productData: Partial<Product>): Promise<Product | null> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const existing = this.products[index];
    const updated = new Product(
      existing.id,
      productData.name ?? existing.name,
      productData.description ?? existing.description,
      productData.price ?? existing.price,
      productData.stock ?? existing.stock,
      existing.createdAt,
      new Date(),
    );

    this.products[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return false;

    this.products.splice(index, 1);
    return true;
  }
}
