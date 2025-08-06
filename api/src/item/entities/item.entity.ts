import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Entity } from 'src/base/entities/entity';
import { EncryptedMetadata } from './encryptedMetadata.entity';
import { Encryption } from './encryption.entity';
import { SharedConfig } from './sharedConfig.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, ValidateNested, IsArray, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

@Schema()
/**
 * Represents an Item entity, which can be a file, folder, password, or group.
 * It stores encrypted content and metadata, along with sharing configurations.
 */
export class Item extends Entity {


  @ApiProperty({
    description: 'ID of the user who owns the item',
    type: String,
    example: '61a12345b9c1a2b3c4d5e6f7'
  })
  @IsString()
  @IsNotEmpty()
  @Prop({ required: true })
  userId: string;
  
  @ApiProperty({
    description: 'Type of the item',
    enum: ['file', 'folder', 'password', 'group'],
    example: 'file'
  })
  @IsEnum(['file', 'folder', 'password', 'group'])
  @Prop({ required: true, enum: ['file', 'folder', 'password', 'group'] })
  type: 'file' | 'folder' | 'password' | 'group';
  
  @ApiProperty({
    description: 'ID of the parent item (if any)',
    type: String,
    required: false,
    example: '61a12345b9c1a2b3c4d5e6f7'
  })
  @IsOptional()
  @IsString()
  @Prop()
  parentId?: string;

  @ApiProperty({
    description: 'Encrypted metadata of the item',
    type: EncryptedMetadata,
    example: {
      name: 'ZW5jcnlwdGVkX25hbWU=',
      mimeType: 'ZW5jcnlwdGVkX21pbWVUeXBl',
      notes: 'ZW5jcnlwdGVkX25vdGVz',
      username: 'ZW5jcnlwdGVkX3VzZXJuYW1l',
      password: 'ZW5jcnlwdGVkX3Bhc3N3b3Jk',
      url: 'ZW5jcnlwdGVkX3VybA=='
    }
  })
  @ValidateNested()
  @Type(() => EncryptedMetadata)
  @Prop({ required: true, type: Object })
  encryptedMetadata: EncryptedMetadata;
  
  @ApiProperty({
    description: 'Encryption data for the item',
    type: Encryption,
    example: {
      algorithm: 'aes-256-cbc',
      iv: '1234567890123456',
      encryptedKey: 'abcdef1234567890abcdef1234567890'
    }
  })
  @ValidateNested()
  @Type(() => Encryption)
  @Prop({ required: true, type: Object })
  encryption: Encryption;
  
  @ApiProperty({
    description: 'List of users the item is shared with',
    type: [SharedConfig],
    required: false,
    example: [
      {
        userId: '61a12345b9c1a2b3c4d5e6f7',
        permissions: {
          read: true,
          write: false
        },
        dateShared: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        link: 'https://example.com/share/abc123',
        encryptedKey: 'ABCDEF1234567890ABCDEF1234567890'
      }
    ]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SharedConfig)
  @Prop({ type: Array })
  sharedWith?: SharedConfig[];



  size : number;

}

export const ItemSchema = SchemaFactory.createForClass(Item);