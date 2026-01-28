import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '../utils/api-url';

// Función para extraer el tenant slug del hostname
const getTenantSlug = (): string | null => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  console.log('[getTenantSlug] hostname:', hostname);
  console.log('[getTenantSlug] parts:', parts);
  
  // localhost o IP sin subdominio
  if (hostname === 'localhost' || hostname === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    console.log('[getTenantSlug] Detectado como localhost sin subdominio -> NULL (Super Admin)');
    return null;
  }
  
  // Si tiene 2 partes y el segundo es localhost, el primero puede ser el tenant
  // Ejemplo: clinica-demo.localhost -> tenant 'clinica-demo'
  // Ejemplo: admin.localhost -> NULL (Super Admin)
  if (parts.length === 2 && parts[1] === 'localhost') {
    const subdomain = parts[0];
    // Si es 'admin', no es un tenant - es Super Admin
    if (subdomain === 'admin') {
      console.log('[getTenantSlug] Detectado "admin" subdomain -> NULL (Super Admin)');
      return null;
    }
    console.log('[getTenantSlug] Detectado tenant:', subdomain);
    return subdomain;
  }
  
  // Si tiene 3 o más partes, el primero puede ser el tenant
  // Ejemplo: clinica-demo.archivoenlinea.com -> tenant 'clinica-demo'
  // Ejemplo: admin.archivoenlinea.com -> NULL (Super Admin)
  if (parts.length >= 3) {
    const subdomain = parts[0];
    // Si es 'admin' o 'www', no es un tenant
    if (subdomain === 'admin' || subdomain === 'www') {
      console.log('[getTenantSlug] Detectado "admin" o "www" subdomain -> NULL (Super Admin)');
      return null;
    }
    console.log('[getTenantSlug] Detectado tenant:', subdomain);
    return subdomain;
  }
  
  // Dominio principal sin subdominio
  console.log('[getTenantSlug] Dominio principal sin subdominio -> NULL (Super Admin)');
  return null;
};

