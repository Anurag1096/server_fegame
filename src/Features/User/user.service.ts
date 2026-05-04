import { Injectable } from "@nestjs/common";
import { UserDto } from "./dto/user.dto";
// we will use prizma for the database connection
@Injectable()
export class UserService{
    getUser(){
        return "THE DATA LIST OF USER IN JSON FORMAT";
    }
    async createUser(userDto:UserDto){
        console.log(userDto)
        return {message:"User saved to the database",data:userDto} 
    }
}
