
import { Injectable } from "@nestjs/common";
import { UserEntity as User } from "../entity/user.entity";
import { PrismaService } from "prisma/prisam.service";
import { UserDto } from "../dto/user.dto";
@Injectable()
export class UserReopsitory {
    constructor(private prisma: PrismaService) { }

    async createUserRepo(userDto: UserDto): Promise<User | null> {
       
            const createdUser=await this.prisma.user.create({
                data:{
                    username:userDto.username,
                    password:userDto.password,
                    email:userDto.email
                }
            })
      if(!createdUser) return null
      return createdUser
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

    async findByEmail(email: string): Promise<User | null> {
        try {
            return await this.prisma.user.findUnique({
                where: { email },
            });
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async createOAuthUser(data: {
        username: string;
        email: string;
    }): Promise<User | null> {
        try {
            return await this.prisma.user.create({
                data: {
                    username: data.username,
                    email: data.email,
                },
            });
        } catch (error) {
            console.log(error);
            return null;
        }
    }

}