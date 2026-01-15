import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { PaymentReminderService } from './payment-reminder.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../roles/entities/role.entity';

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.SUPER_ADMIN)
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly paymentReminderService: PaymentReminderService,
  ) {}

  @Get('dashboard')
  async getDashboard() {
    return await this.billingService.getDashboardStats();
  }

  @Get('history')
  async getHistory(
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 50;
    return await this.billingService.getHistory(tenantId, limitNum);
  }

  @Post('generate-invoices')
  async generateInvoices() {
    return await this.billingService.generateMonthlyInvoices();
  }

  @Post('send-reminders')
  async sendReminders() {
    return await this.paymentReminderService.sendScheduledReminders();
  }

  @Post('suspend-overdue')
  async suspendOverdue() {
    return await this.billingService.suspendOverdueTenants();
  }

  @Get('pending-reminders')
  async getPendingReminders(@Query('tenantId') tenantId?: string) {
    return await this.paymentReminderService.getPendingReminders(tenantId);
  }
}
