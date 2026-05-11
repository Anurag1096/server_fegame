import { Injectable } from "@nestjs/common";
import { UserDto } from "./dto/user.dto";
import { FindOneDto } from "./dto/findOne.dto";
import { UserEntity as User } from "./entity/user.entity";
// we will use prizma for the database connection
import { UserReopsitory } from "./repository/user.repository";
@Injectable()
export class UserService {

    constructor(private userRepo: UserReopsitory) { }
    getUser() {
        return "THE DATA LIST OF USER IN JSON FORMAT";
    }
    async createUser({username,password,email}: UserDto) {
        console.log()
        return { message: "User saved to the database" }
    }

    async findOne({ username }: FindOneDto) {
        // this will call the userRepo(this handles the db call's for the user api)
        try {
            const user = await this.userRepo.findByUserName(username)
            return user
        } catch (error) {
            console.error("error in finding user", error)
            return error
        }


    }

}
