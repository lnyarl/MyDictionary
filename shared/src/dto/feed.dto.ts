import { PaginationDto } from "./pagination.dto";
import {  IsString, } from "class-validator";

export class GetFeedsByTerm extends PaginationDto {
    @IsString()
    term: string;
}

export class GetFeedsByTag extends PaginationDto {
    @IsString()
    tag: string;
}