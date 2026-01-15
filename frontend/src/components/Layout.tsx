import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { usePermissions } from '@/hooks/usePermissions';
import { getResourceUrl } from '@/utils/api-url';
import PaymentReminderBanner from '@/components/billing/PaymentReminderBanner';
import ResourceLimitNotifications from '@/components/ResourceLimitNotifications';
import {
  FileText,
  Users,
  Building2,
  Briefcase,
  LayoutDashboard,
  LogOut,
  HelpCircle,
  Shield,
  Settings,
  Building,
  CreditCard,
  DollarSign,
  Mail,
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { settings } = useTheme();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Definir todas las opciones de navegación con sus permisos requeridos
  const allNavigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      permission: 'view_dashboard'
    },
    { 
      name: 'Consentimientos', 
      href: '/consents', 
      icon: FileText,
      permission: 'view_consents'
    },
    { 
      name: 'Usuarios', 
      href: '/users', 
      icon: Users,
      permission: 'view_users'
    },
    { 
      name: 'Roles y Permisos', 
      href: '/roles', 
      icon: Shield,
      permission: 'view_roles'
    },
    { 
      name: 'Sedes', 
      href: '/branches', 
      icon: Building2,
      permission: 'view_branches'
    },
    { 
      name: 'Servicios', 
      href: '/services', 
      icon: Briefcase,
      permission: 'view_services'
    },
    { 
      name: 'Preguntas', 
      href: '/questions', 
      icon: HelpCircle,
      permission: 'view_questions'
    },
    { 
      name: 'Configuración', 
      href: '/settings', 
      icon: Settings,
      permission: 'view_settings'
    },
  ];

  // Agregar configuración de correo solo para usuarios de tenant
  if (user?.tenant) {
    allNavigation.push({
      name: 'Correo Electrónico', 
      href: '/email-config', 
      icon: Mail,
      permission: 'configure_email'
    });
  }

  // Agregar opciones de facturación para usuarios de tenant (no super_admin)
  if (user?.tenant) {
    allNavigation.push({
      name: 'Mi Plan',
      href: '/my-plan',
      icon: CreditCard,
      permission: 'view_dashboard'
    });
  }

  // Agregar opciones de administración para super_admin
  if (user?.role.type === 'super_admin') {
    allNavigation.push({
      name: 'Tenants',
      href: '/tenants',
      icon: Building,
      permission: 'manage_tenants'
    });
    allNavigation.push({
      name: 'Planes',
      href: '/plans',
      icon: CreditCard,
      permission: 'manage_tenants'
    });
    allNavigation.push({
      name: 'Facturación',
      href: '/billing',
      icon: DollarSign,
      permission: 'manage_tenants'
    });
  }

  // Filtrar navegación según permisos del usuario
  const navigation = allNavigation.filter(item => hasPermission(item.permission));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary" style={{ backgroundColor: settings.primaryColor }}>
            {settings.logoUrl ? (
              <img
                src={getResourceUrl(settings.logoUrl)}
                alt={settings.companyName}
                className="h-10 object-contain"
              />
            ) : (
              <h1 className="text-xl font-bold text-white">{settings.companyName}</h1>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User info */}
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div>                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <main className="p-8">
          <PaymentReminderBanner />
          <ResourceLimitNotifications />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
