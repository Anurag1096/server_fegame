import { Controller,Get,Req,Res,Post, Body } from "@nestjs/common";
import { UserService } from "./user.service";

//need to use dto when passing data to the service from request object
import { UserDto } from "./dto/user.dto";
@Controller()
export class UserController{
    constructor(private readonly userService:UserService){}

    @Get("/user")
    getUser(){
        return this.userService.getUser()
    }


    @Post("/user")
    saveUser(@Body() userDto:UserDto){
        
        return this.userService.createUser(userDto)
    }

}