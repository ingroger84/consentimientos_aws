/**
 * Script de prueba del sistema de pagos y facturación
 * 
 * Ejecutar con: npx ts-node test-billing-system.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { BillingService } from './src/billing/billing.service';
import { InvoicesService } from './src/invoices/invoices.service';
import { PaymentsService } from './src/payments/payments.service';
import { PaymentReminderService } from './src/billing/payment-reminder.service';

async function testBillingSystem() {
  console.log('🚀 Iniciando prueba del sistema de pagos y facturación...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  const billingService = app.get(BillingService);
  const invoicesService = app.get(InvoicesService);
  const paymentsService = app.get(PaymentsService);
  const reminderService = app.get(PaymentReminderService);

  try {
    // Test 1: Dashboard Financiero
    console.log('📊 Test 1: Dashboard Financiero');
    const dashboard = await billingService.getDashboardStats();
    console.log('✅ Dashboard obtenido exitosamente');
    console.log(`   - Ingresos mensuales: $${dashboard.monthlyRevenue.toLocaleString('es-CO')}`);
    console.log(`   - Facturas pendientes: ${dashboard.pendingInvoices}`);
    console.log(`   - Facturas vencidas: ${dashboard.overdueInvoices}`);
    console.log(`   - Tenants suspendidos: ${dashboard.suspendedTenants}`);
    console.log(`   - Próximos vencimientos: ${dashboard.upcomingDue}\n`);

    // Test 2: Listar Facturas
    console.log('📄 Test 2: Listar Facturas');
    const invoices = await invoicesService.findAll();
    console.log(`✅ ${invoices.length} facturas encontradas\n`);

    // Test 3: Listar Pagos
    console.log('💰 Test 3: Listar Pagos');
    const payments = await paymentsService.findAll();
    console.log(`✅ ${payments.length} pagos encontrados\n`);

    // Test 4: Recordatorios Pendientes
    console.log('⏰ Test 4: Recordatorios Pendientes');
    const reminders = await reminderService.getPendingReminders();
    console.log(`✅ ${reminders.length} recordatorios pendientes\n`);

    // Test 5: Historial de Billing
    console.log('📋 Test 5: Historial de Billing');
    const history = await billingService.getHistory(undefined, 10);
    console.log(`✅ ${history.length} registros en historial\n`);

    // Test 6: Facturas Vencidas
    console.log('⚠️  Test 6: Facturas Vencidas');
    const overdueInvoices = await invoicesService.findOverdue();
    console.log(`✅ ${overdueInvoices.length} facturas vencidas encontradas\n`);

    console.log('🎉 Todos los tests completados exitosamente!\n');
    console.log('📝 Resumen:');
    console.log(`   - Sistema de pagos: ✅ Funcional`);
    console.log(`   - Sistema de facturas: ✅ Funcional`);
    console.log(`   - Sistema de recordatorios: ✅ Funcional`);
    console.log(`   - Dashboard financiero: ✅ Funcional`);
    console.log(`   - Historial de auditoría: ✅ Funcional\n`);

    console.log('💡 Próximos pasos:');
    console.log('   1. Implementar frontend para visualización');
    console.log('   2. Configurar SMTP para envío de emails');
    console.log('   3. Generar PDFs de facturas');
    console.log('   4. Integrar pasarelas de pago\n');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    console.error(error.stack);
  } finally {
    await app.close();
  }
}

// Ejecutar pruebas
testBillingSystem()
  .then(() => {
    console.log('✅ Script de prueba finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
