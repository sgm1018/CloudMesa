import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Entity } from 'src/base/entities/entity';
import { EncryptedMetadata } from './encryptedMetadata.entity';
import { Encryption } from './encryption.entity';
import { EncryptionKey } from './encryptionKey.entity';
import { StorageReference } from './storageReference.entity';
import { SharedConfig } from './sharedConfig.entity';


@Schema()
export class Item extends Entity {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  iv: string;

  @Prop({ required: true })
  userId: string;
  
  @Prop({ required: true, enum: ['file', 'folder', 'password', 'group'] })
  type: 'file' | 'folder' | 'password' | 'group';
  
  @Prop({ required: true })
  ownerId: string;
  
  @Prop()
  parentId?: string;
  
  @Prop({ default: false })
  shared: boolean;
  
  @Prop({ required: true, type: Object })
  encryptedMetadata: EncryptedMetadata;
  
  @Prop({ required: true, type: Object })
  encryption: Encryption;
  
  @Prop({ required: true, type: Object })
  encryptinKey: EncryptionKey;
  
  @Prop({ type: Object })
  storageReference?: StorageReference;
  
  @Prop({ type: Array })
  sharedWith?: SharedConfig[];

}

export const ItemSchema = SchemaFactory.createForClass(Item);