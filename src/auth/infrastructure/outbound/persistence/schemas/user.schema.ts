import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Schema de Mongoose para User
 * 
 * Este schema define cómo se almacenan los usuarios en MongoDB.
 */
@Schema({ timestamps: true, collection: 'users' })
export class UserDocument extends Document {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true, minlength: 2, maxlength: 100 })
  name!: string;

  @Prop({ required: true, type: [String], default: ['user'] })
  roles!: string[];

  @Prop({ required: true, default: true })
  isActive!: boolean;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);

// Índices para optimizar búsquedas
UserSchema.index({ isActive: 1 });
