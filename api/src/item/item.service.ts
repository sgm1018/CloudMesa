import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from './entities/item.entity';

import { BaseService } from 'src/base/base.service';
import { ApiResponse } from 'src/shared/responses/ApiResponse';
import { PaginationParams } from 'src/shared/responses/paginationParams';

@Injectable()
export class ItemsService extends BaseService<Item> {
  constructor(@InjectModel(Item.name) private readonly ItemModel: Model<Item>) {
    super(ItemModel);
  }


  // async findItemByUser(userId : string, itemId : string) : Promise<ApiResponse<Item>>{
  //   const item = await this.findOne({ _id: itemId, userId: userId });
  //   if (!item.isSuccess()){
  //     return ApiResponse.error(-1, `Item with ID "${itemId}" not found for user "${userId}"`);
  //   }
  //   return ApiResponse.item(item.value!);
  // } 

  async findItemwByUserByParentIdPagination (userId : string, parentId : string, paginationParams: PaginationParams) : Promise<ApiResponse<Item>>{
    const items = await this.findPaginated({ userId: userId, parentId: parentId }, paginationParams);
    if (!items.isSuccess()){
      return ApiResponse.error(-1, `Items with parentId "${parentId}" not found for user "${userId}"`);
    }
    if (items.total === 0){
      return ApiResponse.empty(`Items with parentId "${parentId}" not found for user "${userId}"`);
    }
    return ApiResponse.list(items.list!);
  }

}
