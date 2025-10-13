import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ShareBoardDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(['owner', 'editor', 'viewer'])
  role: 'owner' | 'editor' | 'viewer';

  @IsOptional()
  @IsString()
  encryptedKey?: string;

  @IsOptional()
  @IsString()
  publicKey?: string;
}

export class ShareMultipleBoardDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShareBoardDto)
  shares: ShareBoardDto[];
}

export class RemoveShareDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
