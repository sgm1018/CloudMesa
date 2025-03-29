import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = Entity & Document;

@Schema()
export class Entity {
  // Declara el _id como propiedad opcional
  _id?: Types.ObjectId;
  
  @Prop({ default: Date.now })
  createdAt: Date = new Date(Date.now());

  @Prop({ default: Date.now })
  updatedAt: Date = new Date(Date.now());

  @Prop()
  userCreator?: string;
  
  @Prop()
  userUpdater?: string;
}

