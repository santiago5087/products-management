import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { envs } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para permitir peticiones desde el frontend Angular
  app.enableCors({
    origin: /^http:\/\/localhost:\d+$/,  // Permitir cualquier puerto localhost en desarrollo
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Habilitar validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
      transform: true, // Transforma los tipos automáticamente
    })
  );

  await app.listen(envs.port);
  console.log(`🚀 Aplicación corriendo en: http://localhost:${envs.port}`);
  console.log(`📊 Productos disponibles en: http://localhost:${envs.port}/products`);
}
bootstrap();
