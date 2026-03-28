import api from './api';

export interface Backup {
  id: number;
  consecutivo: number;
  fileName: string;
  key: string;
  size: number;
  sizeFormatted: string;
  lastModified: Date;
  date: Date | null;
  s3Url: string;
}

export interface BackupStats {
  total: number;
  totalSize: number;
  totalSizeFormatted: string;
  averageSize: number;
  averageSizeFormatted: string;
  lastBackup: Backup | null;
  recentBackups: number;
  oldestBackup: Backup | null;
}

export interface BackupInfo {
  fileName: string;
  size: number;
  sizeFormatted: string;
  lastModified: Date;
  contentType: string;
  s3Url: string;
}

export interface CreateBackupResponse {
  message: string;
  status: string;
}

export interface RestoreBackupResponse {
  message: string;
  status: string;
  fileName: string;
  warning: string;
}

export interface DownloadUrlResponse {
  url: string;
  expiresIn: number;
  fileName: string;
}

class BackupsService {
  /**
   * Listar todos los backups disponibles
   */
  async listBackups(): Promise<Backup[]> {
    const response = await api.get('/backups');
    return response.data;
  }

  /**
   * Obtener estadísticas de backups
   */
  async getStats(): Promise<BackupStats> {
    const response = await api.get('/backups/stats');
    return response.data;
  }

  /**
   * Obtener información de un backup específico
   */
  async getBackupInfo(fileName: string): Promise<BackupInfo> {
    const response = await api.get(`/backups/${fileName}`);
    return response.data;
  }

  /**
   * Crear un backup manual
   */
  async createBackup(): Promise<CreateBackupResponse> {
    const response = await api.post('/backups/create');
    return response.data;
  }

  /**
   * Restaurar un backup
   */
  async restoreBackup(fileName: string): Promise<RestoreBackupResponse> {
    const response = await api.post(`/backups/${fileName}/restore`);
    return response.data;
  }

  /**
   * Eliminar un backup
   */
  async deleteBackup(fileName: string): Promise<{ message: string; fileName: string }> {
    const response = await api.delete(`/backups/${fileName}`);
    return response.data;
  }

  /**
   * Obtener URL de descarga
   */
  async getDownloadUrl(fileName: string): Promise<DownloadUrlResponse> {
    const response = await api.get(`/backups/${fileName}/download-url`);
    return response.data;
  }

  /**
   * Obtener horario actual de backups automáticos
   */
  async getCurrentSchedule(): Promise<{ schedule1: string; schedule2: string }> {
    const response = await api.get('/backups/schedule/current');
    return response.data;
  }

  /**
   * Actualizar horario de backups automáticos
   */
  async updateSchedule(schedule1: string, schedule2: string): Promise<any> {
    const response = await api.post('/backups/schedule/update', { schedule1, schedule2 });
    return response.data;
  }
}

export default new BackupsService();
