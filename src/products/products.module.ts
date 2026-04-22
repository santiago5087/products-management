import { Module } from '@nestjs/common';
import { ProductHttpController } from './infrastructure/inbound/http/product-http.controller';
import { GetAllProductsUseCase } from './application/use-cases/get-all-products.use-case';
import { GetProductByIdUseCase } from './application/use-cases/get-product-by-id.use-case';
import { InMemoryProductRepositoryAdapter } from './infrastructure/outbound/persistence/in-memory-product.repository.adapter';
import { PRODUCT_REPOSITORY } from './domain/ports/outbound/product.repository.port';
import { GET_ALL_PRODUCTS_USE_CASE, GET_PRODUCT_BY_ID_USE_CASE } from './domain/ports/inbound/product-use-cases.port';

/**
 * Módulo de Productos con Arquitectura Hexagonal
 * 
 * Este módulo conecta todos los puertos con sus adaptadores:
 * 
 * PUERTOS DE ENTRADA (Inbound Ports):
 * - IGetAllProductsUseCase → implementado por GetAllProductsUseCase
 * - IGetProductByIdUseCase → implementado por GetProductByIdUseCase
 * 
 * ADAPTADORES DE ENTRADA (Inbound Adapters):
 * - ProductHttpController → usa los puertos de entrada
 * 
 * PUERTOS DE SALIDA (Outbound Ports):
 * - IProductRepository → interfaz para persistencia
 * 
 * ADAPTADORES DE SALIDA (Outbound Adapters):
 * - InMemoryProductRepositoryAdapter → implementa IProductRepository
 * 
 * NOTA: Los adaptadores están organizados en la carpeta 'infrastructure/'
 * que contiene las implementaciones concretas de los puertos.
 */
@Module({
  controllers: [
    ProductHttpController, // Adaptador de entrada HTTP
  ],
  providers: [
    // Casos de Uso (implementan puertos de entrada)
    {
      provide: GET_ALL_PRODUCTS_USE_CASE,
      useClass: GetAllProductsUseCase,
    },
    {
      provide: GET_PRODUCT_BY_ID_USE_CASE,
      useClass: GetProductByIdUseCase,
    },
    
    // Adaptador de Salida (implementa puerto de salida)
    {
      provide: PRODUCT_REPOSITORY,
      useClass: InMemoryProductRepositoryAdapter,
      // Fácilmente reemplazable por:
      // useClass: PrismaProductRepositoryAdapter,
      // useClass: TypeOrmProductRepositoryAdapter,
    },
  ],
  exports: [GET_ALL_PRODUCTS_USE_CASE, GET_PRODUCT_BY_ID_USE_CASE],
})
export class ProductsModule {}
