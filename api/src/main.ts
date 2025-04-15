import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Habilitar validación global de DTOS
  // app.useGlobalPipes(new ValidationPipe({
  //   whitelist: true,            // Elimina propiedades que no están en el DTO
  //   forbidNonWhitelisted: true, // Rechaza peticiones con propiedades extra
  //   transform: false,            // Transforma automáticamente al tipo del DTO
  // }));

  // app.useGlobalPipes(new ValidationPipe({
  //   whitelist: true,
  //   forbidNonWhitelisted: true,
  //   transform: true, // Cambia a true para transformar a la clase DTO
  //   transformOptions: {
  //     enableImplicitConversion: true, // Permite la conversión implícita de tipos
  //   },
  // }));
  

  app.setGlobalPrefix('api');
  const configService = app.get(ConfigService);
    // Configuración de Swagger
  const config = new DocumentBuilder()
  .setTitle('CloudMesa API')
  .setDescription('API CloudMesa')
  .setVersion('1.0')
  .addBearerAuth(
    { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Enter JWT token' },
    'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
  )
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  
  const port = configService.get<number>('PORT') || 3000;
  console.log(`Running at: http://localhost:${port}`);
  console.log(`swagger at: http://localhost:${port}/swagger`);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // Elimina propiedades que no están en el DTO
    forbidNonWhitelisted: true, // Rechaza peticiones con propiedades extra
    transform: true, // Cambia a true para transformar a la clase DTO
    transformOptions: { 
      enableImplicitConversion: true, // Permite la conversión implícita de tipos
    },
  }));
  await app.listen(port);
}

bootstrap();