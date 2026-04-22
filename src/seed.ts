import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PRODUCT_REPOSITORY } from './products/domain/ports/outbound/product.repository.port';
import { Product } from './products/domain/entities/product.entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * Script de seed para poblar la base de datos con productos de ejemplo
 */
async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const productRepository = app.get(PRODUCT_REPOSITORY);

  const products: Product[] = [
    new Product(
      uuidv4(),
      'Laptop Dell XPS 15',
      'Laptop de alto rendimiento con procesador Intel i7, 16GB RAM y SSD 512GB',
      1299.99,
      15,
      new Date(),
      new Date(),
    ),
    new Product(
      uuidv4(),
      'Mouse Logitech MX Master 3',
      'Mouse ergonómico inalámbrico de precisión con sensor de hasta 4000 DPI',
      99.99,
      50,
      new Date(),
      new Date(),
    ),
    new Product(
      uuidv4(),
      'Teclado Mecánico Keychron K8',
      'Teclado mecánico inalámbrico con switches Gateron y retroiluminación RGB',
      89.99,
      30,
      new Date(),
      new Date(),
    ),
    new Product(
      uuidv4(),
      'Monitor LG UltraWide 34"',
      'Monitor curvo UltraWide con resolución QHD (3440x1440) y panel IPS',
      599.99,
      8,
      new Date(),
      new Date(),
    ),
    new Product(
      uuidv4(),
      'Webcam Logitech C920',
      'Webcam HD 1080p con enfoque automático y micrófonos estéreo',
      79.99,
      0,
      new Date(),
      new Date(),
    ),
    new Product(
      uuidv4(),
      'Audífonos Sony WH-1000XM4',
      'Audífonos inalámbricos con cancelación de ruido y hasta 30 horas de batería',
      349.99,
      25,
      new Date(),
      new Date(),
    ),
  ];

  console.log('🌱 Iniciando seed de productos...\n');

  for (const product of products) {
    try {
      await productRepository.create(product);
      console.log(`✅ Creado: ${product.name}`);
    } catch (error: any) {
      console.error(`❌ Error al crear ${product.name}:`, error.message);
    }
  }

  console.log('\n✨ Seed completado!\n');
  await app.close();
}

seed().catch((error) => {
  console.error('❌ Error en seed:', error);
  process.exit(1);
});
