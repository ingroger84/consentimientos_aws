import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface ResourceLimitIndicatorProps {
  current: number;
  max: number;
  resourceType: 'users' | 'branches' | 'consents' | 'services';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ResourceLimitIndicator({
  current,
  max,
  resourceType,
  showLabel = true,
  size = 'md',
}: ResourceLimitIndicatorProps) {
  const percentage = (current / max) * 100;

  const resourceNames = {
    users: 'Usuarios',
    branches: 'Sedes',
    consents: 'Consentimientos',
    services: 'Servicios',
  };

  // Determinar el estado
  const isBlocked = percentage >= 100;
  const isCritical = percentage >= 90 && percentage < 100;
  const isWarning = percentage >= 70 && percentage < 90;
  const isOk = percentage < 70;

  // Configuración de estilos según el tamaño
  const sizeConfig = {
    sm: {
      height: 'h-1.5',
      text: 'text-xs',
      icon: 'w-3 h-3',
      padding: 'p-2',
    },
    md: {
      height: 'h-2',
      text: 'text-sm',
      icon: 'w-4 h-4',
      padding: 'p-3',
    },
    lg: {
      height: 'h-3',
      text: 'text-base',
      icon: 'w-5 h-5',
      padding: 'p-4',
    },
  };

  const config = sizeConfig[size];

  // Configuración de colores según el estado
  let statusConfig = {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    barColor: 'bg-green-500',
    barBgColor: 'bg-green-100',
    icon: <CheckCircle className={`${config.icon} text-green-500`} />,
    label: 'Disponible',
  };

  if (isBlocked) {
    statusConfig = {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-800',
      barColor: 'bg-red-600',
      barBgColor: 'bg-red-200',
      icon: <AlertCircle className={`${config.icon} text-red-600`} />,
      label: 'Límite alcanzado',
    };
  } else if (isCritical) {
    statusConfig = {
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      textColor: 'text-orange-800',
      barColor: 'bg-orange-600',
      barBgColor: 'bg-orange-200',
      icon: <AlertCircle className={`${config.icon} text-orange-600`} />,
      label: 'Crítico',
    };
  } else if (isWarning) {
    statusConfig = {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-800',
      barColor: 'bg-yellow-500',
      barBgColor: 'bg-yellow-200',
      icon: <AlertTriangle className={`${config.icon} text-yellow-500`} />,
      label: 'Advertencia',
    };
  }

  return (
    <div className={`${statusConfig.bgColor} border ${statusConfig.borderColor} rounded-lg ${config.padding}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {statusConfig.icon}
          {showLabel && (
            <span className={`${config.text} font-medium ${statusConfig.textColor}`}>
              {resourceNames[resourceType]}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className={`${config.text} font-bold ${statusConfig.textColor}`}>
            {current} / {max}
          </span>
          <span className={`${config.text} ${statusConfig.textColor} opacity-75`}>
            ({percentage.toFixed(0)}%)
          </span>
        </div>
      </div>
      
      <div className={`w-full ${statusConfig.barBgColor} rounded-full ${config.height}`}>
        <div
          className={`${statusConfig.barColor} ${config.height} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {showLabel && (
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs ${statusConfig.textColor} opacity-75`}>
            {statusConfig.label}
          </span>
          {!isOk && (
            <span className={`text-xs ${statusConfig.textColor} font-medium`}>
              {isBlocked
                ? 'No puedes crear más'
                : isCritical
                ? `Solo ${max - current} disponible${max - current !== 1 ? 's' : ''}`
                : `${max - current} disponible${max - current !== 1 ? 's' : ''}`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
