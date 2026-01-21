import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3: AWS.S3;
  private useS3: boolean;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.useS3 = this.configService.get<string>('USE_S3') === 'true';
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET');

    if (this.useS3) {
      const endpoint = this.configService.get<string>('AWS_S3_ENDPOINT');
      
      this.s3 = new AWS.S3({
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
        region: this.configService.get<string>('AWS_REGION'),
        endpoint: endpoint || undefined,
        s3ForcePathStyle: !!endpoint, // Necesario para MinIO
        signatureVersion: 'v4',
      });

      this.logger.log(`✅ Storage Service inicializado con S3`);
      this.logger.log(`   Bucket: ${this.bucket}`);
      this.logger.log(`   Region: ${this.configService.get<string>('AWS_REGION')}`);
      this.logger.log(`   Endpoint: ${endpoint || 'AWS S3 Default'}`);
    } else {
      this.logger.log(`✅ Storage Service inicializado con almacenamiento local`);
    }
  }

  /**
   * Sube un archivo al almacenamiento (S3 o local)
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    filename?: string,
  ): Promise<string> {
    const finalFilename = filename || file.filename || this.generateFilename(file.originalname);
    const key = `${folder}/${finalFilename}`;

    if (this.useS3) {
      return await this.uploadToS3(file, key);
    } else {
      return await this.uploadToLocal(file, folder, finalFilename);
    }
  }

  /**
   * Sube un buffer al almacenamiento (S3 o local)
   */
  async uploadBuffer(
    buffer: Buffer,
    folder: string,
    filename: string,
    contentType: string,
  ): Promise<string> {
    const key = `${folder}/${filename}`;

    if (this.useS3) {
      return await this.uploadBufferToS3(buffer, key, contentType);
    } else {
      return await this.uploadBufferToLocal(buffer, folder, filename);
    }
  }

  /**
   * Elimina un archivo del almacenamiento
   */
  async deleteFile(fileUrl: string): Promise<void> {
    if (this.useS3) {
      await this.deleteFromS3(fileUrl);
    } else {
      await this.deleteFromLocal(fileUrl);
    }
  }

  /**
   * Obtiene la URL pública de un archivo
   */
  getPublicUrl(key: string): string {
    if (this.useS3) {
      const cloudfront = this.configService.get<string>('AWS_CLOUDFRONT_URL');
      if (cloudfront) {
        return `${cloudfront}/${key}`;
      }
      
      const endpoint = this.configService.get<string>('AWS_S3_ENDPOINT');
      if (endpoint) {
        // MinIO o S3 compatible
        return `${endpoint}/${this.bucket}/${key}`;
      }
      
      // AWS S3 estándar
      const region = this.configService.get<string>('AWS_REGION');
      return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
    } else {
      // URL local
      return `/${key}`;
    }
  }

  /**
   * Descarga un archivo como buffer (para procesamiento)
   */
  async downloadFile(fileUrl: string): Promise<Buffer> {
    if (this.useS3) {
      // Si la URL es local (/uploads/...), intentar leer desde local
      if (fileUrl.startsWith('/uploads/')) {
        try {
          return await this.downloadFromLocal(fileUrl);
        } catch (error) {
          this.logger.warn(`⚠️ Archivo no encontrado localmente, intentando S3: ${fileUrl}`);
          // Si falla local, intentar S3
          return await this.downloadFromS3(fileUrl);
        }
      }
      // Si es URL de S3, descargar desde S3
      return await this.downloadFromS3(fileUrl);
    } else {
      return await this.downloadFromLocal(fileUrl);
    }
  }

  /**
   * Verifica la conexión con S3
   */
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    if (!this.useS3) {
      return {
        success: true,
        message: 'Usando almacenamiento local (S3 desactivado)',
      };
    }

    try {
      // Intentar listar objetos del bucket
      const result = await this.s3.listObjectsV2({
        Bucket: this.bucket,
        MaxKeys: 1,
      }).promise();

      this.logger.log(`✅ Conexión exitosa con S3 bucket: ${this.bucket}`);
      
      return {
        success: true,
        message: `Conexión exitosa con S3 bucket: ${this.bucket}`,
        details: {
          bucket: this.bucket,
          region: this.configService.get<string>('AWS_REGION'),
          endpoint: this.configService.get<string>('AWS_S3_ENDPOINT') || 'AWS S3 Default',
          objectsCount: result.KeyCount,
        },
      };
    } catch (error) {
      this.logger.error(`❌ Error al conectar con S3: ${error.message}`);
      
      return {
        success: false,
        message: `Error al conectar con S3: ${error.message}`,
        details: {
          bucket: this.bucket,
          region: this.configService.get<string>('AWS_REGION'),
          endpoint: this.configService.get<string>('AWS_S3_ENDPOINT') || 'AWS S3 Default',
          error: error.message,
        },
      };
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private async uploadToS3(file: Express.Multer.File, key: string): Promise<string> {
    try {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer || fs.readFileSync(file.path),
        ContentType: file.mimetype,
        // ACL removido - el bucket no permite ACLs
      };

      await this.s3.upload(params).promise();
      
      this.logger.log(`✅ Archivo subido a S3: ${key}`);
      
      return this.getPublicUrl(key);
    } catch (error) {
      this.logger.error(`❌ Error al subir archivo a S3: ${error.message}`);
      throw new Error(`Error al subir archivo a S3: ${error.message}`);
    }
  }

  private async uploadBufferToS3(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<string> {
    try {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        // ACL removido - el bucket no permite ACLs
      };

      await this.s3.upload(params).promise();
      
      this.logger.log(`✅ Buffer subido a S3: ${key}`);
      
      return this.getPublicUrl(key);
    } catch (error) {
      this.logger.error(`❌ Error al subir buffer a S3: ${error.message}`);
      throw new Error(`Error al subir buffer a S3: ${error.message}`);
    }
  }

  private async deleteFromS3(fileUrl: string): Promise<void> {
    try {
      // Extraer la key de la URL
      const key = this.extractKeyFromUrl(fileUrl);
      
      await this.s3.deleteObject({
        Bucket: this.bucket,
        Key: key,
      }).promise();
      
      this.logger.log(`✅ Archivo eliminado de S3: ${key}`);
    } catch (error) {
      this.logger.error(`❌ Error al eliminar archivo de S3: ${error.message}`);
      throw new Error(`Error al eliminar archivo de S3: ${error.message}`);
    }
  }

  private async uploadToLocal(
    file: Express.Multer.File,
    folder: string,
    filename: string,
  ): Promise<string> {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads', folder);
      
      // Crear directorio si no existe
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      
      // Si el archivo ya está en el sistema (multer diskStorage)
      if (file.path) {
        // Mover el archivo si es necesario
        if (file.path !== filePath) {
          fs.renameSync(file.path, filePath);
        }
      } else if (file.buffer) {
        // Guardar desde buffer
        fs.writeFileSync(filePath, file.buffer);
      }

      this.logger.log(`✅ Archivo guardado localmente: uploads/${folder}/${filename}`);
      
      return `/uploads/${folder}/${filename}`;
    } catch (error) {
      this.logger.error(`❌ Error al guardar archivo localmente: ${error.message}`);
      throw new Error(`Error al guardar archivo localmente: ${error.message}`);
    }
  }

  private async uploadBufferToLocal(
    buffer: Buffer,
    folder: string,
    filename: string,
  ): Promise<string> {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads', folder);
      
      // Crear directorio si no existe
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);

      this.logger.log(`✅ Buffer guardado localmente: uploads/${folder}/${filename}`);
      
      return `/uploads/${folder}/${filename}`;
    } catch (error) {
      this.logger.error(`❌ Error al guardar buffer localmente: ${error.message}`);
      throw new Error(`Error al guardar buffer localmente: ${error.message}`);
    }
  }

  private async deleteFromLocal(fileUrl: string): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), fileUrl.replace(/^\//, ''));
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`✅ Archivo eliminado localmente: ${fileUrl}`);
      }
    } catch (error) {
      this.logger.error(`❌ Error al eliminar archivo localmente: ${error.message}`);
      throw new Error(`Error al eliminar archivo localmente: ${error.message}`);
    }
  }

  private async downloadFromS3(fileUrl: string): Promise<Buffer> {
    try {
      const key = this.extractKeyFromUrl(fileUrl);
      
      const result = await this.s3.getObject({
        Bucket: this.bucket,
        Key: key,
      }).promise();
      
      this.logger.log(`✅ Archivo descargado de S3: ${key}`);
      
      return result.Body as Buffer;
    } catch (error) {
      this.logger.error(`❌ Error al descargar archivo de S3: ${error.message}`);
      
      // Si el archivo no existe en S3, intentar desde local
      if (error.code === 'NoSuchKey' && fileUrl.startsWith('/uploads/')) {
        this.logger.warn(`⚠️ Archivo no existe en S3, intentando desde local: ${fileUrl}`);
        return await this.downloadFromLocal(fileUrl);
      }
      
      throw new Error(`Error al descargar archivo de S3: ${error.message}`);
    }
  }

  private async downloadFromLocal(fileUrl: string): Promise<Buffer> {
    try {
      const filePath = path.join(process.cwd(), fileUrl.replace(/^\//, ''));
      const buffer = fs.readFileSync(filePath);
      
      this.logger.log(`✅ Archivo leído localmente: ${fileUrl}`);
      
      return buffer;
    } catch (error) {
      this.logger.error(`❌ Error al leer archivo localmente: ${error.message}`);
      throw new Error(`Error al leer archivo localmente: ${error.message}`);
    }
  }

  private generateFilename(originalname: string): string {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(originalname);
    const name = path.basename(originalname, ext);
    return `${name}-${uniqueSuffix}${ext}`;
  }

  private extractKeyFromUrl(url: string): string {
    // Extraer la key de diferentes formatos de URL
    if (url.includes(this.bucket)) {
      // URL de S3: https://bucket.s3.region.amazonaws.com/folder/file.jpg
      // Buscar la primera barra después del dominio
      const match = url.match(/\.amazonaws\.com\/(.+)$/);
      if (match) {
        return match[1];
      }
      // Fallback: intentar split por el bucket
      const parts = url.split(`${this.bucket}/`);
      return parts[1] || url;
    } else if (url.startsWith('/')) {
      // URL local: /uploads/folder/file.jpg
      return url.replace(/^\/uploads\//, '');
    } else {
      // Asumir que es la key directamente
      return url;
    }
  }
}
