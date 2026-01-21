import { Controller, Get, UseGuards } from '@nestjs/common';
import { StorageService } from '../services/storage.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleType } from '../../roles/entities/role.entity';

@Controller('storage')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('test-connection')
  @Roles(RoleType.SUPER_ADMIN)
  async testConnection() {
    return await this.storageService.testConnection();
  }

  @Get('status')
  @Roles(RoleType.SUPER_ADMIN)
  getStatus() {
    return {
      useS3: process.env.USE_S3 === 'true',
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_REGION,
      endpoint: process.env.AWS_S3_ENDPOINT || 'AWS S3 Default',
    };
  }
}
