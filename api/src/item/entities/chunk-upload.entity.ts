import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Entity } from 'src/base/entities/entity';

@Schema()
export class ChunkUpload extends Entity {
  @Prop({ required: true, unique: true })
  uploadId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  totalSize: number;

  @Prop({ required: true })
  totalChunks: number;

  @Prop({ type: [Number], default: [] })
  receivedChunks: number[];

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop()
  completedAt?: Date;

  @Prop()
  tempPath: string; // Ruta donde se almacenan los chunks temporalmente
}

export const ChunkUploadSchema = SchemaFactory.createForClass(ChunkUpload);
