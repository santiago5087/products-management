import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { getDatabaseConfig } from './config';

@Module({
  imports: [
    // Configuración de MongoDB con Mongoose
    MongooseModule.forRootAsync({
      useFactory: () => getDatabaseConfig(),
    }),
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
