import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

@Schema()
export class Encryption {
    @ApiProperty({
        description: 'Initialization vector for encryption',
        type: String,
        example: '1234567890123456'
    })
    @IsString()
    @IsNotEmpty()
    @Prop({ required: true, default: ''})
    iv: string;  // Vector de inicialización para AES-256-GCM
    
    @ApiProperty({
        description: 'Encryption algorithm name',
        type: String,
        example: 'aes-256-gcm'
    })
    @IsString()
    @IsNotEmpty()
    @Prop({ required: true, default: ''})
    algorithm: string;
    
    @ApiProperty({
        description: 'Base64 encoded encrypted symmetric key',
        type: String,
        example: 'bXlFbmNyeXB0ZWRLZXlJbkJhc2U2NEZvcm1hdA=='
    })
    @IsString()
    @IsNotEmpty()
    @Prop({ required: true, default: ''})
    encryptedKey: string;  // Clave de cifrado simétrico en base64
}

export const EncryptionSchema = SchemaFactory.createForClass(Encryption);