import { Types } from "mongoose";

export class EntityDto{
    _id? : Types.ObjectId;
    createdAt : Date = new Date(Date.now());
    updatedAt : Date = new Date(Date.now());
    userCreator? : string;
    userUpdater? : string;
}