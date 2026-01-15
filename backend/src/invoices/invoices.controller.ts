import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { InvoicePdfService } from './invoice-pdf.service';
import { TaxConfigService } from './tax-config.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateTaxConfigDto } from './dto/create-tax-config.dto';
import { UpdateTaxConfigDto } from './dto/update-tax-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { RoleType } from '../roles/entities/role.entity';
import { InvoiceStatus } from './entities/invoice.entity';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly invoicePdfService: InvoicePdfService,
    private readonly taxConfigService: TaxConfigService,
  ) {}

  @Post()
  @Roles(RoleType.SUPER_ADMIN)
  async create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return await this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: InvoiceStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Si no es Super Admin, solo puede ver facturas de su tenant
    const userTenantId = req.user.tenant?.id;
    const isSuperAdmin = req.user.role?.type === RoleType.SUPER_ADMIN;

    const filters: any = {};

    if (!isSuperAdmin) {
      filters.tenantId = userTenantId;
    } else if (tenantId) {
      filters.tenantId = tenantId;
    }

    if (status) {
      filters.status = status;
    }

    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    return await this.invoicesService.findAll(filters);
  }

  @Get('my-invoices')
  async getMyInvoices(@Request() req) {
    const userTenantId = req.user.tenant?.id;
    
    if (!userTenantId) {
      throw new Error('Solo usuarios de tenant pueden ver facturas');
    }

    return await this.invoicesService.findByTenant(userTenantId);
  }

  @Get('overdue')
  @Roles(RoleType.SUPER_ADMIN)
  async findOverdue() {
    return await this.invoicesService.findOverdue();
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const invoice = await this.invoicesService.findOne(id);

    // Verificar permisos
    const isSuperAdmin = req.user.role?.type === RoleType.SUPER_ADMIN;
    const userTenantId = req.user.tenant?.id;

    if (!isSuperAdmin && invoice.tenantId !== userTenantId) {
      throw new Error('No tienes permisos para ver esta factura');
    }

    return invoice;
  }

  @Patch(':id/mark-as-paid')
  @Roles(RoleType.SUPER_ADMIN)
  async markAsPaid(@Param('id') id: string) {
    return await this.invoicesService.markAsPaid(id);
  }

  @Patch(':id/cancel')
  @Roles(RoleType.SUPER_ADMIN)
  async cancel(@Param('id') id: string, @Body('reason') reason?: string) {
    return await this.invoicesService.cancel(id, reason);
  }

  @Get('stats')
  @Roles(RoleType.SUPER_ADMIN)
  async getStats() {
    return await this.invoicesService.getInvoiceStats();
  }

  @Get('by-status/:status')
  @Roles(RoleType.SUPER_ADMIN)
  async getByStatus(@Param('status') status: InvoiceStatus) {
    return await this.invoicesService.getInvoicesByStatus(status);
  }

  @Post(':id/resend-email')
  async resendEmail(@Request() req, @Param('id') id: string) {
    const invoice = await this.invoicesService.findOne(id);

    // Verificar permisos
    const isSuperAdmin = req.user.role?.type === RoleType.SUPER_ADMIN;
    const userTenantId = req.user.tenant?.id;

    if (!isSuperAdmin && invoice.tenantId !== userTenantId) {
      throw new Error('No tienes permisos para reenviar esta factura');
    }

    await this.invoicesService.resendEmail(id);
    return { message: 'Email enviado exitosamente' };
  }

  @Get('tenant/:tenantId')
  @Roles(RoleType.SUPER_ADMIN)
  async findByTenant(@Param('tenantId') tenantId: string) {
    return await this.invoicesService.findByTenant(tenantId);
  }

  /**
   * Descargar factura en PDF
   */
  @Get(':id/pdf')
  async downloadPdf(@Request() req, @Param('id') id: string, @Res() res: Response) {
    const invoice = await this.invoicesService.findOne(id);

    // Verificar permisos
    const isSuperAdmin = req.user.role?.type === RoleType.SUPER_ADMIN;
    const userTenantId = req.user.tenant?.id;

    if (!isSuperAdmin && invoice.tenantId !== userTenantId) {
      throw new Error('No tienes permisos para descargar esta factura');
    }

    // Generar PDF
    const pdfBuffer = await this.invoicePdfService.generateInvoicePdf(invoice, invoice.tenant);

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="factura-${invoice.invoiceNumber}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  }

  /**
   * Descargar factura en PDF (público con token)
   */
  @Public()
  @Get(':id/pdf/:token')
  async downloadPdfPublic(
    @Param('id') id: string,
    @Param('token') token: string,
    @Res() res: Response,
  ) {
    const invoice = await this.invoicesService.findOne(id);

    // Verificar token simple (invoice.id + tenant.id)
    const expectedToken = Buffer.from(`${invoice.id}-${invoice.tenantId}`).toString('base64');
    
    if (token !== expectedToken) {
      throw new Error('Token inválido');
    }

    // Generar PDF
    const pdfBuffer = await this.invoicePdfService.generateInvoicePdf(invoice, invoice.tenant);

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="factura-${invoice.invoiceNumber}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  }

  /**
   * Vista previa de factura en PDF (inline)
   */
  @Get(':id/preview')
  async previewPdf(@Request() req, @Param('id') id: string, @Res() res: Response) {
    const invoice = await this.invoicesService.findOne(id);

    // Verificar permisos
    const isSuperAdmin = req.user.role?.type === RoleType.SUPER_ADMIN;
    const userTenantId = req.user.tenant?.id;

    if (!isSuperAdmin && invoice.tenantId !== userTenantId) {
      throw new Error('No tienes permisos para ver esta factura');
    }

    // Log para debug
    console.log('Invoice items:', JSON.stringify(invoice.items, null, 2));
    console.log('Invoice data:', {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      itemsCount: invoice.items?.length || 0,
    });

    // Generar PDF
    const pdfBuffer = await this.invoicePdfService.generateInvoicePdf(invoice, invoice.tenant);

    // Configurar headers para vista previa
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  }

  // ==================== TAX CONFIG ENDPOINTS ====================

  /**
   * Crear configuración de impuesto
   */
  @Post('tax-configs')
  @Roles(RoleType.SUPER_ADMIN)
  async createTaxConfig(@Body() createTaxConfigDto: CreateTaxConfigDto) {
    return await this.taxConfigService.create(createTaxConfigDto);
  }

  /**
   * Obtener todas las configuraciones de impuestos
   */
  @Get('tax-configs')
  @Roles(RoleType.SUPER_ADMIN)
  async getAllTaxConfigs() {
    return await this.taxConfigService.findAll();
  }

  /**
   * Obtener configuraciones de impuestos activas
   */
  @Get('tax-configs/active')
  async getActiveTaxConfigs() {
    return await this.taxConfigService.findActive();
  }

  /**
   * Obtener configuración de impuesto por defecto
   */
  @Get('tax-configs/default')
  async getDefaultTaxConfig() {
    return await this.taxConfigService.findDefault();
  }

  /**
   * Obtener una configuración de impuesto
   */
  @Get('tax-configs/:id')
  @Roles(RoleType.SUPER_ADMIN)
  async getTaxConfig(@Param('id') id: string) {
    return await this.taxConfigService.findOne(id);
  }

  /**
   * Actualizar configuración de impuesto
   */
  @Patch('tax-configs/:id')
  @Roles(RoleType.SUPER_ADMIN)
  async updateTaxConfig(
    @Param('id') id: string,
    @Body() updateTaxConfigDto: UpdateTaxConfigDto,
  ) {
    return await this.taxConfigService.update(id, updateTaxConfigDto);
  }

  /**
   * Eliminar configuración de impuesto
   */
  @Delete('tax-configs/:id')
  @Roles(RoleType.SUPER_ADMIN)
  async deleteTaxConfig(@Param('id') id: string) {
    await this.taxConfigService.remove(id);
    return { message: 'Configuración de impuesto eliminada correctamente' };
  }

  /**
   * Establecer impuesto por defecto
   */
  @Patch('tax-configs/:id/set-default')
  @Roles(RoleType.SUPER_ADMIN)
  async setDefaultTaxConfig(@Param('id') id: string) {
    return await this.taxConfigService.setDefault(id);
  }

  /**
   * Calcular impuesto
   */
  @Post('tax-configs/:id/calculate')
  async calculateTax(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    const taxConfig = await this.taxConfigService.findOne(id);
    return this.taxConfigService.calculateTax(amount, taxConfig);
  }
}
