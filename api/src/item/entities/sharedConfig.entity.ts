import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Permission } from './permission.entity';
import { Encryption } from './encryption.entity';


@Schema()
export class SharedConfig {
    @Prop({ required: true })
    userId: string;
    
    @Prop({ required: true, type: Object })
    permissions: Permission;
    
    @Prop({ required: true })
    dateShared: Date;
    
    @Prop()
    lastAccessed?: Date;
    
    @Prop()
    expiresAt?: Date;
    
    @Prop()
    link?: string;
    
    @Prop({ required: true, default: ''})
    encryptedKey: string;  // Clave de cifrado simétrico en base64
}

export const SharedConfigSchema = SchemaFactory.createForClass(SharedConfig);