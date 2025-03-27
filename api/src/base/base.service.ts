import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Document, FilterQuery, Model, UpdateQuery } from 'mongoose';
import { Entity } from './entities/entity';


export class BaseService<T extends Entity> {
  /**
   * Creates an instance of BaseService.
   * @param {Model<T>} model - The Mongoose model
   */
  constructor(protected readonly model: Model<T>) {}


  async create(entity: T): Promise<T> {
    try {
    
      await this.model.create(entity);
      return entity;
    } catch (error) {
      throw new BadRequestException(`Error creating entity: ${error.message}`);
    }
  }


  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async findById(id: string): Promise<T> {
    const entity = await this.model.findById(id).exec();
    if (!entity) {
      throw new NotFoundException(`Entity with ID "${id}" not found`);
    }
    return entity;
  }

  async findOne(filter: FilterQuery<T>): Promise<T> {
    const entity = await this.model.findOne(filter).exec();
    if (!entity) {
      throw new NotFoundException(`Entity not found with filter: ${JSON.stringify(filter)}`);
    }
    return entity;
  }

  async update(entidad : T): Promise<T> {
    try{

        const find = await this.model.findById(entidad).exec();
        if (!find){
            throw new NotFoundException(`Entity with ID "${entidad}" not found`);
        }
        await this.model.updateOne(entidad).exec();
        return entidad;
    }catch (error){
        throw new BadRequestException(`Error updating entity: ${error.message}`);
    }
  }

  async remove(id: string): Promise<T> {
    const entity = await this.model.findByIdAndDelete(id).exec();
    if (!entity) {
      throw new NotFoundException(`Entity with ID "${id}" not found`);
    }
    return entity;
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).limit(1).exec();
    return count > 0;
  }
}