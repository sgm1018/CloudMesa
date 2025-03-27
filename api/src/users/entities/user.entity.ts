import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Entity } from 'src/base/entities/entity';

export type UserDocument = User & Document;

@Schema()
export class User extends Entity {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  surname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, type: Buffer })
  passwordHash: Uint8Array;  // Hash de la contraseña

  @Prop({ required: true, type: Buffer })
  passwordSalt: Uint8Array;

  @Prop()
  avatar?: string;

  @Prop({ required: true })
  publicKey: string;  // Clave pública del usuario (KP)

  @Prop({ required: true })
  maxSize: number;
}

export const UserSchema = SchemaFactory.createForClass(User);