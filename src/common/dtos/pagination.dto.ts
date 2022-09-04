import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";


export class PaginationDto {

    @ApiProperty({
        default: 10,
        description: 'How many rows do yo need'
    })
    @IsOptional()
    @IsPositive()
    @Type ( () => Number)    
    limit?: number;

    @ApiProperty({
        default: 0,
        description: 'How many rows do yo want to skip'
    })
    @IsOptional()    
    @Type ( () => Number)
    @Min(0)
    offset?: number;

}