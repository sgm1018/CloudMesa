import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

@Schema()
export class Permission {
    @ApiProperty({
        description: 'Read permission',
        type: Boolean,
        example: true,
        default: false
    })
    @IsBoolean()
    @Prop({ required: true, default: false })
    read: boolean;

    @ApiProperty({
        description: 'Write permission',
        type: Boolean,
        example: false,
        default: false
    })
    @IsBoolean()
    @Prop({ required: true, default: false })
    write: boolean;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);