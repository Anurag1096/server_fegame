import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/Features/User/user.service';
import { UserEntity as User} from 'src/Features/User/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from 'src/Features/User/dto/user.dto';
import { hashPassword } from 'src/utils/hash';

@Injectable()
export class AuthService {
constructor(private readonly userService:UserService,
    private readonly jwtService:JwtService
){}

async signUp( username:string,email:string,password:string):Promise<{accessToken: string}|{message:string}>{
    //pre condition 
    // invariant
    // post condition 
    //first look if the user is there in the database 
    //if present throw error user already there
    // if the query returend is false then save the user in the database 
    // and generate the required access token 
    const user= await this.userService.findOne({username})
    if(!user){
        // crete user by calling saveto db and then return access token form it
        const { hashedPassword}= await hashPassword(password)
        if(!hashedPassword) throw new InternalServerErrorException("hashing failed")
     const newUser=await this.userService.createUser({username,password: hashedPassword,email})
     // now we just hash it and return it.
     
    }
    return {message:"the user is already there"}
}

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
