import { IsNotEmpty, IsString } from "class-validator";


export class FindOneDto{
    @IsString()
    @IsNotEmpty()
    username: string;
}