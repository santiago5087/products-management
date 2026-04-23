import { Product } from '../../entities/product.entity';

/**
 * Opciones de paginación para el repositorio
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Resultado paginado del repositorio
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

/**
 * Puerto de Salida (Outbound Port / Secondary Port)
 * 
 * Este puerto define el contrato para la persistencia de productos.
 * Es un puerto "secundario" porque es usado/invocado por la aplicación.
 * 
 * En arquitectura hexagonal:
 * - Puerto = Interface que define el contrato
 * - Adaptador = Implementación concreta del puerto
 */
export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findAllPaginated(options: PaginationOptions): Promise<PaginatedResult<Product>>;
  findById(id: string): Promise<Product | null>;
  create(product: Product): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}

export const PRODUCT_REPOSITORY = Symbol('IProductRepository');
