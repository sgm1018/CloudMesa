import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Entity } from 'src/base/entities/entity';
import { EncryptedMetadata } from './encryptedMetadata.entity';
import { Encryption } from './encryption.entity';
import { SharedConfig } from './sharedConfig.entity';


@Schema()
/**
 * Represents an Item entity, which can be a file, folder, password, or group.
 * It stores encrypted content and metadata, along with sharing configurations.
 */
export class Item extends Entity {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  userId: string;
  
  @Prop({ required: true, enum: ['file', 'folder', 'password', 'group'] })
  type: 'file' | 'folder' | 'password' | 'group';
  
  @Prop()
  parentId?: string;

  @Prop({ required: true, type: Object })
  encryptedMetadata: EncryptedMetadata;
  
  @Prop({ required: true, type: Object })
  encryption: Encryption;
  
  
  @Prop({ type: Array })
  sharedWith?: SharedConfig[];

}

export const ItemSchema = SchemaFactory.createForClass(Item);