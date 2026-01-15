import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Invoice } from './entities/invoice.entity';
import { Tenant } from '../tenants/entities/tenant.entity';

@Injectable()
export class InvoicePdfService {
  /**
   * Generar PDF de factura
   */
  async generateInvoicePdf(invoice: Invoice, tenant: Tenant): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: { top: 40, bottom: 40, left: 40, right: 40 },
          bufferPages: true,
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // Header con logo y título
        this.addHeader(doc, invoice);

        // Información del tenant y emisor
        this.addPartyInfo(doc, tenant);

        // Información de la factura
        this.addInvoiceInfo(doc, invoice);

        // Tabla de items
        const itemsEndY = this.addItemsTable(doc, invoice);

        // Totales
        this.addTotals(doc, invoice, itemsEndY);

        // Notas
        if (invoice.notes) {
          this.addNotes(doc, invoice, itemsEndY + 120);
        }

        // Footer
        this.addFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addHeader(doc: PDFKit.PDFDocument, invoice: Invoice) {
    // Título principal
    doc
      .fontSize(20)
      .fillColor('#3b82f6')
      .font('Helvetica-Bold')
      .text('FACTURA', 40, 40, { align: 'right' });

    // Número de factura
    doc
      .fontSize(11)
      .fillColor('#6b7280')
      .font('Helvetica')
      .text(invoice.invoiceNumber, 40, 65, { align: 'right' });

    // Línea separadora
    doc
      .moveTo(40, 85)
      .lineTo(572, 85)
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .stroke();
  }

  private addPartyInfo(doc: PDFKit.PDFDocument, tenant: Tenant) {
    const startY = 100;

    // Facturado a (izquierda)
    doc
      .fontSize(9)
      .fillColor('#111827')
      .font('Helvetica-Bold')
      .text('FACTURADO A:', 40, startY);

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#374151')
      .text(tenant.name, 40, startY + 15)
      .fontSize(9)
      .text(tenant.contactName || '', 40, startY + 30)
      .text(tenant.contactEmail || '', 40, startY + 43)
      .text(tenant.contactPhone || '', 40, startY + 56);

    // Emitido por (derecha)
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#111827')
      .text('EMITIDO POR:', 350, startY);

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#374151')
      .text('Innova Systems', 350, startY + 15)
      .fontSize(9)
      .text('Sistema de Consentimientos', 350, startY + 30)
      .text('soporte@innovasystems.com', 350, startY + 43);
  }

  private addInvoiceInfo(doc: PDFKit.PDFDocument, invoice: Invoice) {
    const startY = 180;

    // Cuadro de información
    doc
      .rect(40, startY, 532, 65)
      .fillAndStroke('#eff6ff', '#3b82f6');

    const infoStartY = startY + 12;
    const col1X = 55;
    const col2X = 300;

    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor('#1e40af')
      .text('FECHA DE EMISIÓN:', col1X, infoStartY)
      .text('FECHA DE VENCIMIENTO:', col1X, infoStartY + 20)
      .text('PERÍODO DE FACTURACIÓN:', col1X, infoStartY + 40);

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#1e3a8a')
      .text(
        new Date(invoice.createdAt).toLocaleDateString('es-CO'),
        col2X,
        infoStartY
      )
      .text(
        new Date(invoice.dueDate).toLocaleDateString('es-CO'),
        col2X,
        infoStartY + 20
      )
      .text(
        `${new Date(invoice.periodStart).toLocaleDateString('es-CO')} - ${new Date(
          invoice.periodEnd
        ).toLocaleDateString('es-CO')}`,
        col2X,
        infoStartY + 40
      );
  }

