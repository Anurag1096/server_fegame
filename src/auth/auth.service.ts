import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/Features/User/user.service';
@Injectable()
export class AuthService {
constructor(private readonly userService:UserService){}

async signIn(){
   // will use findone service from userService
}

}
