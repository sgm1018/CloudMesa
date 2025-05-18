import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

@Schema()
export class EncryptedMetadata {
    @ApiProperty({
        description: 'Encrypted name in base64',
        type: String,
        example: 'ZW5jcnlwdGVkX25hbWU='
    })
    @IsString()
    @Prop({ required: true, default: ''})
    name: string;

    // @ApiProperty({
    //     description: 'Encrypted MIME type in base64',
    //     type: String,
    //     required: false,
    //     example: 'ZW5jcnlwdGVkX21pbWVUeXBl'
    // })
    // @IsOptional()
    // @IsString()
    // @Prop({ required: false, default: ''})
    // mimeType?: string;

    @ApiProperty({
        description: 'Encrypted notes in base64',
        type: String,
        required: false,
        example: 'ZW5jcnlwdGVkX25vdGVz'
    })
    @IsOptional()
    @IsString()
    @Prop({ required: false, default: ''})
    notes?: string;

    @ApiProperty({
        description: 'Encrypted username in base64',
        type: String,
        required: false,
        example: 'ZW5jcnlwdGVkX3VzZXJuYW1l'
    })
    @IsOptional()
    @IsString()
    @Prop({ required: false, default: ''})
    username?: string;

    @ApiProperty({
        description: 'Encrypted password in base64',
        type: String,
        required: false,
        example: 'ZW5jcnlwdGVkX3Bhc3N3b3Jk'
    })
    @IsOptional()
    @IsString()
    @Prop({ required: false, default: ''})
    password?: string;

    @ApiProperty({
        description: 'Encrypted URL in base64',
        type: String,
        required: false,
        example: 'ZW5jcnlwdGVkX3VybA=='
    })
    @IsOptional()
    @IsString()
    @Prop({ required: false, default: ''})
    url?: string;

    @ApiProperty({
        description: 'Encrypted description in base64',
        type: String,
        required: false,
        example: 'ZW5jcnlwdGVkX2Rlc2NyaXB0aW9u'
    })
    @IsOptional()
    @IsString()
    @Prop({ required: false, default: ''})
    description?: string;

    @ApiProperty({
        description: 'Encrypted color in base64',
        type: String,
        required: false,
        example: 'ZW5jcnlwdGVkX2NvbG9y'
    })
    @IsOptional()
    @IsString()
    @Prop({ required: false, default: ''})
    color?: string;

    @ApiProperty({
        description: 'Encrypted icon in base64',
        type: String,
        required: false,
        example: 'ZW5jcnlwdGVkX2ljb24='
    })
    @IsOptional()
    @IsString()
    @Prop({ required: false, default: ''})
    icon?: string;
}

export const EncryptedMetadataSchema = SchemaFactory.createForClass(EncryptedMetadata);