// They map the request objects.
import { IsString,IsEmail,IsNumber,IsNotEmpty,MinLength ,IsDate, IsAlphanumeric} from "class-validator"
//need to see if the userDto needs an id parameter 
import { ApiProperty } from "@nestjs/swagger"

export class UserDto{

    @ApiProperty()
@IsString()
@IsNotEmpty()
readonly username: string

@ApiProperty()
@IsAlphanumeric()
@IsNotEmpty()
readonly password:string


@ApiProperty()
@IsEmail()
readonly email:string

}