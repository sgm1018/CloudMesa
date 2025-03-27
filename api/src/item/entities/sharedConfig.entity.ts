import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Permission } from './permission.entity';
import { EncryptionKey } from './encryptionKey.entity';


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
    
    @Prop({ required: true, type: Object })
    encryptinKey: EncryptionKey;
}

export const SharedConfigSchema = SchemaFactory.createForClass(SharedConfig);