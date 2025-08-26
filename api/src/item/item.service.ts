import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from './entities/item.entity';
import { ChunkUpload } from './entities/chunk-upload.entity';
import { ChunkUploadDto, FinishUploadDto } from './dto/chunk-upload.dto';
import { ChunkValidationService } from './services/chunk-validation.service';

import { BaseService } from 'src/base/base.service';
import { ApiResponse } from 'src/shared/responses/ApiResponse';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ItemsService extends BaseService<Item> {
  constructor(
    @InjectModel(Item.name) private readonly ItemModel: Model<Item>,
    @InjectModel(ChunkUpload.name) private readonly ChunkUploadModel: Model<ChunkUpload>,
    private readonly chunkValidationService: ChunkValidationService
  ) {
    super(ItemModel);
  }


  async findContainName(userid: string, name: string): Promise<ApiResponse<Item>> {
    const result = await this.ItemModel.find({ userId: userid, name: { $regex: name, $options: 'i' } }).limit(8);
    if (!result || result.length === 0) {
      return ApiResponse.empty();
    }
    return ApiResponse.list(result);
  }

  async countItems(userid: string, type: string[], parentId: string = ''): Promise<ApiResponse<number>> {
    const filter = { userId: userid, parentId: parentId, type: { $in: type } };
    const count = await this.ItemModel.countDocuments(filter).exec();
    if (count === 0) {
      return ApiResponse.empty();
    }
    return ApiResponse.item(count);
  }

  async uploadFile(userId: string, createItem: Item, file: Express.Multer.File): Promise<ApiResponse<Item>> {
    if (!file) {
      return ApiResponse.error(-1, 'File is required');
    }
    if (!userId) {
      return ApiResponse.error(-1, 'User ID is required');
    }
    if (!createItem.type) {
      return ApiResponse.error(-1, 'Item type is required');
    }
    if (createItem.type !== 'file') {
      return ApiResponse.error(-1, 'Invalid item type. Only "file" and "folder" are allowed');
    }
    try {
      const item = new this.ItemModel({ ...createItem, userId: userId });
      await this.ItemModel.create(item);
      await this.saveFileOnStorage(userId, item._id.toString(), file);
      return ApiResponse.item(createItem);
    } catch (error) {
      return ApiResponse.error(-1, `Error uploading file: ${error.message}`);
    }
  }

  /**
   * Inicia una nueva sesión de subida en chunks
   */
  async initializeChunkUpload(userId: string, totalSize: number, totalChunks: number): Promise<ApiResponse<{ uploadId: string }>> {
    try {
      // Validar parámetros
      this.chunkValidationService.validateUploadParams(totalSize, totalChunks);
      
      
      const uploadId = `upload_${uuidv4()}`;
      const tempPath = path.join('uploads', 'chunks', uploadId);
      
      // Crear directorio temporal para los chunks
      await fs.promises.mkdir(tempPath, { recursive: true });

      const chunkUpload: ChunkUpload = new ChunkUpload()
      chunkUpload.uploadId = uploadId;
      chunkUpload.userId = userId;
      chunkUpload.totalSize = totalSize;
      chunkUpload.totalChunks = totalChunks;
      chunkUpload.tempPath = tempPath;
      chunkUpload.receivedChunks = [];
      chunkUpload.isCompleted = false;
      chunkUpload.createdAt = new Date();
      chunkUpload.updatedAt = new Date();

      await this.ChunkUploadModel.create(chunkUpload);
      return ApiResponse.item({ uploadId });
    } catch (error) {
      return ApiResponse.error(-1, `Error initializing chunk upload: ${error.message}`);
    }
  }

  /**
   * Sube un chunk individual
   */
  async uploadChunk(userId: string, chunkData: ChunkUploadDto, file: Express.Multer.File): Promise<ApiResponse<{ message: string, receivedChunks: number[] }>> {
    try {
      // Validar chunk
      this.chunkValidationService.validateChunk(chunkData, file);
      
      // Verificar que la sesión de subida existe y pertenece al usuario
      const chunkUpload = await this.ChunkUploadModel.findOne({ 
        uploadId: chunkData.uploadId, 
        userId 
      });

      if (!chunkUpload) {
        return ApiResponse.error(-1, 'Upload session not found or not authorized');
      }

      if (chunkUpload.isCompleted) {
        return ApiResponse.error(-1, 'Upload session is already completed');
      }

      // Verificar que el chunk no ha sido subido previamente
      if (chunkUpload.receivedChunks.includes(chunkData.chunkNumber)) {
        return ApiResponse.item({ 
          message: 'Chunk already received', 
          receivedChunks: chunkUpload.receivedChunks 
        });
      }

      // Guardar el chunk en el directorio temporal
      const chunkPath = path.join(chunkUpload.tempPath, `chunk_${chunkData.chunkNumber}`);
      await fs.promises.writeFile(chunkPath, file.buffer);

      // Actualizar la lista de chunks recibidos
      chunkUpload.receivedChunks.push(chunkData.chunkNumber);
      chunkUpload.receivedChunks.sort((a, b) => a - b);
      chunkUpload.updatedAt = new Date();
      await chunkUpload.save();

      return ApiResponse.item({ 
        message: `Chunk ${chunkData.chunkNumber} uploaded successfully`,
        receivedChunks: chunkUpload.receivedChunks
      });
    } catch (error) {
      return ApiResponse.error(-1, `Error uploading chunk: ${error.message}`);
    }
  }

  /**
   * Finaliza la subida, junta todos los chunks y crea el archivo final
   */
  async finishChunkUpload(userId: string, uploadId: string, itemData: Item): Promise<ApiResponse<Item>> {
    try {
      // Verificar que la sesión de subida existe y pertenece al usuario
      const chunkUpload = await this.ChunkUploadModel.findOne({ 
        uploadId: uploadId, 
        userId 
      });

      if (!chunkUpload) {
        return ApiResponse.error(-1, 'Upload session not found or not authorized');
      }

      if (chunkUpload.isCompleted) {
        return ApiResponse.error(-1, 'Upload session is already completed');
      }

      // Verificar que todos los chunks han sido recibidos
      const expectedChunks = Array.from({ length: chunkUpload.totalChunks }, (_, i) => i);
      const missingChunks = expectedChunks.filter(chunk => !chunkUpload.receivedChunks.includes(chunk));
      
      if (missingChunks.length > 0) {
        return ApiResponse.error(-1, `Missing chunks: ${missingChunks.join(', ')}`);
      }

      // Crear el item en la base de datos
      const newItem = new Item();
      newItem.userId = userId;
      newItem.createdAt = new Date();
      newItem.encryptedMetadata = itemData.encryptedMetadata;
      newItem.encryption = itemData.encryption;
      newItem.type = 'file';
      newItem.userId = userId;
      newItem.size = chunkUpload.totalSize;
      newItem.parentId = itemData.parentId;
      newItem.sharedWith = itemData.sharedWith;
      newItem.userCreator = userId;

      await this.ItemModel.create(newItem);

      // Juntar todos los chunks en el archivo final
      const finalFilePath = await this.assembleChunks(chunkUpload, userId, newItem._id.toString());

      // Marcar la subida como completada
      chunkUpload.isCompleted = true;
      chunkUpload.completedAt = new Date();
      await chunkUpload.save();

      // await this.saveFileOnStorage(finalFilePath, newItem._id.toString());

      // Limpiar chunks temporales
      await this.cleanupChunks(chunkUpload.tempPath);

      return ApiResponse.item(newItem);
    } catch (error) {
      return ApiResponse.error(-1, `Error finishing upload: ${error.message}`);
    }
  }

  /**
   * Junta todos los chunks en un archivo final
   */
  private async assembleChunks(chunkUpload: ChunkUpload, userId: string, itemId: string): Promise<string> {
    const dirPath = path.join('data', userId);
    const finalFilePath = path.join(dirPath, itemId);

    // Crear directorio de destino si no existe
    await fs.promises.mkdir(dirPath, { recursive: true });

    // Crear stream de escritura para el archivo final
    const writeStream = fs.createWriteStream(finalFilePath);

    try {
      // Leer y escribir cada chunk en orden
      for (let i = 0; i < chunkUpload.totalChunks; i++) {
        const chunkPath = path.join(chunkUpload.tempPath, `chunk_${i}`);
        const chunkData = await fs.promises.readFile(chunkPath);
        writeStream.write(chunkData);
      }

      writeStream.end();
      
      // Esperar a que termine la escritura
      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', () => resolve());
        writeStream.on('error', reject);
      });

      return finalFilePath;
    } catch (error) {
      writeStream.destroy();
      throw error;
    }
  }

  /**
   * Limpia los archivos de chunks temporales
   */
  private async cleanupChunks(tempPath: string): Promise<void> {
    try {
      await fs.promises.rm(tempPath, { recursive: true, force: true });
    } catch (error) {
      console.error(`Error cleaning up chunks at ${tempPath}:`, error);
      // No lanzar error para no interrumpir el proceso principal
    }
  }

  /**
   * Obtiene el estado de una subida en chunks
   */
  async getChunkUploadStatus(userId: string, uploadId: string): Promise<ApiResponse<any>> {
    try {
      const chunkUpload = await this.ChunkUploadModel.findOne({ uploadId, userId });
      
      if (!chunkUpload) {
        return ApiResponse.error(-1, 'Upload session not found');
      }

      const expectedChunks = Array.from({ length: chunkUpload.totalChunks }, (_, i) => i);
      const missingChunks = expectedChunks.filter(chunk => !chunkUpload.receivedChunks.includes(chunk));

      return ApiResponse.item({
        uploadId: chunkUpload.uploadId,
        totalChunks: chunkUpload.totalChunks,
        receivedChunks: chunkUpload.receivedChunks,
        missingChunks,
        isCompleted: chunkUpload.isCompleted,
        progress: (chunkUpload.receivedChunks.length / chunkUpload.totalChunks) * 100
      });
    } catch (error) {
      return ApiResponse.error(-1, `Error getting upload status: ${error.message}`);
    }
  }

  /**
   * Cancela una subida en chunks y limpia los archivos temporales
   */
  async cancelChunkUpload(userId: string, uploadId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const chunkUpload = await this.ChunkUploadModel.findOne({ uploadId, userId });
      
      if (!chunkUpload) {
        return ApiResponse.error(-1, 'Upload session not found');
      }

      if (chunkUpload.isCompleted) {
        return ApiResponse.error(-1, 'Cannot cancel completed upload');
      }

      // Limpiar chunks temporales
      await this.cleanupChunks(chunkUpload.tempPath);

      // Eliminar registro de la base de datos
      await this.ChunkUploadModel.deleteOne({ uploadId, userId });

      return ApiResponse.item({ message: 'Upload cancelled successfully' });
    } catch (error) {
      return ApiResponse.error(-1, `Error cancelling upload: ${error.message}`);
    }
  }


  async saveFileOnStorage(userid: string, itemId: string, file: Express.Multer.File): Promise<string> {
    const dirPath = path.join('data', userid);
    const filePath = path.join(dirPath, itemId); // El nombre del archivo es itemId

    await fs.promises.mkdir(dirPath, { recursive: true });
    await fs.promises.writeFile(filePath, file.buffer);
    return filePath;
  }


  // async findItemByUser(userId : string, itemId : string) : Promise<ApiResponse<Item>>{
  //   const item = await this.findOne({ _id: itemId, userId: userId });
  //   if (!item.isSuccess()){
  //     return ApiResponse.error(-1, `Item with ID "${itemId}" not found for user "${userId}"`);
  //   }
  //   return ApiResponse.item(item.value!);
  // } 



}
