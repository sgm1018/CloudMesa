import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { Item, ItemSchema } from './entities/item.entity';
import { ChunkUpload, ChunkUploadSchema } from './entities/chunk-upload.entity';
import { BaseService } from 'src/base/base.service';
import { ItemsController } from './item.controller';
import { ItemsService } from './item.service';
import { ChunkUploadCleanupService } from './services/chunk-upload-cleanup.service';
import { ChunkValidationService } from './services/chunk-validation.service';
import { StreamingDownloadService } from './services/streaming-download.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Item.name, schema: ItemSchema },
      { name: ChunkUpload.name, schema: ChunkUploadSchema }
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [ItemsController],
  providers: [ItemsService, ChunkUploadCleanupService, ChunkValidationService, StreamingDownloadService],
  exports: [ItemsService],
})
export class FilesModule {}