import { Controller, Get, Post, Put, Delete, Param, Body, Inject, ValidationPipe, UsePipes, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
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
@ApiTags('products')
@ApiExtraModels(ProductDto, PaginatedResponseDto)
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
  @ApiOperation({ 
    summary: 'Listar productos (con o sin paginación)',
    description: 'Obtiene todos los productos. Si se proporcionan query params "page" o "limit", devuelve resultado paginado. Sin query params devuelve todos los productos (legacy).'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number, 
    description: 'Número de página (inicia en 1)',
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number, 
    description: 'Cantidad de productos por página (máximo 100)',
    example: 10
  })
  @ApiQuery({ 
    name: 'sortBy', 
    required: false, 
    type: String, 
    description: 'Campo por el cual ordenar (name, price, createdAt, etc.)',
    example: 'name'
  })
  @ApiQuery({ 
    name: 'order', 
    required: false, 
    enum: ['asc', 'desc'], 
    description: 'Orden ascendente o descendente',
    example: 'asc'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de productos (array simple o respuesta paginada según query params)',
    schema: {
      oneOf: [
        {
          type: 'array',
          items: { $ref: getSchemaPath(ProductDto) }
        },
        {
          allOf: [
            { $ref: getSchemaPath(PaginatedResponseDto) },
            {
              properties: {
                data: {
                  type: 'array',
                  items: { $ref: getSchemaPath(ProductDto) }
                }
              }
            }
          ]
        }
      ]
    }
  })
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
  @ApiOperation({ 
    summary: 'Obtener producto por ID',
    description: 'Busca y devuelve un producto específico por su identificador único.'
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    description: 'ID del producto (formato MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto encontrado',
    type: ProductDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Producto no encontrado',
        error: 'Not Found'
      }
    }
  })
  async findOne(@Param('id') id: string): Promise<ProductDto> {
    return await this.getProductByIdUseCase.execute(id);
  }

  /**
   * POST /products - Requiere autenticación y rol 'admin'
   */
  @Post()
  @Auth('admin') // Solo administradores pueden crear productos
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear nuevo producto',
    description: 'Crea un producto nuevo. Requiere autenticación con rol admin.'
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Producto creado exitosamente',
    type: ProductDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: ['name should not be empty', 'price must be a positive number'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autenticado',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized'
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Sin permisos (rol admin requerido)',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden'
      }
    }
  })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Actualizar producto existente',
    description: 'Actualiza un producto por su ID. Requiere autenticación con rol admin.'
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    description: 'ID del producto a actualizar',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto actualizado exitosamente',
    type: ProductDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autenticado'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Sin permisos (rol admin requerido)'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado'
  })
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
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Eliminar producto',
    description: 'Elimina un producto por su ID. Requiere autenticación con rol admin.'
  })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    description: 'ID del producto a eliminar',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Producto eliminado exitosamente'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autenticado'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Sin permisos (rol admin requerido)'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado'
  })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return await this.deleteProductUseCase.execute(id);
  }
}
