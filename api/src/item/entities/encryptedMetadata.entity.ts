import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';



@Schema()
export class EncryptedMetadata  {
    @Prop({ required: true, default: ''})
    name: string;  // Encrypted name in base64
    @Prop({ required: false, default: ''})
    mimeType?: string;  // Encrypted MIME type in base64
    @Prop({ required: false, default: ''})
    notes?: string;  // Encrypted notes in base64
    @Prop({ required: false, default: ''})
    username?: string;  // Encrypted username in base64
    @Prop({ required: false, default: ''})
    password?: string;  // Encrypted password in base64
    @Prop({ required: false, default: ''})
    url?: string;  // Encrypted URL in base64
    @Prop({ required: false, default: ''})
    description?: string;  // Encrypted description in base64
    @Prop({ required: false, default: ''})
    color?: string;  // Encrypted color in base64
    @Prop({ required: false, default: ''})
    icon?: string;  // Encrypted icon in base64
}

export const EncryptedMetadataSchema = SchemaFactory.createForClass(EncryptedMetadata);