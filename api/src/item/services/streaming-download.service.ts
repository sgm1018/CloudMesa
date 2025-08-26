import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Item } from '../entities/item.entity';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class StreamingDownloadService {
  constructor(
    @InjectModel(Item.name) private readonly ItemModel: Model<Item>
  ) {}

  /**
   * Obtiene un stream del archivo para descarga streaming
   */
  async downloadFileStream(userId: string, itemId: string, response: Response): Promise<void> {
    try {
      // Verificar que el item existe y pertenece al usuario
      const item = await this.ItemModel.findOne({ _id: new Types.ObjectId(itemId), userId: userId });
      if (!item) {
        throw new NotFoundException('Item not found or not authorized');
      }

      const filePath = path.join('data', userId, item._id.toString());

      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('File not found on disk');
      }

      // Obtener información del archivo
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;

      // Configurar headers para streaming
      response.setHeader('Content-Type', 'application/octet-stream');
      response.setHeader('Content-Length', fileSize.toString());
      response.setHeader('Content-Disposition', 'attachment');
      response.setHeader('Accept-Ranges', 'bytes');
      response.setHeader('Cache-Control', 'no-cache');

      // Crear stream de lectura
      const readStream = fs.createReadStream(filePath, {
        highWaterMark: 64 * 1024, // Buffer de 64KB para optimizar la lectura
      });

      // Manejar errores del stream
      readStream.on('error', (error) => {
        console.error(`Error reading file stream: ${error.message}`);
        if (!response.headersSent) {
          response.status(500).json({ error: 'Error reading file' });
        }
      });

      // Manejar el cierre del stream del cliente
      response.on('close', () => {
        readStream.destroy();
      });

      // Pipe del stream de lectura al response
      readStream.pipe(response);

    } catch (error) {
      console.error(`Error in downloadFileStream: ${error.message}`);
      if (!response.headersSent) {
        if (error instanceof NotFoundException) {
          response.status(404).json({ error: error.message });
        } else if (error instanceof ForbiddenException) {
          response.status(403).json({ error: error.message });
        } else {
          response.status(500).json({ error: 'Internal server error' });
        }
      }
    }
  }

  /**
   * Descarga con soporte para Range requests (HTTP 206 Partial Content)
   * Permite pausar y reanudar descargas
   */
  async downloadFileStreamWithRange(
    userId: string, 
    itemId: string, 
    response: Response, 
    rangeHeader?: string
  ): Promise<void> {
    try {
      // Verificar que el item existe y pertenece al usuario
      const item = await this.ItemModel.findOne({ _id: new Types.ObjectId(itemId), userId: userId });
      if (!item) {
        throw new NotFoundException('Item not found or not authorized');
      }

      const filePath = path.join('data', userId, item._id.toString());

      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('File not found on disk');
      }

      // Obtener información del archivo
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;

      let start = 0;
      let end = fileSize - 1;
      let statusCode = 200;

      // Procesar Range header si existe
      if (rangeHeader) {
        const range = rangeHeader.replace(/bytes=/, '').split('-');
        start = parseInt(range[0], 10) || 0;
        end = parseInt(range[1], 10) || fileSize - 1;

        // Validar rango
        if (start >= fileSize || end >= fileSize) {
          response.status(416).json({ error: 'Range not satisfiable' });
          return;
        }

        statusCode = 206; // Partial Content
        response.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      }

      const contentLength = end - start + 1;

      // Configurar headers
      response.status(statusCode);
      response.setHeader('Content-Type', 'application/octet-stream');
      response.setHeader('Content-Length', contentLength.toString());
      response.setHeader('Content-Disposition', 'attachment');
      response.setHeader('Accept-Ranges', 'bytes');
      response.setHeader('Cache-Control', 'no-cache');

      // Crear stream de lectura con rango específico
      const readStream = fs.createReadStream(filePath, {
        start,
        end,
        highWaterMark: 64 * 1024, // Buffer de 64KB
      });

      // Manejar errores del stream
      readStream.on('error', (error) => {
        console.error(`Error reading file stream: ${error.message}`);
        if (!response.headersSent) {
          response.status(500).json({ error: 'Error reading file' });
        }
      });

      // Manejar el cierre del stream del cliente
      response.on('close', () => {
        readStream.destroy();
      });

      // Pipe del stream de lectura al response
      readStream.pipe(response);

    } catch (error) {
      console.error(`Error in downloadFileStreamWithRange: ${error.message}`);
      if (!response.headersSent) {
        if (error instanceof NotFoundException) {
          response.status(404).json({ error: error.message });
        } else if (error instanceof ForbiddenException) {
          response.status(403).json({ error: error.message });
        } else {
          response.status(500).json({ error: 'Internal server error' });
        }
      }
    }
  }

  /**
   * Obtiene metadata del archivo sin descargarlo
   */
  async getFileMetadata(userId: string, itemId: string): Promise<{
    size: number;
    exists: boolean;
    item: Item | null;
  }> {
    try {
      const item = await this.ItemModel.findOne({ _id: new Types.ObjectId(itemId), userId: userId });
      if (!item) {
        return { size: 0, exists: false, item: null };
      }

      const filePath = path.join('data', userId, item._id.toString());
      
      if (!fs.existsSync(filePath)) {
        return { size: 0, exists: false, item };
      }

      const stats = fs.statSync(filePath);
      return { size: stats.size, exists: true, item };

    } catch (error) {
      console.error(`Error getting file metadata: ${error.message}`);
      return { size: 0, exists: false, item: null };
    }
  }
}
