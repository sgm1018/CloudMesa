import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Document, FilterQuery, Model, UpdateQuery } from 'mongoose';
import { Entity } from './entities/entity';
import { ApiResponse } from 'src/shared/responses/ApiResponse';


export class BaseService<T extends Entity> {
  /**
   * Creates an instance of BaseService.
   * @param {Model<T>} model - The Mongoose model
   */
  constructor(protected readonly model: Model<T>) {}


  async create(entity: T): Promise<ApiResponse<T>> {
    try {
      const creado = await this.model.create(entity);
      return ApiResponse.item(creado);
    } catch (error) {
      throw new BadRequestException(`Error creating entity: ${error.message}`);
    }
  }


  async findAll(filter: FilterQuery<T> = {}): Promise<ApiResponse<T>> {
    const list = await this.model.find(filter).exec();
    if (!list){
      return ApiResponse.empty();
    }
    return ApiResponse.list(list);
  }

  async findById(id: string): Promise<ApiResponse<T>> {
    const entity = await this.model.findById(id).exec();
    if (!entity) {
      return ApiResponse.empty();
    }
    return ApiResponse.item(entity);
  }

  async findOne(filter: FilterQuery<T>): Promise<ApiResponse<T>> {
    const entity = await this.model.findOne(filter).exec();
    if (!entity) {
      return ApiResponse.empty();
    }
    return ApiResponse.item(entity);
  }

  async update(entidad : T): Promise<ApiResponse<T>> {
    const entity = this.findOne({ _id: entidad._id });
    if (!entity) {
      return ApiResponse.error(-1, `Entity with ID "${entidad._id}" not found`);
    }
    try {
      await this.model.updateOne({ _id: entidad._id }, { $set: entidad }).exec();
      return ApiResponse.item(entidad);
    } catch (error) {
      return ApiResponse.error(-1, `Error updating entity: ${error.message}`);
    }


  }

  async remove(id: string): Promise<ApiResponse<T>> {
    const entity = await this.model.findByIdAndDelete(id).exec();
    if (!entity) {
      return ApiResponse.error(-1, `Entity with ID "${id}" not found`);
    }
    return ApiResponse.item(entity);
  }

  async count(filter: FilterQuery<T> = {}): Promise<ApiResponse<number>> {
    const total = await this.model.countDocuments(filter).exec();
    return ApiResponse.item(total);
  }

  async exists(filter: FilterQuery<T>): Promise<ApiResponse<boolean>> {
    const count = await this.model.countDocuments(filter).limit(1).exec();
    return ApiResponse.item(count > 0);
  }


  getRequest
}