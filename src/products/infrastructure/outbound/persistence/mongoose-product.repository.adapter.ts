import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IProductRepository } from '../../../domain/ports/outbound/product.repository.port';
import { Product } from '../../../domain/entities/product.entity';
import { ProductDocument } from './schemas/product.schema';

/**
 * Adaptador de Salida: MongoDB Repository
 * 
 * Este adaptador IMPLEMENTA el puerto de salida IProductRepository
 * usando MongoDB como persistencia.
 * 
 * Responsabilidades:
 * - Conectar con MongoDB usando Mongoose
 * - Convertir documentos de MongoDB a entidades de dominio
 * - Convertir entidades de dominio a documentos de MongoDB
 */
@Injectable()
export class MongooseProductRepositoryAdapter implements IProductRepository {
  constructor(
    @InjectModel(ProductDocument.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async findAll(): Promise<Product[]> {
    const documents = await this.productModel.find().exec();
    return documents.map(doc => this.toDomain(doc));
  }

  async findById(id: string): Promise<Product | null> {
    const document = await this.productModel.findOne({ id }).exec();
    return document ? this.toDomain(document) : null;
  }

  async create(product: Product): Promise<Product> {
    const document = new this.productModel({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
    });
    
    const saved = await document.save();
    return this.toDomain(saved);
  }

  async update(id: string, product: Partial<Product>): Promise<Product | null> {
    const document = await this.productModel
      .findOneAndUpdate(
        { id },
        { $set: product },
        { new: true }
      )
      .exec();
    
    return document ? this.toDomain(document) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.productModel.deleteOne({ id }).exec();
    return result.deletedCount > 0;
  }

  /**
   * Convierte un documento de MongoDB a una entidad de dominio
   */
  private toDomain(document: ProductDocument): Product {
    return new Product(
      document.id,
      document.name,
      document.description,
      document.price,
      document.stock,
      document.createdAt,
      document.updatedAt,
    );
  }
}