// Crear una instancia de axios para el endpoint PÚBLICO (sin token)
const publicSettingsApi = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar SOLO el tenant slug (NO el token)
publicSettingsApi.interceptors.request.use(
  (config) => {
    const tenantSlug = getTenantSlug();
    console.log('[publicSettingsApi] Interceptor - tenantSlug:', tenantSlug);
    console.log('[publicSettingsApi] Interceptor - URL:', config.url);
    
    if (tenantSlug) {
      config.headers['X-Tenant-Slug'] = tenantSlug;
      console.log('[publicSettingsApi] Enviando X-Tenant-Slug:', tenantSlug);
    } else {
      console.log('[publicSettingsApi] NO enviando X-Tenant-Slug (Super Admin)');
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Crear una instancia de axios para endpoints AUTENTICADOS (con token)
const settingsApi = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token Y tenant slug
settingsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    const tenantSlug = getTenantSlug();
    console.log('[settingsApi] Interceptor - tenantSlug:', tenantSlug);
    console.log('[settingsApi] Interceptor - URL:', config.url);
    
    if (tenantSlug) {
      config.headers['X-Tenant-Slug'] = tenantSlug;
      console.log('[settingsApi] Enviando X-Tenant-Slug:', tenantSlug);
    } else {
      console.log('[settingsApi] NO enviando X-Tenant-Slug (Super Admin)');
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export interface ThemeSettings {
  // Logos CN (Consentimientos tradicionales)
  logoUrl: string | null;
  footerLogoUrl: string | null;
  watermarkLogoUrl: string | null;
  faviconUrl: string | null;
  
  // Logos HC (Historias Clínicas)
  hcLogoUrl: string | null;
  hcFooterLogoUrl: string | null;
  hcWatermarkLogoUrl: string | null;
  
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  linkColor: string;
  borderColor: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  logoSize: number;
  logoPosition: 'left' | 'center' | 'right';
  watermarkOpacity: number;
  footerText: string;
  procedureTitle: string;
  dataTreatmentTitle: string;
  imageRightsTitle: string;
}

interface ThemeContextType {
  settings: ThemeSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: ThemeSettings = {
  // Logos CN
  logoUrl: null,
  footerLogoUrl: null,
  watermarkLogoUrl: null,
  faviconUrl: null,
  
  // Logos HC
  hcLogoUrl: null,
  hcFooterLogoUrl: null,
  hcWatermarkLogoUrl: null,
  
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  accentColor: '#F59E0B',
  textColor: '#1F2937',
  linkColor: '#3B82F6',
  borderColor: '#D1D5DB',
  companyName: 'Sistema de Consentimientos',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  companyWebsite: '',
  logoSize: 60,
  logoPosition: 'left',
  watermarkOpacity: 0.1,
  footerText: '',
  procedureTitle: 'CONSENTIMIENTO DEL PROCEDIMIENTO',
  dataTreatmentTitle: 'CONSENTIMIENTO PARA TRATAMIENTO DE DATOS PERSONALES',
  imageRightsTitle: 'CONSENTIMIENTO EXPRESO PARA UTILIZACIÓN DE IMÁGENES PERSONALES',
};

const ThemeContext = createContext<ThemeContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    console.log('[ThemeContext] ========== LOADING SETTINGS ==========');
    console.log('[ThemeContext] Current URL:', window.location.href);
    console.log('[ThemeContext] Hostname:', window.location.hostname);
    
    try {
      // Intentar cargar settings públicos directamente si no hay token
      const token = localStorage.getItem('token');
      console.log('[ThemeContext] Token present:', !!token);
      
      if (!token) {
        // Sin token, usar endpoint público (sin enviar token)
        console.log('[ThemeContext] No token found, loading public settings');
        try {
          console.log('[ThemeContext] Calling GET /settings/public...');
          const response = await publicSettingsApi.get('/settings/public');
          console.log('[ThemeContext] ✓ Public settings loaded successfully');
          console.log('[ThemeContext] Company Name:', response.data.companyName);
          console.log('[ThemeContext] Primary Color:', response.data.primaryColor);
          console.log('[ThemeContext] Logo URL:', response.data.logoUrl);
          setSettings(response.data);
          applyTheme(response.data);
        } catch (publicError: any) {
          console.error('[ThemeContext] ✗ Public settings failed');
          console.error('[ThemeContext] Error:', publicError.message);
          console.error('[ThemeContext] Response:', publicError.response?.data);
          console.error('[ThemeContext] Status:', publicError.response?.status);
          console.log('[ThemeContext] Using default settings');
          setSettings(defaultSettings);
          applyTheme(defaultSettings);
        }
      } else {
        // Con token, intentar cargar settings autenticados
        try {
          console.log('[ThemeContext] Token found, loading authenticated settings');
          console.log('[ThemeContext] Calling GET /settings...');
          const response = await settingsApi.get('/settings');
          console.log('[ThemeContext] ✓ Authenticated settings loaded successfully');
          console.log('[ThemeContext] Company Name:', response.data.companyName);
          console.log('[ThemeContext] Primary Color:', response.data.primaryColor);
          console.log('[ThemeContext] Logo URL:', response.data.logoUrl);
          setSettings(response.data);
          applyTheme(response.data);
        } catch (authError: any) {
          console.error('[ThemeContext] ✗ Authenticated settings failed');
          console.error('[ThemeContext] Error:', authError.message);
          console.error('[ThemeContext] Response:', authError.response?.data);
          console.error('[ThemeContext] Status:', authError.response?.status);
          
          // Si falla con token, intentar público sin enviar token
          if (authError?.response?.status === 401) {
            console.log('[ThemeContext] Auth failed (401), falling back to public settings');
            try {
              console.log('[ThemeContext] Calling GET /settings/public...');
              const response = await publicSettingsApi.get('/settings/public');
              console.log('[ThemeContext] ✓ Public settings loaded successfully (fallback)');
              console.log('[ThemeContext] Company Name:', response.data.companyName);
              setSettings(response.data);
              applyTheme(response.data);
            } catch (publicError: any) {
              console.error('[ThemeContext] ✗ Public settings failed (fallback)');
              console.error('[ThemeContext] Error:', publicError.message);
              console.log('[ThemeContext] Using default settings');
              setSettings(defaultSettings);
              applyTheme(defaultSettings);
            }
          } else {
            console.error('[ThemeContext] Unexpected error, using defaults');
            setSettings(defaultSettings);
            applyTheme(defaultSettings);
          }
        }
      }
    } catch (error: any) {
      console.error('[ThemeContext] ========== FATAL ERROR ==========');
      console.error('[ThemeContext] Fatal error loading settings:', error);
      console.error('[ThemeContext] Using default settings');
      setSettings(defaultSettings);
      applyTheme(defaultSettings);
    } finally {
      setLoading(false);
      console.log('[ThemeContext] ========== SETTINGS LOAD COMPLETE ==========');
    }
  };

  const applyTheme = (themeSettings: ThemeSettings) => {
    const root = document.documentElement;
    
    // Aplicar colores CSS personalizados
    root.style.setProperty('--color-primary', themeSettings.primaryColor);
    root.style.setProperty('--color-secondary', themeSettings.secondaryColor);
    root.style.setProperty('--color-accent', themeSettings.accentColor);
    root.style.setProperty('--color-text', themeSettings.textColor);
    root.style.setProperty('--color-link', themeSettings.linkColor);
    root.style.setProperty('--color-border', themeSettings.borderColor);
    
    // Actualizar el título de la página
    document.title = themeSettings.companyName;
    
    // Actualizar el favicon si existe
    if (themeSettings.faviconUrl) {
      updateFavicon(themeSettings.faviconUrl);
    }
  };

  const updateFavicon = (faviconUrl: string) => {
    // Construir URL completa
    const fullUrl = faviconUrl.startsWith('http') 
      ? faviconUrl 
      : `${getApiBaseUrl()}${faviconUrl}`;
    
    // Buscar o crear el elemento link del favicon
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    
    // Actualizar el href
    link.href = fullUrl;
    
    // También actualizar apple-touch-icon si existe
    let appleLink: HTMLLinkElement | null = document.querySelector("link[rel~='apple-touch-icon']");
    if (appleLink) {
      appleLink.href = fullUrl;
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const refreshSettings = async () => {
    await loadSettings();
  };

  return (
    <ThemeContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}
