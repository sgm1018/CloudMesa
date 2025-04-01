import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from './entities/item.entity';

import { BaseService } from 'src/base/base.service';
import { ApiResponse } from 'src/shared/responses/ApiResponse';

@Injectable()
export class ItemsService extends BaseService<Item> {
  constructor(@InjectModel(Item.name) private readonly ItemModel: Model<Item>) {
    super(ItemModel);
  }


  async findItemByUser(userId : string, itemId : string) : Promise<ApiResponse<Item>>{
    const item = await this.findOne({ _id: itemId, userId: userId });
    if (!item.isSuccess()){
      return ApiResponse.error(-1, `Item with ID "${itemId}" not found for user "${userId}"`);
    }
    return ApiResponse.item(item.value!);
  } 

  async findItemwByUserByParentIdPagination (userId : string, parentId : string, page: number, limit: number) : Promise<ApiResponse<Item[]>>{

  }

}
