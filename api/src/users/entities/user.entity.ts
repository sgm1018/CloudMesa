import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Entity } from 'src/base/entities/entity';

export type UserDocument = User & Document;

@Schema()
export class User extends Entity {
  @Prop({ required: true })
  name: string = '';

  @Prop({ required: true })
  surname: string = '';

  @Prop({ required: true, unique: true })
  email: string = '';

  @Prop({ required: true })
  passwordHash: string = '';

  @Prop()
  avatar?: string = '';

  @Prop({ required: true })
  publicKey: string = '';

  @Prop({ required: true })
  maxSize: number = 0;

  @Prop({ required: true })
  roles: string[] = [];

  @Prop({ required: true })
  isActive: boolean = true;
  @Prop({ required: true })
  isVerified: boolean = false;


  constructor() {
    super();
  }

}

export const UserSchema = SchemaFactory.createForClass(User);
