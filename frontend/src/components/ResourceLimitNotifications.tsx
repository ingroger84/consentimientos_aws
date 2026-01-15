import { useResourceLimitNotifications } from '../hooks/useResourceLimitNotifications';
import ResourceLimitBanner from './ResourceLimitBanner';

export default function ResourceLimitNotifications() {
  const { alerts, refreshLimits } = useResourceLimitNotifications();

  if (alerts.length === 0) {
    return null;
  }

  // Ordenar alertas por nivel de severidad (blocked > critical > warning)
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { blocked: 3, critical: 2, warning: 1 };
    return severityOrder[b.level] - severityOrder[a.level];
  });

  return (
    <div className="space-y-3">
      {sortedAlerts.map((alert) => (
        <ResourceLimitBanner
          key={alert.type}
          resourceType={alert.type}
          currentCount={alert.current}
          maxLimit={alert.max}
          onDismiss={refreshLimits}
        />
      ))}
    </div>
  );
}
