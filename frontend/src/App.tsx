import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import LoadingSpinner from './components/LoadingSpinner';
import ToastContainer from './components/ui/ToastContainer';
import ConfirmDialogContainer from './components/ui/ConfirmDialogContainer';

// Eager loading para páginas críticas (auth y landing)
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SuspendedAccountPage from './pages/SuspendedAccountPage';
import PublicLandingPage from './pages/PublicLandingPage';
import SystemStatusPage from './pages/SystemStatusPage';

// Lazy loading para páginas secundarias (mejor performance)
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ConsentsPage = lazy(() => import('./pages/ConsentsPage'));
const CreateConsentPage = lazy(() => import('./pages/CreateConsentPage'));
const ClientsPage = lazy(() => import('./pages/ClientsPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const BranchesPage = lazy(() => import('./pages/BranchesPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const QuestionsPage = lazy(() => import('./pages/QuestionsPage'));
const RolesPage = lazy(() => import('./pages/RolesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const TenantsPage = lazy(() => import('./pages/TenantsPage'));
const MyPlanPage = lazy(() => import('./pages/MyPlanPage'));
const PlansManagementPage = lazy(() => import('./pages/PlansManagementPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage'));
const BillingDashboardPage = lazy(() => import('./pages/BillingDashboardPage'));
const CreateManualInvoicePage = lazy(() => import('./pages/CreateManualInvoicePage'));
const TenantInvoicesPage = lazy(() => import('./pages/TenantInvoicesPage'));
const TaxConfigPage = lazy(() => import('./pages/TaxConfigPage'));
const ConsentTemplatesPage = lazy(() => import('./pages/ConsentTemplatesPage'));
const MRConsentTemplatesPage = lazy(() => import('./pages/MRConsentTemplatesPage'));
const MedicalRecordsPage = lazy(() => import('./pages/MedicalRecordsPage'));
const SuperAdminMedicalRecordsPage = lazy(() => import('./pages/SuperAdminMedicalRecordsPage'));
const CreateMedicalRecordPage = lazy(() => import('./pages/CreateMedicalRecordPage'));
const ViewMedicalRecordPage = lazy(() => import('./pages/ViewMedicalRecordPage'));

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    console.log('[App] Inicializando aplicación...');
    
    // Limpiar localStorage si el subdominio cambió
    const currentSubdomain = getCurrentSubdomain();
    const storedSubdomain = localStorage.getItem('current_subdomain');
    
    console.log('[App] Subdominio actual:', currentSubdomain);
    console.log('[App] Subdominio almacenado:', storedSubdomain);
    
    if (storedSubdomain && storedSubdomain !== currentSubdomain) {
      console.log('[App] Subdominio cambió, limpiando localStorage...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.setItem('current_subdomain', currentSubdomain);
    } else if (!storedSubdomain) {
      console.log('[App] Primera vez, guardando subdominio...');
      localStorage.setItem('current_subdomain', currentSubdomain);
    }
    
    initialize();
    console.log('[App] Aplicación inicializada');
  }, [initialize]);

  // Función para obtener el subdominio actual
  const getCurrentSubdomain = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // localhost o IP
    if (hostname === 'localhost' || hostname === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return 'localhost';
    }
    
    // Dominio principal (archivoenlinea.com o www.archivoenlinea.com)
    if (parts.length === 2 || (parts.length === 3 && parts[0] === 'www')) {
      return 'main';
    }
    
    // Subdominio (admin.archivoenlinea.com, demo-estetica.archivoenlinea.com, etc.)
    return parts[0];
  };

  // Detectar si estamos en el dominio principal (sin subdominio)
  const isMainDomain = () => {
    const hostname = window.location.hostname;
    
    console.log('[App] Hostname:', hostname);
    console.log('[App] Pathname:', window.location.pathname);
    
    // En desarrollo (localhost), siempre mostrar login
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('[App] Localhost detectado -> Login');
      return false; // No es dominio principal, mostrar login
    }
    
    // En producción, verificar si es exactamente el dominio principal
    // archivoenlinea.com = dominio principal (landing)
    // admin.archivoenlinea.com = subdominio (login)
    // tenant.archivoenlinea.com = subdominio (login)
    
    // Verificar si es exactamente archivoenlinea.com (sin www)
    if (hostname === 'archivoenlinea.com' || hostname === 'www.archivoenlinea.com') {
      console.log('[App] Dominio principal detectado -> Landing');
      return true;
    }
    
    // Cualquier otro caso (subdominios) -> Login
    console.log('[App] Subdominio detectado -> Login');
    return false;
  };

  const showLanding = isMainDomain();
  console.log('[App] showLanding:', showLanding);
  console.log('[App] Renderizando App...');

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            {/* Ruta raíz: Landing si es dominio principal, Login si es subdominio */}
            <Route path="/" element={showLanding ? <PublicLandingPage /> : <LoginPage />} />
            <Route path="/landing" element={<PublicLandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/suspended" element={<SuspendedAccountPage />} />
            <Route path="/status" element={<SystemStatusPage />} />
            
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/consents" element={<ConsentsPage />} />
              <Route path="/consents/new" element={<CreateConsentPage />} />
              <Route path="/consents/edit/:id" element={<CreateConsentPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/consent-templates" element={<ConsentTemplatesPage />} />
              <Route path="/mr-consent-templates" element={<MRConsentTemplatesPage />} />
              <Route path="/medical-records" element={<MedicalRecordsPage />} />
              <Route path="/super-admin/medical-records" element={<SuperAdminMedicalRecordsPage />} />
              <Route path="/medical-records/new" element={<CreateMedicalRecordPage />} />
              <Route path="/medical-records/:id" element={<ViewMedicalRecordPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/branches" element={<BranchesPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/questions" element={<QuestionsPage />} />
              <Route path="/roles" element={<RolesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/tenants" element={<TenantsPage />} />
              <Route path="/plans" element={<PlansManagementPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/my-plan" element={<MyPlanPage />} />
              <Route path="/my-invoices" element={<TenantInvoicesPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/tax-config" element={<TaxConfigPage />} />
              <Route path="/billing" element={<BillingDashboardPage />} />
              <Route path="/billing/create-invoice" element={<CreateManualInvoicePage />} />
            </Route>
          </Routes>
        </Suspense>
        <ToastContainer />
        <ConfirmDialogContainer />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
