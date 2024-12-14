export interface UpdateRequest
{
    firstName?:string,
    lastName?:string,
    phoneNumber?:string,
    address?:string,
    oldPassword?:string,
    newPassword?:string,
    roles?:string[]
}