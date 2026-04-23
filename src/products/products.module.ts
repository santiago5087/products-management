import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductHttpController } from './infrastructure/inbound/http/product-http.controller';
import { GetAllProductsUseCase } from './application/use-cases/get-all-products.use-case';
import { GetPaginatedProductsUseCase } from './application/use-cases/get-paginated-products.use-case';
import { GetProductByIdUseCase } from './application/use-cases/get-product-by-id.use-case';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { MongooseProductRepositoryAdapter } from './infrastructure/outbound/persistence/mongoose-product.repository.adapter';
import { ProductDocument, ProductSchema } from './infrastructure/outbound/persistence/schemas/product.schema';
import { PRODUCT_REPOSITORY } from './domain/ports/outbound/product.repository.port';
import { GET_ALL_PRODUCTS_USE_CASE, GET_PAGINATED_PRODUCTS_USE_CASE, GET_PRODUCT_BY_ID_USE_CASE } from './domain/ports/inbound/product-use-cases.port';
import { AuthModule } from '../auth/auth.module';

/**
 * Módulo de Productos con Arquitectura Hexagonal + MongoDB + JWT
 * 
 * Este módulo conecta todos los puertos con sus adaptadores:
 * 
 * PUERTOS DE ENTRADA (Inbound Ports):
 * - IGetAllProductsUseCase → implementado por GetAllProductsUseCase
 * - IGetProductByIdUseCase → implementado por GetProductByIdUseCase
 * 
 * ADAPTADORES DE ENTRADA (Inbound Adapters):
 * - ProductHttpController → usa los puertos de entrada (protegido con JWT)
 * 
 * PUERTOS DE SALIDA (Outbound Ports):
 * - IProductRepository → interfaz para persistencia
 * 
 * ADAPTADORES DE SALIDA (Outbound Adapters):
 * - MongooseProductRepositoryAdapter → implementa IProductRepository con MongoDB
 * 
 * NOTA: Los adaptadores están organizados en la carpeta 'infrastructure/'
 * que contiene las implementaciones concretas de los puertos.
 */
@Module({
  imports: [
    // Registrar el schema de Mongoose
    MongooseModule.forFeature([
      { name: ProductDocument.name, schema: ProductSchema }
    ]),
    // Importar AuthModule para acceder a guards JWT
    AuthModule,
  ],
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
      provide: GET_PAGINATED_PRODUCTS_USE_CASE,
      useClass: GetPaginatedProductsUseCase,
    },
    {
      provide: GET_PRODUCT_BY_ID_USE_CASE,
      useClass: GetProductByIdUseCase,
    },
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    
    // Adaptador de Salida (implementa puerto de salida)
    {
      provide: PRODUCT_REPOSITORY,
      useClass: MongooseProductRepositoryAdapter,
      // Antes usábamos: InMemoryProductRepositoryAdapter
      // Ahora usamos: MongooseProductRepositoryAdapter con MongoDB
    },
  ],
  exports: [GET_ALL_PRODUCTS_USE_CASE, GET_PAGINATED_PRODUCTS_USE_CASE, GET_PRODUCT_BY_ID_USE_CASE],
})
export class ProductsModule {}
