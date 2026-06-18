import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionfilter } from './utils/exception.filters';
import * as cookieParser from 'cookie-parser';
import { getHttpCorsOptions } from './config/cors.config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());
    app.enableCors(getHttpCorsOptions());

    const config = new DocumentBuilder()
        .setTitle('server_api')
        .setDescription("All the api's belong to the game server backend")
        .setVersion('1.0')
        .addTag('game')
        .addTag('auth')
        .build();
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    const documetFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documetFactory);

    app.useGlobalFilters(new HttpExceptionfilter());
    await app.listen(process.env.PORT ?? 3004);
}
bootstrap();
