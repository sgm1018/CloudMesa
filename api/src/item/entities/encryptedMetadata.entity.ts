import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';



@Schema()
export class EncryptedMetadata  {
    @Prop({ required: true, default: ''})
    userId: string;
    @Prop({ required: true, default: ''})
    encryptedKey: string; 
    @Prop({ required: true, default: ''})
    name: string;  // Nombre cifrado en base64
    @Prop({ required: false, default: ''})
    size?: string;  // Tamaño cifrado en base64
    @Prop({ required: false, default: ''})
    mimeType?: string;  // Tipo MIME cifrado en base64
    @Prop({ required: false, default: ''})
    path?: string;  // Ruta cifrada en base64
    @Prop({ required: false, default: ''})
    notes?: string;  // Notas cifradas en base64
    @Prop({ required: false, default: ''})
    username?: string;  // Nombre de usuario cifrado en base64
    @Prop({ required: false, default: ''})
    password?: string;  // Contraseña cifrada en base64
    @Prop({ required: false, default: ''})
    url?: string;  // URL cifrada en base64
    @Prop({ required: false, default: ''})
    description?: string;  // Descripción cifrada en base64
    @Prop({ required: false, default: ''})
    color?: string;  // Color cifrado en base64
    @Prop({ required: false, default: ''})
    icon?: string;  // Icono cifrado en base64
}

export const EncryptedMetadataSchema = SchemaFactory.createForClass(EncryptedMetadata);