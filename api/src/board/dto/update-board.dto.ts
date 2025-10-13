import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BoardElement, Viewport } from '../entities/board.entity';
import { ViewportDto } from './create-board.dto';

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  elements?: BoardElement[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ViewportDto)
  viewport?: Viewport;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}
