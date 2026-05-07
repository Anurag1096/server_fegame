import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostController } from './app.controller';
import { UserModule } from './Features/User/user.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [UserModule, AuthModule],
  controllers: [AppController,PostController],
  providers: [AppService],
})
export class AppModule {}
