import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostController } from './app.controller';
import { UserModule } from './Features/User/user.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, GameModule],
  controllers: [AppController,PostController],
  providers: [AppService],
})
export class AppModule {}
