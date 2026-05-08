import { Injectable } from "@nestjs/common";
import { UserDto } from "./dto/user.dto";
import { FindOneDto } from "./dto/findOne.dto";
import { UserEntity as User } from "./entity/user.entity";
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

    async findOne(findOne:FindOneDto):Promise<User|null>{
        // this will call the userRepo(this handles the db call's for the user api)
        return {username:"Anurag", id:231, password:"anurag233",email:'asdd@gmail.com'}
    }
}
