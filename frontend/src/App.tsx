import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import LoadingSpinner from './components/LoadingSpinner';
import ToastContainer from './components/ui/ToastContainer';
import ConfirmDialogContainer from './components/ui/ConfirmDialogContainer';

// Eager loading para páginas críticas (auth)
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SuspendedAccountPage from './pages/SuspendedAccountPage';

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

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/suspended" element={<SuspendedAccountPage />} />
            
            <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/consents" element={<ConsentsPage />} />
              <Route path="/consents/new" element={<CreateConsentPage />} />
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
