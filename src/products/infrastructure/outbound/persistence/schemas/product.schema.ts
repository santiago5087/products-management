import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Schema de Mongoose para Product
 * 
 * Este schema define cómo se almacenan los productos en MongoDB.
 * Es parte del adaptador de salida (outbound adapter).
 */
@Schema({ timestamps: true, collection: 'products' })
export class ProductDocument extends Document {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true, minlength: 3, maxlength: 100 })
  name!: string;

  @Prop({ required: true, minlength: 10, maxlength: 500 })
  description!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ required: true, min: 0 })
  stock!: number;

  @Prop()
  createdAt!: Date;
 
  @Prop()
  updatedAt!: Date;
}

export const ProductSchema = SchemaFactory.createForClass(ProductDocument);

// Índices para optimizar búsquedas
ProductSchema.index({ name: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ stock: 1 });
