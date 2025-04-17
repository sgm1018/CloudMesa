import { UserGetDto } from './../user/UserGetDto';
import { ItemDto } from "./item.dto";

export class ItemCls {  
    private dto! : ItemDto;
    selected : boolean = false;
    expanded : boolean = false;
    size : number = 0;


    constructor(dto: ItemDto) {
        this.dto = dto;
    }

    getDto() : ItemDto {
        return this.dto;
    }


    







}