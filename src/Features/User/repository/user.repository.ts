
import { Injectable } from "@nestjs/common";
import { UserEntity as User } from "../entity/user.entity";
import { PrismaService } from "prisma/prisam.service";
import { UserDto } from "../dto/user.dto";
@Injectable()
export class UserReopsitory {
    constructor(private prisma: PrismaService) { }

    async creteUser(user: UserDto): Promise<User | null> {
        return null
    }
    async findByUserName(username: string): Promise<User | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    username: username,
                }
            })
            return user
        } catch (error) {
            console.log(error)
            return null
        }
    }

}