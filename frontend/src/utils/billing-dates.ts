/**
 * Utilidades para cálculo de fechas de facturación
 */

/**
 * Calcula la fecha de la próxima factura basándose en la fecha de creación, el día de facturación y el plan
 * @param createdAt Fecha de creación del tenant
 * @param billingDay Día del mes para facturación (1-28). Si no se proporciona, usa la fecha de creación + 1 mes
 * @param plan Plan del tenant (free, basic, professional, enterprise)
 */
export function getNextInvoiceDate(createdAt: string | Date, billingDay?: number, plan?: string): Date {
  const created = new Date(createdAt);
  const today = new Date();
  
  // Para plan gratuito (free), la próxima factura es 7 días después de la creación
  if (plan === 'free') {
    const nextInvoice = new Date(created);
    nextInvoice.setDate(nextInvoice.getDate() + 7);
    return nextInvoice;
  }
  
  // Si no hay billingDay, usar el comportamiento anterior (fecha de creación + 1 mes)
  if (!billingDay) {
    const nextInvoice = new Date(created);
    nextInvoice.setMonth(nextInvoice.getMonth() + 1);
    return nextInvoice;
  }
  
  // Calcular la próxima fecha de facturación basada en billingDay
  const nextInvoice = new Date(today.getFullYear(), today.getMonth(), billingDay);
  
  // Si el día de facturación ya pasó este mes, usar el próximo mes
  if (nextInvoice <= today) {
    nextInvoice.setMonth(nextInvoice.getMonth() + 1);
  }
  
  // Si el tenant fue creado después del día de facturación de este mes,
  // la primera factura será el próximo mes
  const createdDay = created.getDate();
  const createdMonth = created.getMonth();
  const createdYear = created.getFullYear();
  
  if (createdYear === today.getFullYear() && createdMonth === today.getMonth() && createdDay > billingDay) {
    // Si fue creado este mes después del día de facturación, la próxima es el mes siguiente
    if (nextInvoice.getMonth() === today.getMonth()) {
      nextInvoice.setMonth(nextInvoice.getMonth() + 1);
    }
  }
  
  return nextInvoice;
}

/**
 * Calcula cuántos días faltan para la próxima factura
 * @param createdAt Fecha de creación del tenant
 * @param billingDay Día del mes para facturación (1-28)
 * @param plan Plan del tenant (free, basic, professional, enterprise)
 */
export function getDaysUntilNextInvoice(createdAt: string | Date, billingDay?: number, plan?: string): number {
  const nextInvoice = getNextInvoiceDate(createdAt, billingDay, plan);
  const today = new Date();
  
  // Normalizar las fechas a medianoche para comparación precisa
  const nextInvoiceMidnight = new Date(nextInvoice.getFullYear(), nextInvoice.getMonth(), nextInvoice.getDate());
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  // Calcular diferencia en milisegundos y convertir a días
  const diffTime = nextInvoiceMidnight.getTime() - todayMidnight.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Formatea una fecha en formato legible en español
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Formatea una fecha con hora en formato legible en español
 */
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Obtiene el color del indicador según los días restantes
 */
export function getInvoiceDaysColor(daysRemaining: number): string {
  if (daysRemaining < 0) {
    return 'text-red-600'; // Vencida
  } else if (daysRemaining <= 7) {
    return 'text-orange-600'; // Próxima a vencer
  } else if (daysRemaining <= 15) {
    return 'text-yellow-600'; // Advertencia
  } else {
    return 'text-green-600'; // Normal
  }
}

/**
 * Obtiene el texto descriptivo según los días restantes
 */
export function getInvoiceDaysText(daysRemaining: number): string {
  if (daysRemaining < 0) {
    return `Vencida hace ${Math.abs(daysRemaining)} días`;
  } else if (daysRemaining === 0) {
    return 'Vence hoy';
  } else if (daysRemaining === 1) {
    return 'Vence mañana';
  } else if (daysRemaining <= 7) {
    return `Vence en ${daysRemaining} días`;
  } else {
    return `En ${daysRemaining} días`;
  }
}
