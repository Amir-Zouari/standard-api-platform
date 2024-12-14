import { Role } from "./role";

export interface User
{
    id?:number,
    username?:string,
    email?:string,
    firstName?:string,
    lastName?:string,
    phoneNumber?:string,
    address?:string,
    password?:string,
    roles?:any[]
}