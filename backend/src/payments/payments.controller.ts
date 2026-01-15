import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleType } from '../roles/entities/role.entity';
import { PaymentStatus } from './entities/payment.entity';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(RoleType.SUPER_ADMIN)
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.paymentsService.create(createPaymentDto);
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: PaymentStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Si no es Super Admin, solo puede ver pagos de su tenant
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

    return await this.paymentsService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const payment = await this.paymentsService.findOne(id);

    // Verificar permisos
    const isSuperAdmin = req.user.role?.type === RoleType.SUPER_ADMIN;
    const userTenantId = req.user.tenant?.id;

    if (!isSuperAdmin && payment.tenantId !== userTenantId) {
      throw new Error('No tienes permisos para ver este pago');
    }

    return payment;
  }

  @Get('tenant/:tenantId')
  @Roles(RoleType.SUPER_ADMIN)
  async findByTenant(@Param('tenantId') tenantId: string) {
    return await this.paymentsService.findByTenant(tenantId);
  }
}
