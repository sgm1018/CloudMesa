import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';



@Schema()
export class Encryption {
    @Prop({ required: true, default: ''})
    iv: string;  // Vector de inicialización para AES-256-GCM
    @Prop({ required: true, default: ''})
    algorithm: string;
    @Prop({ required: true, default: ''})
    encryptedKey: string;  // Clave de cifrado simétrico en base64

}

export const EncryptionSchema = SchemaFactory.createForClass(Encryption );