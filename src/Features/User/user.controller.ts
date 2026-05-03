import { Controller,Get,Req,Res,Post } from "@nestjs/common";
import { UserService } from "./user.service";
//need to use dto when passing data to the service from request object
@Controller()
export class UserController{
    constructor(private readonly userService:UserService){}

    @Get("/user")
    getUser(){
        return this.userService.getUser()
    }


    @Post("/user")
    saveUser(@Req() req:Request){
        console.log(req)
        return this.userService.createUser()
    }

}