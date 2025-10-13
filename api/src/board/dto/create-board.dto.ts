import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BoardElement, Viewport } from '../entities/board.entity';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  elements?: BoardElement[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ViewportDto)
  viewport?: Viewport;
}

export class ViewportDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  @Min(0.1)
  @Max(5)
  zoom: number;
}
