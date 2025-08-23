import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChunkUpload } from '../entities/chunk-upload.entity';
import * as fs from 'fs';

@Injectable()
export class ChunkUploadCleanupService {
  private readonly logger = new Logger(ChunkUploadCleanupService.name);

  constructor(
    @InjectModel(ChunkUpload.name) private readonly ChunkUploadModel: Model<ChunkUpload>
  ) {}

  /**
   * Limpia sesiones de subida abandonadas cada hora
   * Se consideran abandonadas las sesiones que:
   * - No están completadas
   * - Han pasado más de 24 horas desde la última actualización
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupAbandonedUploads() {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Buscar sesiones abandonadas
      const abandonedUploads = await this.ChunkUploadModel.find({
        isCompleted: false,
        updatedAt: { $lt: twentyFourHoursAgo }
      });

      if (abandonedUploads.length === 0) {
        return;
      }

      this.logger.log(`Found ${abandonedUploads.length} abandoned upload sessions to clean up`);

      for (const upload of abandonedUploads) {
        try {
          // Eliminar archivos temporales
          await fs.promises.rm(upload.tempPath, { recursive: true, force: true });
          
          // Eliminar registro de la base de datos
          await this.ChunkUploadModel.deleteOne({ _id: upload._id });
          
          this.logger.log(`Cleaned up abandoned upload session: ${upload.uploadId}`);
        } catch (error) {
          this.logger.error(`Error cleaning up upload session ${upload.uploadId}:`, error);
        }
      }

      this.logger.log(`Cleanup completed. Removed ${abandonedUploads.length} abandoned sessions`);
    } catch (error) {
      this.logger.error('Error during cleanup process:', error);
    }
  }

  /**
   * Limpia sesiones completadas después de 7 días
   * Mantiene los registros por si se necesita auditoría
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupCompletedUploads() {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days 24 hours 60 minutes 60 seconds * 1000 is milliseconds

      const result = await this.ChunkUploadModel.deleteMany({
        isCompleted: true,
        completedAt: { $lt: sevenDaysAgo }
      });

      if (result.deletedCount > 0) {
        this.logger.log(`Cleaned up ${result.deletedCount} old completed upload records`);
      }
    } catch (error) {
      this.logger.error('Error cleaning up completed uploads:', error);
    }
  }
}
