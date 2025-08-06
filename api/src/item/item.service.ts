import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from './entities/item.entity';

import { BaseService } from 'src/base/base.service';
import { ApiResponse } from 'src/shared/responses/ApiResponse';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ItemsService extends BaseService<Item> {
  constructor(@InjectModel(Item.name) private readonly ItemModel: Model<Item>) {
    super(ItemModel);
  }


  async findContainName(userid: string, name: string): Promise<ApiResponse<Item>> {
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

  async uploadFile(userId: string, createItem: Item, file: Express.Multer.File): Promise<ApiResponse<Item>> {
    if (!file) {
      return ApiResponse.error(-1, 'File is required');
    }
    if (!userId) {
      return ApiResponse.error(-1, 'User ID is required');
    }
    if (!createItem.encryptedMetadata.name) {
      return ApiResponse.error(-1, 'Item name is required');
    }
    if (!createItem.type) {
      return ApiResponse.error(-1, 'Item type is required');
    }
    if (createItem.type !== 'file') {
      return ApiResponse.error(-1, 'Invalid item type. Only "file" and "folder" are allowed');
    }
    try {
      const checkIfExists = await this.ItemModel.findOne({ userId: userId, name: createItem.encryptedMetadata.name, parentId: createItem.parentId }).exec();
      if (checkIfExists) {
        return ApiResponse.error(-1, 'File with the same name already exists in this folder');
      }
      const item = new this.ItemModel({ ...createItem, userId: userId });
      await this.ItemModel.create(item);
      await this.saveFileOnStorage(userId, item._id.toString(), file);
      return ApiResponse.item(createItem);
    } catch (error) {
      return ApiResponse.error(-1, `Error uploading file: ${error.message}`);
    }
  }


  async saveFileOnStorage(userid: string, itemId: string, file: Express.Multer.File): Promise<string> {
    const dirPath = path.join('data', userid);
    const filePath = path.join(dirPath, itemId); // El nombre del archivo es itemId

    await fs.promises.mkdir(dirPath, { recursive: true });
    await fs.promises.writeFile(filePath, file.buffer);
    return filePath;
  }


  // async findItemByUser(userId : string, itemId : string) : Promise<ApiResponse<Item>>{
  //   const item = await this.findOne({ _id: itemId, userId: userId });
  //   if (!item.isSuccess()){
  //     return ApiResponse.error(-1, `Item with ID "${itemId}" not found for user "${userId}"`);
  //   }
  //   return ApiResponse.item(item.value!);
  // } 



}
