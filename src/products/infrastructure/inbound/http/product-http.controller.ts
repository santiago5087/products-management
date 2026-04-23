import { Controller, Get, Post, Put, Delete, Param, Body, Inject, ValidationPipe, UsePipes, HttpCode, HttpStatus, Query } from '@nestjs/common';
import type { IGetAllProductsUseCase, IGetProductByIdUseCase, IGetPaginatedProductsUseCase } from '../../../domain/ports/inbound/product-use-cases.port';
import { GET_ALL_PRODUCTS_USE_CASE, GET_PRODUCT_BY_ID_USE_CASE, GET_PAGINATED_PRODUCTS_USE_CASE } from '../../../domain/ports/inbound/product-use-cases.port';
import { ProductDto } from '../../../application/dto/product.dto';
import { CreateProductDto, UpdateProductDto } from '../../../application/dto/create-product.dto';
import { PaginationQueryDto, PaginatedResponseDto } from '../../../application/dto/pagination.dto';
import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../../../application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '../../../application/use-cases/delete-product.use-case';
import { Auth } from '../../../../auth/infrastructure/inbound/decorators/auth.decorator';
import { CurrentUser } from '../../../../auth/infrastructure/inbound/decorators/current-user.decorator';

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
 * 
 * PROTECCIÓN:
 * - GET endpoints: Públicos (sin autenticación)
 * - POST, PUT, DELETE: Requieren autenticación y rol 'admin'
 */
@Controller('products')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ProductHttpController {
  constructor(
    @Inject(GET_ALL_PRODUCTS_USE_CASE)
    private readonly getAllProductsUseCase: IGetAllProductsUseCase,
    
    @Inject(GET_PAGINATED_PRODUCTS_USE_CASE)
    private readonly getPaginatedProductsUseCase: IGetPaginatedProductsUseCase,
    
    @Inject(GET_PRODUCT_BY_ID_USE_CASE)
    private readonly getProductByIdUseCase: IGetProductByIdUseCase,
    
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  /**
   * GET /products - Público (todos los productos sin paginación)
   * Mantener para compatibilidad con clientes antiguos
   */
  @Get()
  async findAll(@Query() query: PaginationQueryDto): Promise<ProductDto[] | PaginatedResponseDto<ProductDto>> {
    // Si hay query params de paginación, usar endpoint paginado
    if (query.page || query.limit) {
      return await this.getPaginatedProductsUseCase.execute(query);
    }
    // Si no, devolver todos los productos (comportamiento legacy)
    return await this.getAllProductsUseCase.execute();
  }

  /**
   * GET /products/:id - Público
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductDto> {
    return await this.getProductByIdUseCase.execute(id);
  }

  /**
   * POST /products - Requiere autenticación y rol 'admin'
   */
  @Post()
  @Auth('admin') // Solo administradores pueden crear productos
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: any,
  ): Promise<ProductDto> {
    return await this.createProductUseCase.execute(createProductDto);
  }

  /**
   * PUT /products/:id - Requiere autenticación y rol 'admin'
   */
  @Put(':id')
  @Auth('admin') // Solo administradores pueden actualizar productos
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: any,
  ): Promise<ProductDto> {
    return await this.updateProductUseCase.execute(id, updateProductDto);
  }

  /**
   * DELETE /products/:id - Requiere autenticación y rol 'admin'
   */
  @Delete(':id')
  @Auth('admin') // Solo administradores pueden eliminar productos
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return await this.deleteProductUseCase.execute(id);
  }
}
