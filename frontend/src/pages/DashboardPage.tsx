import { useAuthStore } from '../store/authStore';
import SuperAdminDashboard from './SuperAdminDashboard';
import TenantDashboard from './TenantDashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Si es Super Admin (sin tenant), mostrar dashboard de Super Admin
  if (user && !user.tenant) {
    return <SuperAdminDashboard />;
  }

  // Si es usuario de tenant, mostrar dashboard de tenant
  return <TenantDashboard />;
}
