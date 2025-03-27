import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';



@Schema()
export class StorageReference {
    @Prop({ type: String })
    path?: string;
  
    @Prop({ type: String })
    encryptedContent?: string;
  
}

export const StorageReferenceSchema = SchemaFactory.createForClass(StorageReference);
