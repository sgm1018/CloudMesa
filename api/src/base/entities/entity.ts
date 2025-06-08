import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';

export type UserDocument = Entity & Document;

@Schema()
export class Entity {
  @ApiProperty({
    description: 'MongoDB ObjectId identifier',
    type: String,
    required: false,
    example: '61a12345b9c1a2b3c4d5e6f7'
  })
  @IsString()
  @Prop({ required: false, type: Types.ObjectId })
  _id?: Types.ObjectId = new Types.ObjectId();
  
  @ApiProperty({  
    description: 'Creation timestamp',
    type: Date,
    example: new Date().toISOString()
  })
  @IsDate()
  @Prop({ default: Date.now })
  createdAt: Date = new Date(Date.now());

  @ApiProperty({
    description: 'Last update timestamp',
    type: Date,
    example: new Date().toISOString()
  })
  @IsDate()
  @IsOptional()
  @Prop({ default: Date.now })
  updatedAt?: Date;

  @ApiProperty({
    description: 'ID of the user who created the entity',
    type: String,
    required: false,
    example: '61a12345b9c1a2b3c4d5e6f7'
  })
  @IsOptional()
  @IsString()
  @Prop()
  userCreator?: string;
  
  @ApiProperty({
    description: 'ID of the user who last updated the entity',
    type: String,
    required: false,
    example: '61a12345b9c1a2b3c4d5e6f7'
  })
  @IsOptional()
  @IsString()
  @Prop()
  userUpdater?: string;
}
