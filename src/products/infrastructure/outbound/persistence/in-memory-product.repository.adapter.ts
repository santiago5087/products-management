import { Injectable } from '@nestjs/common';
import { IProductRepository } from '../../../domain/ports/outbound/product.repository.port';
import { Product } from '../../../domain/entities/product.entity';

/**
 * Adaptador de Salida (Outbound Adapter / Secondary Adapter)
 * 
 * Este adaptador IMPLEMENTA el puerto de salida IProductRepository.
 * Es un adaptador "secundario" porque implementa infraestructura para persistencia.
 * 
 * En este caso, es una implementación en memoria con datos de ejemplo.
 * Podría ser reemplazado fácilmente por:
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

  async findById(id: string): Promise<Product | null> {
    const product = this.products.find((p) => p.id === id);
    return product || null;
  }
}
