import { ProductDto } from '../../../application/dto/product.dto';
import { PaginatedResponseDto, PaginationQueryDto } from '../../../application/dto/pagination.dto';

/**
 * Puerto de Entrada (Inbound Port / Primary Port)
 * 
 * Este puerto define el contrato para los casos de uso de productos.
 * Es un puerto "primario" porque es invocado desde el exterior (controllers).
 * 
 * Los casos de uso (application layer) implementan estos puertos.
 */
export interface IGetAllProductsUseCase {
  execute(): Promise<ProductDto[]>;
}

export interface IGetPaginatedProductsUseCase {
  execute(query: PaginationQueryDto): Promise<PaginatedResponseDto<ProductDto>>;
}

export interface IGetProductByIdUseCase {
  execute(id: string): Promise<ProductDto>;
}

// Símbolos para inyección de dependencias
export const GET_ALL_PRODUCTS_USE_CASE = Symbol('IGetAllProductsUseCase');
export const GET_PAGINATED_PRODUCTS_USE_CASE = Symbol('IGetPaginatedProductsUseCase');
export const GET_PRODUCT_BY_ID_USE_CASE = Symbol('IGetProductByIdUseCase');
