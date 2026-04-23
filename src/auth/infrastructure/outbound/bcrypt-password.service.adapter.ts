import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IPasswordService } from '../../domain/ports/outbound/password.service.port';

/**
 * Adaptador de Salida (Outbound Adapter): Servicio de Passwords con bcrypt
 * 
 * Implementa IPasswordService usando bcrypt para hashear passwords.
 */
@Injectable()
export class BcryptPasswordServiceAdapter implements IPasswordService {
  private readonly saltRounds = 10;

  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
