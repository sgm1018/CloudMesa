import { Type } from "class-transformer";
import { IsOptional, IsNumber, Min, Max } from "class-validator";

export class PaginationParams {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page: number = 1;
  
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(20)
    limit: number = 10;
  }