import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from './entities/item.entity';

import { BaseService } from 'src/base/base.service';

@Injectable()
export class ItemsService extends BaseService<Item> {
  constructor(@InjectModel(Item.name) private readonly ItemModel: Model<Item>) {
    super(ItemModel);
  }
}
