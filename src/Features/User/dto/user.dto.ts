// They map the request objects.
import { IsString,IsEmail,IsNumber,IsNotEmpty,MinLength ,IsDate, IsAlphanumeric} from "class-validator"
//need to see if the userDto needs an id parameter 
export class UserDto{

@IsString()
@IsNotEmpty()
readonly username: string

@IsAlphanumeric()
@IsNotEmpty()
readonly password:string

@IsEmail()
readonly email:string

}