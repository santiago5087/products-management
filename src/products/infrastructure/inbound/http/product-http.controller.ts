import { Controller, Get, Post, Put, Delete, Param, Body, Inject, ValidationPipe, UsePipes, HttpCode, HttpStatus } from '@nestjs/common';
import type { IGetAllProductsUseCase, IGetProductByIdUseCase } from '../../../domain/ports/inbound/product-use-cases.port';
import { GET_ALL_PRODUCTS_USE_CASE, GET_PRODUCT_BY_ID_USE_CASE } from '../../../domain/ports/inbound/product-use-cases.port';
import { ProductDto } from '../../../application/dto/product.dto';
import { CreateProductDto, UpdateProductDto } from '../../../application/dto/create-product.dto';
import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../../../application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '../../../application/use-cases/delete-product.use-case';

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
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ProductHttpController {
  constructor(
    @Inject(GET_ALL_PRODUCTS_USE_CASE)
    private readonly getAllProductsUseCase: IGetAllProductsUseCase,
    
    @Inject(GET_PRODUCT_BY_ID_USE_CASE)
    private readonly getProductByIdUseCase: IGetProductByIdUseCase,
    
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Get()
  async findAll(): Promise<ProductDto[]> {
    return await this.getAllProductsUseCase.execute();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductDto> {
    return await this.getProductByIdUseCase.execute(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductDto> {
    return await this.createProductUseCase.execute(createProductDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductDto> {
    return await this.updateProductUseCase.execute(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return await this.deleteProductUseCase.execute(id);
  }
}
