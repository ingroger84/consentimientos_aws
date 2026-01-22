import { Controller, Get, Patch, Delete, Param, UseGuards, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/permissions';

@Controller('notifications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.VIEW_GLOBAL_STATS)
  async getAll(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.notificationsService.getAllForSuperAdmin(limitNum);
  }

  @Get('unread')
  @RequirePermissions(PERMISSIONS.VIEW_GLOBAL_STATS)
  async getUnread() {
    return this.notificationsService.getUnreadForSuperAdmin();
  }

  @Get('count')
  @RequirePermissions(PERMISSIONS.VIEW_GLOBAL_STATS)
  async countUnread() {
    const count = await this.notificationsService.countUnread();
    return { count };
  }

  @Patch(':id/read')
  @RequirePermissions(PERMISSIONS.VIEW_GLOBAL_STATS)
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('read-all')
  @RequirePermissions(PERMISSIONS.VIEW_GLOBAL_STATS)
  async markAllAsRead() {
    await this.notificationsService.markAllAsRead();
    return { message: 'Todas las notificaciones marcadas como leídas' };
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.VIEW_GLOBAL_STATS)
  async remove(@Param('id') id: string) {
    await this.notificationsService.remove(id);
    return { message: 'Notificación eliminada' };
  }
}
