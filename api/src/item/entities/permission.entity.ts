import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';



@Schema()
export class Permission {
    @Prop({ required: true, default: false })
    read: boolean;
    @Prop({ required: true, default: false })
    write: boolean;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);