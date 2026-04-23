import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRepository } from '../../../domain/ports/outbound/user.repository.port';
import { User } from '../../../domain/entities/user.entity';
import { UserDocument } from './schemas/user.schema';

/**
 * Adaptador de Salida (Outbound Adapter): Repositorio de Usuarios con Mongoose
 * 
 * Implementa IUserRepository usando MongoDB y Mongoose.
 */
@Injectable()
export class MongooseUserRepositoryAdapter implements IUserRepository {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await this.userModel.findOne({ email }).exec();
    return userDoc ? this.toDomain(userDoc) : null;
  }

  async findById(id: string): Promise<User | null> {
    const userDoc = await this.userModel.findOne({ id }).exec();
    return userDoc ? this.toDomain(userDoc) : null;
  }

  async create(user: User): Promise<User> {
    const userDoc = new this.userModel({
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name,
      roles: user.roles,
      isActive: user.isActive,
    });

    const saved = await userDoc.save();
    return this.toDomain(saved);
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const userDoc = await this.userModel
      .findOneAndUpdate({ id }, userData, { new: true })
      .exec();

    return userDoc ? this.toDomain(userDoc) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userModel.countDocuments({ email }).exec();
    return count > 0;
  }

  /**
   * Convierte un documento de Mongoose a una entidad de dominio
   */
  private toDomain(userDoc: UserDocument): User {
    return new User(
      userDoc.id,
      userDoc.email,
      userDoc.password,
      userDoc.name,
      userDoc.roles,
      userDoc.isActive,
      userDoc.createdAt,
      userDoc.updatedAt,
    );
  }
}
