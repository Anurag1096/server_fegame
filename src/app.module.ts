import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostController } from './app.controller';
import { UserModule } from './Features/User/user.module';
@Module({
  imports: [UserModule],
  controllers: [AppController,PostController],
  providers: [AppService],
})
export class AppModule {}
