import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/Features/User/user.service';

@Injectable()
export class AuthService {
constructor(private readonly userService:UserService){}

async signIn(userName:string, pass:string){
   // will use findone service from userService
   const user= this.userService.findOne({userName})
    if(user?.password !== pass){
        throw new UnauthorizedException();
    }
    const {password, ...result}=users
    // genrate a jwt and return it.
    return result
}

}
