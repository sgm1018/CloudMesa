import { Module } from '@nestjs/common';
import { FilesController } from './item.controller';
import { FilesService } from './item.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Item, ItemSchema } from './entities/item.entity';
import { BaseService } from 'src/base/base.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Item.name, schema: ItemSchema }]),
  ],
  controllers: [FilesController],
  providers: [FilesService, BaseService],
  exports: [FilesService],
})
export class FilesModule {}