  private addItemsTable(doc: PDFKit.PDFDocument, invoice: Invoice): number {
    const startY = 260;
    const tableTop = startY;

    // Encabezados de tabla
    doc
      .rect(40, tableTop, 532, 20)
      .fillAndStroke('#3b82f6', '#3b82f6');

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#ffffff')
      .text('DESCRIPCIÓN', 50, tableTop + 6, { width: 300 })
      .text('CANT.', 360, tableTop + 6, { width: 50, align: 'center' })
      .text('PRECIO UNIT.', 420, tableTop + 6, { width: 70, align: 'right' })
      .text('TOTAL', 500, tableTop + 6, { width: 62, align: 'right' });

    // Items
    let currentY = tableTop + 25;
    doc.font('Helvetica').fontSize(9).fillColor('#374151');

    // Verificar si hay items
    const items = invoice.items && invoice.items.length > 0 ? invoice.items : [];
    
    if (items.length === 0) {
      // Si no hay items, mostrar un mensaje
      doc
        .fillColor('#9ca3af')
        .text('No hay items registrados', 50, currentY, { width: 522, align: 'center' });
      currentY += 20;
    } else {
      // Mostrar items
      items.forEach((item, index) => {
        const rowColor = index % 2 === 0 ? '#f9fafb' : '#ffffff';
        doc.rect(40, currentY - 3, 532, 20).fillAndStroke(rowColor, '#e5e7eb');

        doc
          .fillColor('#374151')
          .text(item.description, 50, currentY, { width: 300 })
          .text(item.quantity.toString(), 360, currentY, { width: 50, align: 'center' })
          .text(this.formatCurrency(item.unitPrice), 420, currentY, {
            width: 70,
            align: 'right',
          })
          .text(this.formatCurrency(item.total), 500, currentY, { width: 62, align: 'right' });

        currentY += 20;
      });
    }

    return currentY + 10;
  }

  private addTotals(doc: PDFKit.PDFDocument, invoice: Invoice, startY: number) {
    const labelX = 400;
    const valueX = 510;

    // Subtotal
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#6b7280')
      .text('Subtotal:', labelX, startY, { width: 100, align: 'right' })
      .fillColor('#374151')
      .text(this.formatCurrency(invoice.amount), valueX, startY, {
        width: 62,
        align: 'right',
      });

    // IVA
    doc
      .fillColor('#6b7280')
      .text('IVA (19%):', labelX, startY + 18, { width: 100, align: 'right' })
      .fillColor('#374151')
      .text(this.formatCurrency(invoice.tax), valueX, startY + 18, {
        width: 62,
        align: 'right',
      });

    // Línea separadora
    doc
      .moveTo(400, startY + 38)
      .lineTo(572, startY + 38)
      .strokeColor('#3b82f6')
      .lineWidth(1.5)
      .stroke();

    // Total
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#1e40af')
      .text('TOTAL:', labelX, startY + 45, { width: 100, align: 'right' })
      .fillColor('#3b82f6')
      .text(this.formatCurrency(invoice.total), valueX, startY + 45, {
        width: 62,
        align: 'right',
      });

    // Estado de pago
    const statusY = startY + 70;
    const statusText = invoice.status === 'paid' ? 'PAGADA' : 'PENDIENTE';
    const statusColor = invoice.status === 'paid' ? '#10b981' : '#f59e0b';

    doc
      .rect(400, statusY, 172, 25)
      .fillAndStroke(statusColor, statusColor);

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#ffffff')
      .text(statusText, 400, statusY + 7, { width: 172, align: 'center' });
  }

  private addNotes(doc: PDFKit.PDFDocument, invoice: Invoice, startY: number) {
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#111827')
      .text('NOTAS:', 40, startY);

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#6b7280')
      .text(invoice.notes, 40, startY + 12, { width: 532, align: 'justify' });
  }

  private addFooter(doc: PDFKit.PDFDocument) {
    const footerY = 720;

    // Línea separadora
    doc
      .moveTo(40, footerY)
      .lineTo(572, footerY)
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .stroke();

    // Texto del footer
    doc
      .font('Helvetica')
      .fontSize(7)
      .fillColor('#9ca3af')
      .text('Innova Systems - Sistema de Consentimientos Digitales', 40, footerY + 8, {
        align: 'center',
        width: 532,
      })
      .text('Este documento es una factura electrónica válida', 40, footerY + 18, {
        align: 'center',
        width: 532,
      });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
