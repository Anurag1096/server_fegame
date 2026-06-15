import { Controller, Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserReopsitory } from "./repository/user.repository";
import { PrismaService } from "prisma/prisam.service";
@Module({
controllers:[UserController],
providers: [UserService,UserReopsitory,PrismaService],
exports:[UserService]    
})
export class UserModule {}