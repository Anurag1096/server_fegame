
import { Injectable } from "@nestjs/common";
import { UserEntity as User } from "../entity/user.entity";
import { PrismaService } from "prisma/prisam.service";
@Injectable()
export class UserReopsitory{
    constructor(private  prisma:PrismaService){}


    async findByUserName(userName:string): Promise<User| null> {
        const user=await this.prisma.user.findByUserName(userName)
        if(!user) return null

        return user
    
    }

}