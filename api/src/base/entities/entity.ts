import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = Entity & Document;

@Schema()
export class Entity {
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop()
  userCreator?: string;
  
  @Prop()
  userUpdater?: string;
}

export const UserSchema = SchemaFactory.createForClass(Entity);