import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useSessionCheck } from '@/hooks/useSessionCheck';
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
  UserCircle,
  RefreshCw,
  FileStack,
  ClipboardList,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

// Tipo para las secciones de navegación
interface NavSection {
  title: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  permission: string;
  badge?: string;
}

export default function Layout() {
  const { user, logout, setUser } = useAuthStore();
  const { settings } = useTheme();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshingPermissions, setRefreshingPermissions] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Verificar sesión periódicamente
  useSessionCheck();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const handleRefreshPermissions = async () => {
    try {
      setRefreshingPermissions(true);
      const api = (await import('@/services/api')).default;
      const response = await api.post('/auth/refresh-token');
      const { access_token, user: updatedUser } = response.data;
      
      // Actualizar token y usuario en localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Actualizar usuario en el store
      setUser(updatedUser);
      
      // Mostrar mensaje de éxito
      alert('Permisos actualizados correctamente. La página se recargará.');
      
      // Recargar la página para aplicar los cambios
      window.location.reload();
    } catch (error) {
      console.error('Error al refrescar permisos:', error);
      alert('Error al actualizar permisos. Por favor, intenta cerrar sesión y volver a iniciar.');
    } finally {
      setRefreshingPermissions(false);
    }
  };

  // Organizar navegación por secciones lógicas
  const getNavigationSections = (): NavSection[] => {
    const sections: NavSection[] = [];

    // Sección: Principal (siempre visible)
    sections.push({
      title: 'Principal',
      items: [
        { 
          name: 'Dashboard', 
          href: '/dashboard', 
          icon: LayoutDashboard,
          permission: 'view_dashboard'
        },
      ],
      defaultOpen: true
    });

    // Sección: Gestión Clínica (HC y Consentimientos)
    const clinicalItems: NavItem[] = [];
    
    if (user?.role.type === 'super_admin') {
      clinicalItems.push({
        name: 'Historias Clínicas',
        href: '/super-admin/medical-records',
        icon: ClipboardList,
        permission: 'view_global_stats'
      });
    } else {
      clinicalItems.push({
        name: 'Historias Clínicas',
        href: '/medical-records',
        icon: ClipboardList,
        permission: 'view_medical_records'
      });
    }
    
    clinicalItems.push({
      name: 'Consentimientos',
      href: '/consents',
      icon: FileText,
      permission: 'view_consents'
    });

    if (clinicalItems.length > 0) {
      sections.push({
        title: 'Gestión Clínica',
        items: clinicalItems,
        collapsible: true,
        defaultOpen: true
      });
    }

    // Sección: Plantillas
    const templateItems: NavItem[] = [];
    
    templateItems.push({
      name: 'Plantillas HC',
      href: '/mr-consent-templates',
      icon: FileStack,
      permission: 'view_mr_consent_templates'
    });
    
    templateItems.push({
      name: 'Plantillas CN',
      href: '/consent-templates',
      icon: FileText,
      permission: 'view_templates'
    });

    if (templateItems.length > 0) {
      sections.push({
        title: 'Plantillas',
        items: templateItems,
        collapsible: true,
        defaultOpen: false
      });
    }

    // Sección: Gestión de Datos
    const dataItems: NavItem[] = [];
    
    dataItems.push({
      name: 'Clientes',
      href: '/clients',
      icon: UserCircle,
      permission: 'view_clients'
    });
    
    dataItems.push({
      name: 'Usuarios',
      href: '/users',
      icon: Users,
      permission: 'view_users'
    });

    if (dataItems.length > 0) {
      sections.push({
        title: 'Gestión de Datos',
        items: dataItems,
        collapsible: true,
        defaultOpen: false
      });
    }

    // Sección: Configuración de Organización
    const orgItems: NavItem[] = [];
    
    orgItems.push({
      name: 'Sedes',
      href: '/branches',
      icon: Building2,
      permission: 'view_branches'
    });
    
    orgItems.push({
      name: 'Servicios',
      href: '/services',
      icon: Briefcase,
      permission: 'view_services'
    });
    
    orgItems.push({
      name: 'Preguntas',
      href: '/questions',
      icon: HelpCircle,
      permission: 'view_questions'
    });
    
    orgItems.push({
      name: 'Roles y Permisos',
      href: '/roles',
      icon: Shield,
      permission: 'view_roles'
    });

    if (orgItems.length > 0) {
      sections.push({
        title: 'Organización',
        items: orgItems,
        collapsible: true,
        defaultOpen: false
      });
    }

    // Sección: Facturación (solo para tenants)
    if (user?.tenant) {
      const billingItems: NavItem[] = [];
      
      billingItems.push({
        name: 'Mi Plan',
        href: '/my-plan',
        icon: CreditCard,
        permission: 'view_dashboard'
      });
      
      billingItems.push({
        name: 'Mis Facturas',
        href: '/my-invoices',
        icon: Receipt,
        permission: 'view_invoices'
      });

      if (billingItems.length > 0) {
        sections.push({
          title: 'Facturación',
          items: billingItems,
          collapsible: true,
          defaultOpen: false
        });
      }
    }

    // Sección: Administración (solo para super_admin)
    if (user?.role.type === 'super_admin') {
      sections.push({
        title: 'Administración',
        items: [
          {
            name: 'Tenants',
            href: '/tenants',
            icon: Building,
            permission: 'manage_tenants'
          },
          {
            name: 'Planes',
            href: '/plans',
            icon: CreditCard,
            permission: 'manage_tenants'
          },
          {
            name: 'Facturación',
            href: '/billing',
            icon: DollarSign,
            permission: 'manage_tenants'
          },
          {
            name: 'Impuestos',
            href: '/tax-config',
            icon: Percent,
            permission: 'manage_tenants'
          },
        ],
        collapsible: true,
        defaultOpen: false
      });
    }

    // Sección: Configuración (siempre al final)
    sections.push({
      title: 'Configuración',
      items: [
        {
          name: 'Configuración',
          href: '/settings',
          icon: Settings,
          permission: 'view_settings'
        },
      ],
      defaultOpen: true
    });

    return sections;
  };

  const navigationSections = getNavigationSections();

  // Filtrar secciones y items según permisos
  const filteredSections = navigationSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => hasPermission(item.permission))
    }))
    .filter(section => section.items.length > 0);

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
                className="h-16 object-contain"
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
                className="h-16 object-contain"
              />
            ) : (
              <h1 className="text-xl font-bold text-white">{settings.companyName}</h1>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
            {filteredSections.map((section) => {
              const isSectionCollapsed = collapsedSections[section.title] ?? !section.defaultOpen;
              const hasActiveItem = section.items.some(item => 
                location.pathname === item.href || location.pathname.startsWith(item.href + '/')
              );

              return (
                <div key={section.title} className="space-y-1">
                  {/* Section Header */}
                  {section.collapsible ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSection(section.title);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                      type="button"
                    >
                      <span>{section.title}</span>
                      {isSectionCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {section.title}
                    </div>
                  )}

                  {/* Section Items */}
                  {!isSectionCollapsed && (
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={closeMobileMenu}
                            className={`
                              flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                              ${isActive 
                                ? 'bg-primary/10 text-primary' 
                                : 'text-gray-700 hover:bg-gray-100'
                              }
                            `}
                            style={isActive ? { color: settings.primaryColor, backgroundColor: `${settings.primaryColor}15` } : {}}
                          >
                            <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Separator after section (except last) */}
                  {section !== filteredSections[filteredSections.length - 1] && (
                    <div className="pt-3">
                      <div className="border-t border-gray-200"></div>
                    </div>
                  )}
                </div>
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
              <div className="flex gap-1 ml-2 flex-shrink-0">
                <button
                  onClick={handleRefreshPermissions}
                  disabled={refreshingPermissions}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Actualizar permisos"
                >
                  <RefreshCw className={`w-5 h-5 ${refreshingPermissions ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
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
