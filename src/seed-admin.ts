import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { USER_REPOSITORY } from './auth/domain/ports/outbound/user.repository.port';
import { PASSWORD_SERVICE } from './auth/domain/ports/outbound/password.service.port';
import { User } from './auth/domain/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

/**
 * Script de seed para crear usuario administrador inicial
 */
async function seedAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userRepository = app.get(USER_REPOSITORY);
  const passwordService = app.get(PASSWORD_SERVICE);

  console.log('🔐 Iniciando seed de usuario administrador...\n');

  const adminEmail = 'admin@example.com';

  // Verificar si ya existe
  const existingAdmin = await userRepository.findByEmail(adminEmail);

  if (existingAdmin) {
    console.log('⚠️  Usuario administrador ya existe');
    console.log(`   Email: ${adminEmail}`);
    console.log('\n');
    await app.close();
    return;
  }

  // Hashear password
  const hashedPassword = await passwordService.hash('admin123');

  // Crear usuario administrador
  const admin = new User(
    uuidv4(),
    adminEmail,
    hashedPassword,
    'Administrador',
    ['admin', 'user'],
    true,
    new Date(),
    new Date(),
  );

  try {
    await userRepository.create(admin);
    console.log('✅ Usuario administrador creado exitosamente');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: admin123`);
    console.log(`   Roles: ${admin.roles.join(', ')}`);
    console.log('\n⚠️  IMPORTANTE: Cambia el password en producción!\n');
  } catch (error: any) {
    console.error('❌ Error al crear usuario administrador:', error.message);
  }

  await app.close();
}

seedAdmin().catch((error) => {
  console.error('❌ Error en seed:', error);
  process.exit(1);
});
