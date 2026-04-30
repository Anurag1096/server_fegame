import { Controller, Get,Logger,Post,Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger= new Logger()
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(@Req() request:Request): string {
    // this.logger.log(request)
    console.log(request)
    return this.appService.getHello();
  }
}


@Controller("data")
export class PostController{
  constructor(private appService:AppService){}
  
  @Post()
  postData(@Req() request:Request):string{
    console.log(request)
    const bodyValue=request.body
    return this.appService.postData(bodyValue)
  }
}