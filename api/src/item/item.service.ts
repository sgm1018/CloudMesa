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


  async findContainName(userid : string, name: string): Promise<ApiResponse<Item>> {
    const result = await this.ItemModel.find({ userId: userid, name: { $regex: name, $options: 'i' } }).limit(8);
    if (!result || result.length === 0) {
      return ApiResponse.empty();
    }
    return ApiResponse.list(result);
  }

  async countItems(userid: string, type: string[], parentId: string = ''): Promise<ApiResponse<number>> {
    const filter = { userId: userid, parentId: parentId, type: { $in: type } };
    const count = await this.ItemModel.countDocuments(filter).exec();
    if (count === 0) {
      return ApiResponse.empty();
    }
    return ApiResponse.item(count);
  }



  // async findItemByUser(userId : string, itemId : string) : Promise<ApiResponse<Item>>{
  //   const item = await this.findOne({ _id: itemId, userId: userId });
  //   if (!item.isSuccess()){
  //     return ApiResponse.error(-1, `Item with ID "${itemId}" not found for user "${userId}"`);
  //   }
  //   return ApiResponse.item(item.value!);
  // } 



}
