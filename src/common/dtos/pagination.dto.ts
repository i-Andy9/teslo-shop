import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDTO {
    @IsOptional()
    @IsPositive()
    @Type( ()=> Number )// enableImplicitCOnversion : true
    limit?: number

    @IsOptional()
    @IsInt()
    @Type( ()=> Number )// enableImplicitCOnversion : true
    offset?: number
}