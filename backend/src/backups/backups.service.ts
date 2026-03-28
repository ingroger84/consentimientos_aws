import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3 } from 'aws-sdk';
import { exec } from 'child_process';
import { promisify } from 'util';
import { AppSettings } from '../settings/entities/app-settings.entity';

const execAsync = promisify(exec);

@Injectable()
export class BackupsService {
  private readonly logger = new Logger(BackupsService.name);
  private readonly s3: S3;
  private readonly bucketName = process.env.AWS_S3_BUCKET || 'datagree-uploads';
  private readonly backupPath = 'Back_Up_ArchivoEnLinea/';

  constructor(
    @InjectRepository(AppSettings)
    private readonly settingsRepository: Repository<AppSettings>,
  ) {
    this.s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  /**
   * Listar todos los backups disponibles en S3
   */
  async listBackups() {
    try {
      this.logger.log('Listando backups desde S3...');

      const params = {
        Bucket: this.bucketName,
        Prefix: this.backupPath,
      };

      const data = await this.s3.listObjectsV2(params).promise();

      if (!data.Contents || data.Contents.length === 0) {
        return [];
      }

      // Filtrar solo archivos de backup y ordenar por fecha (más reciente primero)
      const backups = data.Contents
        .filter((item) => item.Key?.includes('backup_archivoenlinea_'))
        .map((item, index) => {
          const fileName = item.Key?.split('/').pop() || '';
          const match = fileName.match(/backup_archivoenlinea_(\d{8})_(\d{6})\.tar\.gz/);
          
          let date = null;
          if (match) {
            const dateStr = match[1]; // YYYYMMDD
            const timeStr = match[2]; // HHMMSS
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            const hour = timeStr.substring(0, 2);
            const minute = timeStr.substring(2, 4);
            const second = timeStr.substring(4, 6);
            date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
          }

          return {
            id: index + 1,
            fileName: fileName,
            key: item.Key,
            size: item.Size,
            sizeFormatted: this.formatBytes(item.Size || 0),
            lastModified: item.LastModified,
            date: date,
            s3Url: `s3://${this.bucketName}/${item.Key}`,
          };
        })
        .sort((a, b) => {
          // Ordenar por fecha de modificación (más reciente primero)
          return (b.lastModified?.getTime() || 0) - (a.lastModified?.getTime() || 0);
        })
        .map((backup, index) => ({
          ...backup,
          consecutivo: data.Contents!.length - index, // Consecutivo inverso
        }));

      this.logger.log(`Se encontraron ${backups.length} backups`);
      return backups;
    } catch (error) {
      this.logger.error('Error al listar backups:', error);
      throw new Error('Error al listar backups desde S3');
    }
  }

  /**
   * Obtener información de un backup específico
   */
  async getBackupInfo(fileName: string) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: `${this.backupPath}${fileName}`,
      };

      const data = await this.s3.headObject(params).promise();

