import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

@Schema()
export class Encryption {

    
    algorithm: string;
    encryptedKey: string;  // Clave de cifrado simétrico en base64
    nonce: string;  // Needed for chcha20 + poly1305
    ephemeralPublicKey: string;  // Needed for shared secret generation 
}

export const EncryptionSchema = SchemaFactory.createForClass(Encryption);