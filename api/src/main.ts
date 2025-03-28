import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const configService = app.get(ConfigService);
    // Configuración de Swagger
  const config = new DocumentBuilder()
  .setTitle('CloudMesa API')
  .setDescription('API para CloudMesa')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  
  const port = configService.get<number>('PORT') || 3000;
  console.log(`Running at: http://localhost:${port}`);
  console.log(`swagger at: http://localhost:${port}/swagger`);
  
  await app.listen(port);
}

bootstrap();