import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

interface ResourceLimits {
  users: { current: number; max: number };
  branches: { current: number; max: number };
  consents: { current: number; max: number };
  services: { current: number; max: number };
}

interface ResourceAlert {
  type: 'users' | 'branches' | 'consents' | 'services';
  level: 'warning' | 'critical' | 'blocked';
  current: number;
  max: number;
  percentage: number;
}

export function useResourceLimitNotifications() {
  const { user } = useAuthStore();
  const [alerts, setAlerts] = useState<ResourceAlert[]>([]);
  const [limits, setLimits] = useState<ResourceLimits | null>(null);

  useEffect(() => {
    // Solo cargar para usuarios con tenant (no Super Admin)
    if (!user?.tenant) {
      return;
    }

    fetchResourceLimits();
  }, [user]);

  const fetchResourceLimits = async () => {
    try {
      // Obtener información del tenant con sus recursos
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/tenants/${user?.tenant?.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener límites de recursos');
      }

      const tenant = await response.json();

      const resourceLimits: ResourceLimits = {
        users: {
          current: tenant.users?.filter((u: any) => !u.deletedAt).length || 0,
          max: tenant.maxUsers || 0,
        },
        branches: {
          current: tenant.branches?.filter((b: any) => !b.deletedAt).length || 0,
          max: tenant.maxBranches || 0,
        },
        consents: {
          current: tenant.consents?.filter((c: any) => !c.deletedAt).length || 0,
          max: tenant.maxConsents || 0,
        },
        services: {
          current: tenant.services?.filter((s: any) => !s.deletedAt).length || 0,
          max: tenant.maxServices || 0,
        },
      };

      setLimits(resourceLimits);

      // Generar alertas basadas en los porcentajes
      const newAlerts: ResourceAlert[] = [];

      Object.entries(resourceLimits).forEach(([type, { current, max }]) => {
        const percentage = (current / max) * 100;

        if (percentage >= 100) {
          newAlerts.push({
            type: type as any,
            level: 'blocked',
            current,
            max,
            percentage,
          });
        } else if (percentage >= 90) {
          newAlerts.push({
            type: type as any,
            level: 'critical',
            current,
            max,
            percentage,
          });
        } else if (percentage >= 70) {
          newAlerts.push({
            type: type as any,
            level: 'warning',
            current,
            max,
            percentage,
          });
        }
      });

      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error al cargar límites de recursos:', error);
    }
  };

  const checkResourceLimit = (
    resourceType: 'users' | 'branches' | 'consents' | 'services'
  ): { canCreate: boolean; alert?: ResourceAlert } => {
    if (!limits) {
      return { canCreate: true };
    }

    const { current, max } = limits[resourceType];
    const percentage = (current / max) * 100;

    if (percentage >= 100) {
      return {
        canCreate: false,
        alert: {
          type: resourceType,
          level: 'blocked',
          current,
          max,
          percentage,
        },
      };
    }

    if (percentage >= 90) {
      return {
        canCreate: true,
        alert: {
          type: resourceType,
          level: 'critical',
          current,
          max,
          percentage,
        },
      };
    }

    if (percentage >= 70) {
      return {
        canCreate: true,
        alert: {
          type: resourceType,
          level: 'warning',
          current,
          max,
          percentage,
        },
      };
    }

    return { canCreate: true };
  };

  const refreshLimits = () => {
    fetchResourceLimits();
  };

  return {
    alerts,
    limits,
    checkResourceLimit,
    refreshLimits,
    hasAlerts: alerts.length > 0,
    hasCriticalAlerts: alerts.some(a => a.level === 'critical' || a.level === 'blocked'),
  };
}
