import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { ConsentsService } from './consents.service';
import { CreateConsentDto } from './dto/create-consent.dto';
import { SignConsentDto } from './dto/sign-consent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/permissions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { StorageService } from '../common/services/storage.service';
import * as path from 'path';
import * as fs from 'fs';

@Controller('consents')
@UseGuards(JwtAuthGuard)
export class ConsentsController {
  constructor(
    private readonly consentsService: ConsentsService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.CREATE_CONSENTS)
  create(@Body() createConsentDto: CreateConsentDto, @CurrentUser() user: User) {
    return this.consentsService.create(createConsentDto, user);
  }

  @Get('stats/overview')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_DASHBOARD)
  getStats(@CurrentUser() user?: User) {
    return this.consentsService.getStatistics(user);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_CONSENTS)
  findAll(@Query('search') search?: string, @CurrentUser() user?: User) {
    return this.consentsService.findAll(search, user);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_CONSENTS)
  findOne(@Param('id') id: string) {
    return this.consentsService.findOne(id);
  }

  @Get(':id/pdf')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_CONSENTS)
  async getPdf(@Param('id') id: string, @Res() res: Response) {
    return this.servePdf(id, 'procedure', res);
  }

  @Get(':id/pdf-data-treatment')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_CONSENTS)
  async getDataTreatmentPdf(@Param('id') id: string, @Res() res: Response) {
    return this.servePdf(id, 'data-treatment', res);
  }

  @Get(':id/pdf-image-rights')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.VIEW_CONSENTS)
  async getImageRightsPdf(@Param('id') id: string, @Res() res: Response) {
    return this.servePdf(id, 'image-rights', res);
  }

  private async servePdf(id: string, type: 'procedure' | 'data-treatment' | 'image-rights', res: Response) {
    try {
      const consent = await this.consentsService.findOne(id);
      
      let pdfUrl: string;
      let filename: string;

      switch (type) {
        case 'procedure':
          pdfUrl = consent.pdfUrl;
          filename = `consentimiento-procedimiento-${consent.clientId}.pdf`;
          break;
        case 'data-treatment':
          pdfUrl = consent.pdfDataTreatmentUrl;
          filename = `consentimiento-datos-${consent.clientId}.pdf`;
          break;
        case 'image-rights':
          pdfUrl = consent.pdfImageRightsUrl;
          filename = `consentimiento-imagenes-${consent.clientId}.pdf`;
          break;
      }

      if (!pdfUrl) {
        return res.status(404).json({ message: 'PDF no encontrado' });
      }

      // Si la URL es de S3 (empieza con http), descargar el archivo
      if (pdfUrl.startsWith('http')) {
        console.log(`Descargando PDF desde S3 para visualización: ${pdfUrl}`);
        const pdfBuffer = await this.storageService.downloadFile(pdfUrl);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length.toString());
        
        return res.send(pdfBuffer);
      } else {
        // Si es una ruta local, usar el método tradicional
        const filePath = path.join(process.cwd(), pdfUrl);
        
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ message: 'Archivo PDF no encontrado' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
      }
    } catch (error) {
      console.error('Error al servir PDF:', error);
      return res.status(500).json({ message: 'Error al cargar el PDF' });
    }
  }

  @Patch(':id/sign')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.SIGN_CONSENTS)
  sign(@Param('id') id: string, @Body() signConsentDto: SignConsentDto) {
    return this.consentsService.sign(id, signConsentDto);
  }

  @Post(':id/resend-email')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.RESEND_CONSENT_EMAIL)
  resendEmail(@Param('id') id: string) {
    return this.consentsService.sendConsentEmail(id);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.DELETE_CONSENTS)
  remove(@Param('id') id: string) {
    return this.consentsService.remove(id);
  }
}
