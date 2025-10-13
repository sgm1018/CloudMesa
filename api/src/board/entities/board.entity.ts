import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Entity } from '../../base/entities/entity';
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * Representa un elemento individual en el Board
 */
export interface BoardElement {
  id: string;
  type: 'rectangle' | 'circle' | 'diamond' | 'line' | 'arrow' | 'text' | 'image' | 'freehand';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  rotation?: number;
  zIndex: number;
  
  // Propiedades de estilo
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  opacity?: number;
  fillStyle?: 'solid' | 'hachure' | 'cross-hatch';
  
  // Para líneas y flechas
  points?: { x: number; y: number }[];
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
  
  // Para texto
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  
  // Para imágenes
  imageUrl?: string;
  imageData?: string; // Base64 para imágenes embebidas
  
  // Para dibujo libre
  path?: string; // SVG path data
  
  // Metadata
  locked?: boolean;
  groupId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Configuración del viewport (zoom y posición)
 */
export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Configuración compartida con otros usuarios (reutiliza sistema existente)
 */
export interface SharedConfig {
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  encryptedKey?: string;
  publicKey?: string;
}

/**
 * Información de cursor de colaborador en tiempo real
 */
export interface CollaboratorCursor {
  userId: string;
  username: string;
  color: string;
  x: number;
  y: number;
  lastUpdate: Date;
}

export type BoardDocument = Board & Document;

@Schema({ timestamps: true, _id: false })
export class Board extends Entity {
    @Prop({ required: true, trim: true })
    name: string;


    @IsString()
    @IsNotEmpty()
    @Prop({ required: true })
    owner: string;

    @Prop({
        type: [Object],
        default: [],
        validate: {
        validator: function (elements: BoardElement[]) {
            // Validar que todos los elementos tengan campos requeridos
            return elements.every(
            (el) =>
                el.id &&
                el.type &&
                typeof el.x === 'number' &&
                typeof el.y === 'number' &&
                typeof el.zIndex === 'number',
            );
        },
        message: 'Invalid board element structure',
        },
    })
    elements: BoardElement[];

    @Prop({
        type: Object,
        default: { x: 0, y: 0, zoom: 1 },
        validate: {
        validator: function (viewport: Viewport) {
            return (
            typeof viewport.x === 'number' &&
            typeof viewport.y === 'number' &&
            typeof viewport.zoom === 'number' &&
            viewport.zoom > 0 &&
            viewport.zoom <= 5
            );
        },
        message: 'Invalid viewport configuration',
        },
    })
    viewport: Viewport;

    @Prop({
        type: [Object],
        default: [],
        validate: {
        validator: function (configs: SharedConfig[]) {
            return configs.every(
            (config) =>
                config.userId &&
                ['owner', 'editor', 'viewer'].includes(config.role),
            );
        },
        message: 'Invalid shared configuration',
        },
    })
    sharedConfig: SharedConfig[];

    @Prop({ type: [Object], default: [] })
    cursors: CollaboratorCursor[];

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop()
    deletedAt?: Date;
}

export const BoardSchema = SchemaFactory.createForClass(Board);

// Índices para optimizar queries
BoardSchema.index({ owner: 1, isDeleted: 1 });
BoardSchema.index({ 'sharedConfig.userId': 1, isDeleted: 1 });
BoardSchema.index({ createdAt: -1 });
BoardSchema.index({ updatedAt: -1 });
BoardSchema.index({ name: 'text' }); // Text search

// Middleware para actualizar updatedAt automáticamente
BoardSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Virtual para obtener número de elementos
BoardSchema.virtual('elementCount').get(function () {
  return this.elements ? this.elements.length : 0;
});

// Virtual para obtener colaboradores con permisos
BoardSchema.virtual('collaborators').get(function () {
  return this.sharedConfig.filter((config) => config.role !== 'owner');
});
