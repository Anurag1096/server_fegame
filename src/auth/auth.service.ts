import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/Features/User/user.service';
import { UserEntity as User} from 'src/Features/User/entity/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
constructor(private readonly userService:UserService,
    private readonly jwtService:JwtService
){}

async signUp(){}

async signIn(userName:string, pass:string):Promise<{accessToken:string}>{
   // will use findone service from userService
   const user=await this.userService.findOne({username:userName})
    if(user?.password !== pass){
        throw new UnauthorizedException();
    }
   
    const payload={sub:user.id,userName:user.username}
    // genrate a jwt and return it.
    return {accessToken:await this.jwtService.signAsync(payload)}
}

}
