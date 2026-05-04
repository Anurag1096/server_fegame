
import { IsString,IsEmail,IsNumber,IsNotEmpty,MinLength ,IsDate} from "class-validator"
export class UserDto{

@IsNumber()
@IsNotEmpty()
readonly id:number


@IsString()
@IsNotEmpty()
readonly name: string

@IsEmail()
readonly email:string

@IsDate()
readonly createdAt: Date

}