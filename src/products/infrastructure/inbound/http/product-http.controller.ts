import { Controller, Get, Param, Inject } from '@nestjs/common';
import type { IGetAllProductsUseCase, IGetProductByIdUseCase } from '../../../domain/ports/inbound/product-use-cases.port';
import { GET_ALL_PRODUCTS_USE_CASE, GET_PRODUCT_BY_ID_USE_CASE } from '../../../domain/ports/inbound/product-use-cases.port';
import { ProductDto } from '../../../application/dto/product.dto';

/**
 * Adaptador de Entrada (Inbound Adapter / Primary Adapter)
 * 
 * Este adaptador UTILIZA los puertos de entrada (casos de uso).
 * Es un adaptador "primario" porque es el punto de entrada desde el exterior (HTTP).
 * 
 * El controlador NO conoce los detalles de implementación de los casos de uso,
 * solo conoce los puertos (interfaces).
 * 
 * Otros adaptadores primarios podrían ser:
 * - GraphQLProductResolver
 * - ProductCLICommand
 * - ProductMessageConsumer (para colas)
 */
@Controller('products')
export class ProductHttpController {
  constructor(
    @Inject(GET_ALL_PRODUCTS_USE_CASE)
    private readonly getAllProductsUseCase: IGetAllProductsUseCase,
    
    @Inject(GET_PRODUCT_BY_ID_USE_CASE)
    private readonly getProductByIdUseCase: IGetProductByIdUseCase,
  ) {}

  @Get()
  async findAll(): Promise<ProductDto[]> {
    return await this.getAllProductsUseCase.execute();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductDto> {
    return await this.getProductByIdUseCase.execute(id);
  }
}
