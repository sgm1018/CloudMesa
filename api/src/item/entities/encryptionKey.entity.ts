import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';



@Schema()
export class EncryptionKey {
    @Prop({ required: true, default: ''})
    userId: string;
    @Prop({ required: true, default: ''})
    encryptedKey: string; 
}

export const EncryptionKeySchema = SchemaFactory.createForClass(EncryptionKey );