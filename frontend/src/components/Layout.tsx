import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { usePermissions } from '@/hooks/usePermissions';
import { getResourceUrl } from '@/utils/api-url';
import { getAppVersion } from '@/config/version';
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
  Receipt,
  Percent,
  Menu,
  X,
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { settings } = useTheme();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
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

  // Agregar opciones de facturación para usuarios de tenant (no super_admin)
  if (user?.tenant) {
    allNavigation.push({
      name: 'Mi Plan',
      href: '/my-plan',
      icon: CreditCard,
      permission: 'view_dashboard'
    });
    allNavigation.push({
      name: 'Mis Facturas',
      href: '/my-invoices',
      icon: Receipt,
      permission: 'view_invoices'
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
    allNavigation.push({
      name: 'Impuestos',
      href: '/tax-config',
      icon: Percent,
      permission: 'manage_tenants'
    });
  }

  // Filtrar navegación según permisos del usuario
  const navigation = allNavigation.filter(item => hasPermission(item.permission));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="flex items-center justify-between h-16 px-4" style={{ backgroundColor: settings.primaryColor }}>
          {/* Logo */}
          <div className="flex items-center">
            {settings.logoUrl ? (
              <img
                src={getResourceUrl(settings.logoUrl)}
                alt={settings.companyName}
                className="h-8 object-contain"
              />
            ) : (
              <h1 className="text-lg font-bold text-white">{settings.companyName}</h1>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:mt-0
          ${mobileMenuOpen ? 'translate-x-0 mt-16' : '-translate-x-full mt-16 lg:mt-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo - Desktop Only */}
          <div className="hidden lg:flex items-center justify-center h-16 px-4 bg-primary" style={{ backgroundColor: settings.primaryColor }}>
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
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={closeMobileMenu}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  style={isActive ? { color: settings.primaryColor, backgroundColor: `${settings.primaryColor}15` } : {}}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.role.name}</p>
                {/* Mostrar sede para usuarios operadores */}
                {user?.branches && user.branches.length > 0 && (
                  <div className="mt-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <p className="text-xs text-gray-600 truncate">
                      {user.branches.length === 1 
                        ? user.branches[0].name 
                        : `${user.branches.length} sedes`}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                className="ml-2 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
            {/* Version info */}
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-400 text-center">
                v{getAppVersion()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <main className="p-4 sm:p-6 lg:p-8">
          <PaymentReminderBanner />
          <ResourceLimitNotifications />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