      return {
        fileName: fileName,
        size: data.ContentLength,
        sizeFormatted: this.formatBytes(data.ContentLength || 0),
        lastModified: data.LastModified,
        contentType: data.ContentType,
        s3Url: `s3://${this.bucketName}/${this.backupPath}${fileName}`,
      };
    } catch (error) {
      this.logger.error(`Error al obtener info del backup ${fileName}:`, error);
      throw new Error('Backup no encontrado');
    }
  }

  /**
   * Crear un backup manual
   */
  async createBackup() {
    try {
      this.logger.log('Iniciando creación de backup manual...');

      // Ejecutar script de backup
      const scriptPath = '/home/ubuntu/consentimientos_aws/scripts/backup-to-s3.sh';
      
      // Ejecutar en background para no bloquear la respuesta
      exec(scriptPath, (error, stdout, stderr) => {
        if (error) {
          this.logger.error('Error al ejecutar script de backup:', error);
          return;
        }
        this.logger.log('Backup manual completado');
        this.logger.log('Output:', stdout);
      });

      return {
        message: 'Backup iniciado correctamente. Recibirás un email cuando se complete.',
        status: 'in_progress',
      };
    } catch (error) {
      this.logger.error('Error al crear backup:', error);
      throw new Error('Error al iniciar el backup');
    }
  }

  /**
   * Restaurar un backup
   */
  async restoreBackup(fileName: string) {
    try {
      this.logger.log(`Iniciando restauración del backup: ${fileName}`);

      // Verificar que el backup existe
      await this.getBackupInfo(fileName);

      // Ejecutar script de restauración
      const scriptPath = '/home/ubuntu/consentimientos_aws/scripts/restore-from-s3.sh';
      const command = `${scriptPath} --file ${fileName}`;

      // Ejecutar en background
      exec(command, (error, stdout, stderr) => {
        if (error) {
          this.logger.error('Error al ejecutar script de restauración:', error);
          return;
        }
        this.logger.log('Restauración completada');
        this.logger.log('Output:', stdout);
      });

      return {
        message: 'Restauración iniciada. El sistema se reiniciará automáticamente.',
        status: 'in_progress',
        fileName: fileName,
        warning: 'El sistema estará fuera de línea durante 10-15 minutos.',
      };
    } catch (error) {
      this.logger.error('Error al restaurar backup:', error);
      throw new Error('Error al iniciar la restauración');
    }
  }

  /**
   * Eliminar un backup
   */
  async deleteBackup(fileName: string) {
    try {
      this.logger.log(`Eliminando backup: ${fileName}`);

      const params = {
        Bucket: this.bucketName,
        Key: `${this.backupPath}${fileName}`,
      };

      await this.s3.deleteObject(params).promise();

      this.logger.log(`Backup eliminado: ${fileName}`);
      return {
        message: 'Backup eliminado correctamente',
        fileName: fileName,
      };
    } catch (error) {
      this.logger.error('Error al eliminar backup:', error);
      throw new Error('Error al eliminar el backup');
    }
  }

  /**
   * Obtener estadísticas de backups
   */
  async getBackupStats() {
    try {
      const backups = await this.listBackups();

      const totalSize = backups.reduce((sum, backup) => sum + (backup.size || 0), 0);
      const avgSize = backups.length > 0 ? totalSize / backups.length : 0;

      // Obtener el último backup
      const lastBackup = backups.length > 0 ? backups[0] : null;

      // Calcular backups por día (últimos 7 días)
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentBackups = backups.filter(
        (b) => b.lastModified && b.lastModified >= sevenDaysAgo,
      );

      return {
        total: backups.length,
        totalSize: totalSize,
        totalSizeFormatted: this.formatBytes(totalSize),
        averageSize: avgSize,
        averageSizeFormatted: this.formatBytes(avgSize),
        lastBackup: lastBackup,
        recentBackups: recentBackups.length,
        oldestBackup: backups.length > 0 ? backups[backups.length - 1] : null,
      };
    } catch (error) {
      this.logger.error('Error al obtener estadísticas:', error);
      throw new Error('Error al obtener estadísticas de backups');
    }
  }

  /**
   * Descargar URL pre-firmada para descargar un backup
   */
  async getDownloadUrl(fileName: string) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: `${this.backupPath}${fileName}`,
        Expires: 3600, // URL válida por 1 hora
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);

      return {
        url: url,
        expiresIn: 3600,
        fileName: fileName,
      };
    } catch (error) {
      this.logger.error('Error al generar URL de descarga:', error);
      throw new Error('Error al generar URL de descarga');
    }
  }

  /**
   * Formatear bytes a formato legible
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Obtener horario actual de backups automáticos
   */
  async getCurrentSchedule() {
    try {
      const schedule1Setting = await this.settingsRepository.findOne({
        where: { key: 'backupSchedule1', tenantId: null },
      });

      const schedule2Setting = await this.settingsRepository.findOne({
        where: { key: 'backupSchedule2', tenantId: null },
      });

      return {
        schedule1: schedule1Setting?.value || '12:00',
        schedule2: schedule2Setting?.value || '19:00',
      };
    } catch (error) {
      this.logger.error('Error al obtener horario de backups:', error);
      throw new Error('Error al obtener horario de backups');
    }
  }

  /**
   * Actualizar horario de backups automáticos
   */
  async updateSchedule(schedule1: string, schedule2: string) {
    try {
      // Validar formato HH:MM
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(schedule1) || !timeRegex.test(schedule2)) {
        throw new Error('Formato de hora inválido. Use HH:MM (ej: 12:00)');
      }

      this.logger.log(`Actualizando horario de backups: ${schedule1}, ${schedule2}`);

      // Guardar en base de datos
      await this.settingsRepository.save({
        key: 'backupSchedule1',
        value: schedule1,
        tenantId: null,
      });

      await this.settingsRepository.save({
        key: 'backupSchedule2',
        value: schedule2,
        tenantId: null,
      });

      // Actualizar crontab
      const [hour1, minute1] = schedule1.split(':');
      const [hour2, minute2] = schedule2.split(':');

      const updateCronScript = `/home/ubuntu/consentimientos_aws/scripts/update-backup-schedule.sh`;
      const command = `${updateCronScript} "${minute1}" "${hour1}" "${minute2}" "${hour2}"`;

      // Ejecutar script para actualizar crontab
      exec(command, (error, stdout, stderr) => {
        if (error) {
          this.logger.error('Error al actualizar crontab:', error);
          return;
        }
        this.logger.log('Crontab actualizado exitosamente');
        this.logger.log('Output:', stdout);
      });

      this.logger.log('Horario de backups actualizado correctamente');

      return {
        message: 'Horario de backups actualizado correctamente',
        schedule1: schedule1,
        schedule2: schedule2,
        crontabUpdated: true,
      };
    } catch (error) {
      this.logger.error('Error al actualizar horario:', error);
      throw error;
    }
  }
}
