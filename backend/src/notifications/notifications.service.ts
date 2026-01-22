import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  /**
   * Crear notificación de nueva cuenta para Super Admin
   */
  async createNewAccountNotification(tenantData: any): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      type: NotificationType.NEW_ACCOUNT,
      title: '🎉 Nueva Cuenta Creada',
      message: `${tenantData.name} se ha registrado con el plan ${tenantData.plan}`,
      metadata: {
        tenantId: tenantData.id,
        tenantName: tenantData.name,
        tenantSlug: tenantData.slug,
        plan: tenantData.plan,
        contactEmail: tenantData.contactEmail,
        contactName: tenantData.contactName,
        createdAt: new Date(),
      },
      userId: null, // null = notificación para Super Admin
      read: false,
    });

    return await this.notificationsRepository.save(notification);
  }

  /**
   * Obtener notificaciones no leídas para Super Admin
   */
  async getUnreadForSuperAdmin(): Promise<Notification[]> {
    return await this.notificationsRepository.find({
      where: {
        userId: null, // null = Super Admin
        read: false,
      },
      order: {
        createdAt: 'DESC',
      },
      take: 50,
    });
  }

  /**
   * Obtener todas las notificaciones para Super Admin
   */
  async getAllForSuperAdmin(limit: number = 50): Promise<Notification[]> {
    return await this.notificationsRepository.find({
      where: {
        userId: null,
      },
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });

    if (notification) {
      notification.read = true;
      return await this.notificationsRepository.save(notification);
    }

    return null;
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(): Promise<void> {
    await this.notificationsRepository.update(
      { userId: null, read: false },
      { read: true },
    );
  }

  /**
   * Contar notificaciones no leídas
   */
  async countUnread(): Promise<number> {
    return await this.notificationsRepository.count({
      where: {
        userId: null,
        read: false,
      },
    });
  }

  /**
   * Eliminar notificación
   */
  async remove(id: string): Promise<void> {
    await this.notificationsRepository.delete(id);
  }
}
