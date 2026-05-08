
import { Injectable } from "@nestjs/common";
import { UserEntity as User } from "../entity/user.entity";
import { PrismaService } from "prisma/prisam.service";
import { UserDto } from "../dto/user.dto";
@Injectable()
export class UserReopsitory{
    constructor(private  prisma:PrismaService){}

    async creteUser(user:UserDto):Promise<User|null>{
        return null
    }
    async findByUserName(userName:string): Promise<User| null> {
        const user=await this.prisma.user.findUnique({where:{
            username:userName,
        }})
        if(!user) return null

        return user
    
    }

}