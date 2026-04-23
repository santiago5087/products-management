import { MongooseModuleOptions } from '@nestjs/mongoose';
import { envs } from './envs';

/**
 * Configuración de MongoDB con Mongoose
 * 
 * Esta función retorna la configuración completa para la conexión a MongoDB.
 * Incluye manejadores de eventos para logging de conexión.
 */
export const getDatabaseConfig = (): MongooseModuleOptions => ({
  uri: envs.mongodbUri,
  connectionFactory: (connection) => {
    console.log('🔄 Iniciando conexión a MongoDB...');
    
    // Registrar eventos de conexión
    connection.on('connected', () => {
      console.log('✅ MongoDB conectado exitosamente');
      console.log(`📍 URI: ${envs.mongodbUri.replace(/\/\/.*@/, '//***@')}`);
    });

    connection.on('open', () => {
      console.log('✅ MongoDB abierto y listo para operaciones');
    });

    connection.on('disconnected', () => {
      console.log('⚠️  MongoDB desconectado');
    });

    connection.on('error', (error) => {
      console.error('❌ Error de conexión con MongoDB:', error.message);
    });

    connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconectado');
    });

    return connection;
  },
});
