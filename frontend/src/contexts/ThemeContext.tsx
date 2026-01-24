import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '../utils/api-url';

// Crear una instancia de axios especial para settings que no redirija en 401
const settingsApi = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para extraer el tenant slug del hostname
const getTenantSlug = (): string | null => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // localhost o IP sin subdominio
  if (hostname === 'localhost' || hostname === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }
  
  // Si tiene 2 partes y el segundo es localhost, el primero es el tenant
  // Ejemplo: clinica-demo.localhost -> tenant 'clinica-demo'
  if (parts.length === 2 && parts[1] === 'localhost') {
    const subdomain = parts[0];
    // Si es 'admin', no es un tenant
    if (subdomain === 'admin') {
      return null;
    }
    return subdomain;
  }
  
  // Si tiene 3 o más partes, el primero es el tenant
  // Ejemplo: clinica-demo.archivoenlinea.com -> tenant 'clinica-demo'
  if (parts.length >= 3) {
    const subdomain = parts[0];
    // Si es 'admin' o 'www', no es un tenant
    if (subdomain === 'admin' || subdomain === 'www') {
      return null;
    }
    return subdomain;
  }
  
  // Dominio principal sin subdominio
  return null;
};

// Agregar token si existe, pero no redirigir en 401
settingsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Agregar el tenant slug como header
    const tenantSlug = getTenantSlug();
    if (tenantSlug) {
      config.headers['X-Tenant-Slug'] = tenantSlug;
      console.log('[ThemeContext] Enviando X-Tenant-Slug:', tenantSlug);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export interface ThemeSettings {
  logoUrl: string | null;
  footerLogoUrl: string | null;
  watermarkLogoUrl: string | null;
  faviconUrl: string | null;
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
  logoUrl: null,
  footerLogoUrl: null,
  watermarkLogoUrl: null,
  faviconUrl: null,
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
    try {
      // Intentar cargar settings públicos directamente si no hay token
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Sin token, usar endpoint público
        console.log('[ThemeContext] No token found, loading public settings');
        try {
          const response = await settingsApi.get('/settings/public');
          setSettings(response.data);
          applyTheme(response.data);
        } catch (publicError) {
          console.log('[ThemeContext] Public settings failed, using defaults');
          applyTheme(defaultSettings);
        }
      } else {
        // Con token, intentar cargar settings autenticados
        try {
          console.log('[ThemeContext] Token found, loading authenticated settings');
          const response = await settingsApi.get('/settings');
          setSettings(response.data);
          applyTheme(response.data);
        } catch (authError: any) {
          // Si falla con token, intentar público sin propagar el error
          if (authError?.response?.status === 401) {
            console.log('[ThemeContext] Auth failed, falling back to public settings');
            try {
              const response = await settingsApi.get('/settings/public');
              setSettings(response.data);
              applyTheme(response.data);
            } catch (publicError) {
              console.log('[ThemeContext] Public settings failed, using defaults');
              applyTheme(defaultSettings);
            }
          } else {
            console.error('[ThemeContext] Unexpected error:', authError);
            applyTheme(defaultSettings);
          }
        }
      }
    } catch (error: any) {
      console.error('[ThemeContext] Fatal error loading settings:', error);
      applyTheme(defaultSettings);
    } finally {
      setLoading(false);
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
