import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

@Schema()
export class Encryption {

    
    encryptedKey: string;  // Clave de cifrado simétrico en base64
    ephemeralPublicKey: string;  // Needed for shared secret generation 
    keyNonce: string;  // Needed for chcha20 + poly1305 to decrypt encriptedKey
    metadataNonce: string;  // Needed for decrypt metadata
    fileNonce?: string; // Needed for decrypt file
}

export const EncryptionSchema = SchemaFactory.createForClass(Encryption);