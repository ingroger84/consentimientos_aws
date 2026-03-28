import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../roles/entities/role.entity';
import { PaymentMonitorService } from './payment-monitor.service';

@ApiTags('Payment Monitoring')
@Controller('payments/monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentMonitorController {
  constructor(private readonly paymentMonitorService: PaymentMonitorService) {}

  /**
   * Obtener lista de pagos pendientes (solo Super Admin)
   */
  @Get('pending')
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Obtener lista de pagos pendientes de verificación' })
  @ApiResponse({ status: 200, description: 'Lista de pagos pendientes' })
  async getPendingPayments() {
    const pendingLinks = await this.paymentMonitorService.getPendingPaymentLinks();
    
    return {
      success: true,
      count: pendingLinks.length,
      pendingPayments: pendingLinks,
      message: pendingLinks.length === 0 
        ? 'No hay pagos pendientes' 
        : `${pendingLinks.length} pago(s) pendiente(s) de verificación`,
    };
  }

  /**
   * Verificar manualmente el estado de un pago específico (solo Super Admin)
   */
  @Post('check/:invoiceId')
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Verificar manualmente el estado de un pago en Bold' })
  @ApiResponse({ status: 200, description: 'Estado del pago verificado' })
  async checkPaymentStatus(@Param('invoiceId') invoiceId: string) {
    return await this.paymentMonitorService.checkPaymentStatus(invoiceId);
  }

  /**
   * Forzar verificación inmediata de todos los pagos pendientes (solo Super Admin)
   */
  @Post('check-all')
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Forzar verificación inmediata de todos los pagos pendientes' })
  @ApiResponse({ status: 200, description: 'Verificación completada' })
  async checkAllPendingPayments() {
    await this.paymentMonitorService.checkPendingPayments();
    
    return {
      success: true,
      message: 'Verificación de pagos pendientes iniciada',
    };
  }
}
