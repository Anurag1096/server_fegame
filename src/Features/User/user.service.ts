import { Injectable } from "@nestjs/common";
// we will use prizma for the database connection
@Injectable()
export class UserService{
    getUser(){
        return "THE DATA LIST OF USER IN JSON FORMAT";
    }
    async createUser(){
        return "User saved to the database" 
    }
}
