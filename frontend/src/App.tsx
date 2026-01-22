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

// Lazy loading para páginas secundarias (mejor performance)
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ConsentsPage = lazy(() => import('./pages/ConsentsPage'));
const CreateConsentPage = lazy(() => import('./pages/CreateConsentPage'));
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

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Detectar si estamos en un subdominio (tenant o admin)
  const isSubdomain = () => {
    const hostname = window.location.hostname;
    // Si es localhost, verificar puerto o path
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true; // En desarrollo, siempre mostrar login
    }
    // En producción, verificar si NO es el dominio principal
    const parts = hostname.split('.');
    // Si tiene más de 2 partes (ej: admin.datagree.net) o es un subdominio conocido
    return parts.length > 2 || hostname.startsWith('admin.') || hostname.includes('.');
  };

  const showLanding = !isSubdomain();

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            {/* Ruta raíz: Landing si es dominio principal, Login si es subdominio */}
            <Route path="/" element={showLanding ? <PublicLandingPage /> : <LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/suspended" element={<SuspendedAccountPage />} />
            
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/consents" element={<ConsentsPage />} />
              <Route path="/consents/new" element={<CreateConsentPage />} />
              <Route path="/consents/edit/:id" element={<CreateConsentPage />} />
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
