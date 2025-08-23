import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { Encryption } from '../entities/encryption.entity';

export class ChunkUploadDto {
  @ApiProperty({
    description: 'ID único de la subida',
    type: String,
    example: 'upload_123456789'
  })
  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @ApiProperty({
    description: 'Número del chunk (comenzando desde 0)',
    type: Number,
    example: 0
  })
  @IsNumber()
  @Min(0)
  chunkNumber: number;

  @ApiProperty({
    description: 'Número total de chunks',
    type: Number,
    example: 5
  })
  @IsNumber()
  @Min(1)
  totalChunks: number;

  @ApiProperty({
    description: 'Tamaño total del archivo en bytes',
    type: Number,
    example: 1048576
  })
  @IsNumber()
  @Min(1)
  totalSize: number;
}

export class FinishUploadDto {
  @ApiProperty({
    description: 'ID único de la subida',
    type: String,
    example: 'upload_123456789'
  })
  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @ApiProperty({
    description: 'Metadatos del item a crear',
    type: Object,
    example: {
      name: 'documento.pdf',
      description: 'Archivo importante',
      parentId: '61a12345b9c1a2b3c4d5e6f7'
    }
  })
  itemMetadata: {
    name: string;
    description?: string;
    parentId?: string;
    type: 'file' | 'folder' | 'password' | 'group';
    encryptedMetadata: any;
    encryption: Encryption;
  };
}
