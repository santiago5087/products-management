import { Product } from '../../entities/product.entity';

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
  findById(id: string): Promise<Product | null>;
}

export const PRODUCT_REPOSITORY = Symbol('IProductRepository');
