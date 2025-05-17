import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDate, IsObject, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Permission } from './permission.entity';
import { Encryption } from './encryption.entity';

@Schema()
export class SharedConfig {
    @ApiProperty({
        description: 'ID of the user the item is shared with',
        type: String,
        example: '61a12345b9c1a2b3c4d5e6f7'
    })
    @IsString()
    @IsNotEmpty()
    @Prop({ required: true })
    userId: string;
    
    @ApiProperty({
        description: 'Permissions granted to the shared user',
        type: Object,
        example: {
            read: true,
            write: false
        }
    })
    @IsObject()
    @ValidateNested()
    @Type(() => Permission)
    @Prop({ required: true, type: Object })
    permissions: Permission;
    
    @ApiProperty({
        description: 'Date when the item was shared',
        type: Date,
        example: new Date().toISOString()
    })
    @IsDate()
    @Type(() => Date)
    @Prop({ required: true })
    dateShared: Date;
    
    @ApiProperty({
        description: 'Last time the shared item was accessed',
        type: Date,
        required: false,
        example: new Date().toISOString()
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    @Prop()
    lastAccessed?: Date;
    
    @ApiProperty({
        description: 'Date when the sharing expires',
        type: Date,
        required: false,
        example: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    @Prop()
    expiresAt?: Date;
    
    @ApiProperty({
        description: 'Sharing link for the item',
        type: String,
        required: false,
        example: 'https://example.com/share/abc123'
    })
    @IsOptional()
    @IsString()
    @Prop()
    link?: string;
    
    @ApiProperty({
        description: 'Encrypted symmetric key in base64',
        type: String,
        example: 'ABCDEF1234567890ABCDEF1234567890'
    })
    @IsString()
    @IsNotEmpty()
    @Prop({ required: true, default: ''})
    encryptedKey: string;
}

export const SharedConfigSchema = SchemaFactory.createForClass(SharedConfig);