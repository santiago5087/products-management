import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Products Management API')
    .setDescription('API REST para gestión de productos con arquitectura hexagonal, autenticación JWT y paginación')
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticación y autorización')
    .addTag('products', 'Endpoints de gestión de productos (CRUD + paginación)')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingresa el token JWT obtenido del endpoint /auth/login',
        name: 'JWT',
        in: 'header',
      },
      'JWT-auth' // Nombre de la referencia para usar con @ApiBearerAuth()
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Products API - Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  await app.listen(envs.port);
  console.log(`🚀 Aplicación corriendo en: http://localhost:${envs.port}`);
  console.log(`📊 Productos disponibles en: http://localhost:${envs.port}/products`);
  console.log(`📚 Documentación Swagger: http://localhost:${envs.port}/api`);
}
bootstrap();
