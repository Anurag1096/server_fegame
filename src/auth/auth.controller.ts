import { Controller, HttpCode, HttpStatus, Post,Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ok } from 'assert';
import { userInfo } from 'os';

@Controller('auth')
export class AuthController {

    
    constructor(private readonly authService:AuthService){}
    @HttpCode(HttpStatus.OK)
    @Post("signup")
    signUp(@Body() signUpDto:Record<string,any>){
        return this.authService.signUp(signUpDto.userName,signUpDto.password,signUpDto.email)
    }

    @HttpCode(HttpStatus.OK)
    @Post("login")
    signIn(@Body() signInDto: Record<string,any>){
   return this.authService.signIn(signInDto.userName,signInDto.password)
    }
}
