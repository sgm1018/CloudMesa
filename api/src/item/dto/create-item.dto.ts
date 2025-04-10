import { ApiProperty } from '@nestjs/swagger';
import { Item } from './../entities/item.entity';
import { EncryptedMetadata } from "../entities/encryptedMetadata.entity";
import { Encryption } from "../entities/encryption.entity";
import { SharedConfig } from "../entities/sharedConfig.entity";

export class CreateItemDto {
    @ApiProperty({
        description: 'Name of the item',
        type: String,
        example: 'My File'
    })
    name: string;

    @ApiProperty({
        description: 'ID of the user who owns the item',
        type: String,
        example: '61a12345b9c1a2b3c4d5e6f7'
    })
    userId: string;

    @ApiProperty({
        description: 'Type of the item',
        enum: ['file', 'folder', 'password', 'group'],
        example: 'file'
    })
    type: 'file' | 'folder' | 'password' | 'group';

    @ApiProperty({
        description: 'ID of the parent item (if any)',
        type: String,
        required: false,
        example: '61a12345b9c1a2b3c4d5e6f7'
    })
    parentId?: string;

    @ApiProperty({
        description: 'Encrypted metadata of the item',
        type: EncryptedMetadata,
        example: {
            name: 'ZW5jcnlwdGVkX25hbWU=',
            mimeType: 'ZW5jcnlwdGVkX21pbWVUeXBl',
            notes: 'ZW5jcnlwdGVkX25vdGVz',
            username: 'ZW5jcnlwdGVkX3VzZXJuYW1l',
            password: 'ZW5jcnlwdGVkX3Bhc3N3b3Jk',
            url: 'ZW5jcnlwdGVkX3VybA==',
            description: 'ZW5jcnlwdGVkX2Rlc2NyaXB0aW9u',
            color: 'ZW5jcnlwdGVkX2NvbG9y',
            icon: 'ZW5jcnlwdGVkX2ljb24='
        }
    })
    encryptedMetadata: EncryptedMetadata;

    @ApiProperty({
        description: 'Encryption data for the item',
        type: Encryption,
        example: {
            algorithm: 'aes-256-cbc',
            iv: '1234567890123456',
            key: 'abcdef1234567890abcdef1234567890'
        }
    })
    encryption: Encryption;
    @ApiProperty({
        description: 'List of users the item is shared with',
        type: [SharedConfig],
        required: false,
        example: [
            {
                userId: '61a12345b9c1a2b3c4d5e6f7',
                permissions: {
                    read: true,
                    write: false
                },
                dateShared: new Date().toISOString(),
                lastAccessed: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                link: 'https://example.com/share/abc123',
                encryptedKey: 'ABCDEF1234567890ABCDEF1234567890'
            }
        ]
    })
    sharedWith?: SharedConfig[];

    constructor() {
        this.name = '';
        this.userId = '';
        this.type = 'file';
        this.encryptedMetadata = new EncryptedMetadata();
        this.encryption = new Encryption();
        this.sharedWith = [];
    }

    public toClassArg(itemcls: Item){
        itemcls.name = this.name;
        itemcls.userId = this.userId;
        itemcls.type = this.type;
        itemcls.encryptedMetadata = this.encryptedMetadata;
        itemcls.encryption = this.encryption;
        itemcls.sharedWith = this.sharedWith;
        return itemcls;
    }

    public toClass() : Item{
        const itemcls = new Item();
        itemcls.name = this.name;
        itemcls.userId = this.userId;
        itemcls.type = this.type;
        itemcls.encryptedMetadata = this.encryptedMetadata;
        itemcls.encryption = this.encryption;
        itemcls.sharedWith = this.sharedWith;
        return itemcls;
    }
}