const fs = require('fs');

// Leer el archivo
let content = fs.readFileSync('src/mail/mail.service.ts', 'utf8');

console.log('Corrigiendo email de facturacion...\n');

// Corregir el enlace del PDF
const oldLink = '<a href="#" class="button">Descargar Factura PDF</a>';
const newLink = '<a href="${pdfUrl}" class="button">Descargar Factura PDF</a>';

if (content.includes(oldLink)) {
  console.log('Corrigiendo enlace del PDF...');
  content = content.replace(oldLink, newLink);
}

// Agregar la variable pdfUrl
const templateStart = "private getInvoiceEmailTemplate(tenant: any, invoice: any): string {\n    const dueDate = new Date(invoice.dueDate).toLocaleDateString('es-CO');\n    const amount = this.formatCurrency(invoice.total);";

if (content.includes(templateStart) && !content.includes('const pdfUrl')) {
  console.log('Agregando variable pdfUrl...');
  const templateStartWithPdf = "private getInvoiceEmailTemplate(tenant: any, invoice: any): string {\n    const dueDate = new Date(invoice.dueDate).toLocaleDateString('es-CO');\n    const amount = this.formatCurrency(invoice.total);\n    const apiUrl = this.configService.get('API_URL') || 'http://localhost:3000';\n    const pdfUrl = `${apiUrl}/api/invoices/${invoice.id}/pdf`;";
  content = content.replace(templateStart, templateStartWithPdf);
}

// Guardar
fs.writeFileSync('src/mail/mail.service.ts', content, 'utf8');
console.log('\nListo! Ahora ejecuta fix-encoding.js para corregir los caracteres especiales');
