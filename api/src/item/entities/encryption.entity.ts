import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';



@Schema()
export class Encryption {
    @Prop({ required: true, default: ''})
    iv: string;  // Vector de inicialización para AES-256-GCM
    @Prop({ required: true, default: ''})
    algorithm: string;

}

export const EncryptionSchema = SchemaFactory.createForClass(Encryption );