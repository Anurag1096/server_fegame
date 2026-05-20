//Entity are the response objects

import { Exclude } from "class-transformer";
export class UserEntity{
  id:number;
  username:string;
  email:string;
  @Exclude()
  password: string;
   
}