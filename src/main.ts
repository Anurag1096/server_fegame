import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule,DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config= new DocumentBuilder()
  .setTitle("server_api")
  .setDescription("All the api's belong to the game server backend")
  .setVersion("1.0")
  .addTag("game")
  .build()
  app.useGlobalPipes(new ValidationPipe({
    whitelist:true,
    forbidNonWhitelisted:true,
    transform:true,
  }))
  const documetFactory=()=> SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api',app,documetFactory)
    
  
  await app.listen(process.env.PORT ?? 3004);
}
bootstrap();
