/**
 * Utilidades para cálculo de fechas de facturación
 */

/**
 * Calcula la fecha de la próxima factura basándose en la fecha de creación
 * La próxima factura es al mes siguiente de la fecha de creación
 */
export function getNextInvoiceDate(createdAt: string | Date): Date {
  const created = new Date(createdAt);
  const nextInvoice = new Date(created);
  
  // Agregar un mes
  nextInvoice.setMonth(nextInvoice.getMonth() + 1);
  
  return nextInvoice;
}

/**
 * Calcula cuántos días faltan para la próxima factura
 */
export function getDaysUntilNextInvoice(createdAt: string | Date): number {
  const nextInvoice = getNextInvoiceDate(createdAt);
  const today = new Date();
  
  // Calcular diferencia en milisegundos y convertir a días
  const diffTime = nextInvoice.getTime() - today.getTime();
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
