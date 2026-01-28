import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export interface PDFTemplate {
  name: string;
  content: string;
}

export interface PDFGenerationOptions {
  pageBreakBetweenTemplates?: boolean;
  includePageNumbers?: boolean;
  includeHeader?: boolean;
  includeFooter?: boolean;
  headerText?: string;
  footerText?: string;
  // Logos personalizados
  logoUrl?: string;
  footerLogoUrl?: string;
  watermarkLogoUrl?: string;
}

@Injectable()
export class PDFGeneratorService {
  /**
   * Genera un PDF compuesto con múltiples plantillas
   */
  async generateCompositePDF(
    templates: PDFTemplate[],
    options: PDFGenerationOptions = {},
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Crear documento PDF
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: {
            top: 72,
            bottom: 72,
            left: 72,
            right: 72,
          },
          info: {
            Title: 'Consentimiento Informado',
            Author: 'Sistema de Consentimientos',
            Subject: 'Documento de Consentimiento',
            CreationDate: new Date(),
          },
        });

        // Buffer para almacenar el PDF
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Configuración de fuentes y estilos
        const defaultOptions: PDFGenerationOptions = {
          pageBreakBetweenTemplates: true,
          includePageNumbers: true,
          includeHeader: false,
          includeFooter: true,
          footerText: 'Documento generado electrónicamente',
          ...options,
        };

        // Renderizar cada plantilla
        templates.forEach((template, index) => {
          // Agregar salto de página entre plantillas (excepto la primera)
          if (index > 0 && defaultOptions.pageBreakBetweenTemplates) {
            doc.addPage();
          }

          // Header opcional
          if (defaultOptions.includeHeader && defaultOptions.headerText) {
            this.addHeader(doc, defaultOptions.headerText);
          }

          // Título de la plantilla
          doc
            .fontSize(16)
            .font('Helvetica-Bold')
            .text(template.name, {
              align: 'center',
            })
            .moveDown(1);

          // Contenido de la plantilla
          this.renderContent(doc, template.content);

          // Espacio para firma
          this.addSignatureSection(doc);
        });

        // Footer con número de página
        if (defaultOptions.includePageNumbers || defaultOptions.includeFooter) {
          this.addFooter(doc, defaultOptions);
        }

        // Finalizar documento
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Renderiza el contenido de texto en el PDF
   */
  private renderContent(doc: typeof PDFDocument, content: string): void {
    // Dividir contenido en párrafos
    const paragraphs = content.split('\n\n');

    paragraphs.forEach((paragraph) => {
      if (!paragraph.trim()) return;

      // Detectar si es un título (línea corta en mayúsculas)
      const isTitle =
        paragraph.length < 100 &&
        paragraph === paragraph.toUpperCase() &&
        !paragraph.includes(':');

      if (isTitle) {
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .text(paragraph.trim(), {
            align: 'left',
          })
          .moveDown(0.5);
      } else {
        // Texto normal
        doc
          .fontSize(11)
          .font('Helvetica')
          .text(paragraph.trim(), {
            align: 'justify',
            lineGap: 2,
          })
          .moveDown(0.8);
      }
    });

    doc.moveDown(1);
  }

  /**
   * Agrega sección de firma al final de cada plantilla
   */
  private addSignatureSection(doc: typeof PDFDocument): void {
    const currentY = doc.y;
    const pageHeight = doc.page.height;
    const bottomMargin = 72;
    const signatureSectionHeight = 120;

    // Si no hay espacio suficiente, agregar nueva página
    if (currentY + signatureSectionHeight > pageHeight - bottomMargin) {
      doc.addPage();
    }

    doc.moveDown(2);

    // Línea de separación
    doc
      .moveTo(72, doc.y)
      .lineTo(doc.page.width - 72, doc.y)
      .stroke();

    doc.moveDown(0.5);

    // Campos de firma
    const leftX = 72;
    const rightX = doc.page.width / 2 + 20;
    const lineY = doc.y + 40;

    // Firma del paciente
    doc.fontSize(10).font('Helvetica').text('Firma del Paciente:', leftX, doc.y);

    doc
      .moveTo(leftX, lineY)
      .lineTo(leftX + 200, lineY)
      .stroke();

    // Fecha
    doc.fontSize(10).font('Helvetica').text('Fecha:', rightX, doc.y - 10);

    doc
      .moveTo(rightX, lineY)
      .lineTo(rightX + 150, lineY)
      .stroke();

    doc.y = lineY + 10;
  }

  /**
   * Agrega header al documento
   */
  private addHeader(doc: typeof PDFDocument, headerText: string): void {
    const currentY = doc.y;

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(headerText, 72, 40, {
        align: 'center',
        width: doc.page.width - 144,
      });

    doc.y = currentY;
  }

  /**
   * Agrega footer con número de página
   */
  private addFooter(
    doc: typeof PDFDocument,
    options: PDFGenerationOptions,
  ): void {
    const pages = doc.bufferedPageRange();

    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      const oldBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;

      const footerY = doc.page.height - 50;

      // Footer text
      if (options.footerText) {
        doc
          .fontSize(8)
          .font('Helvetica')
          .text(options.footerText, 72, footerY, {
            align: 'center',
            width: doc.page.width - 144,
          });
      }

      // Número de página
      if (options.includePageNumbers) {
        doc
          .fontSize(8)
          .font('Helvetica')
          .text(
            `Página ${i + 1} de ${pages.count}`,
            72,
            footerY + 12,
            {
              align: 'center',
              width: doc.page.width - 144,
            },
          );
      }

      doc.page.margins.bottom = oldBottomMargin;
    }
  }

  /**
   * Convierte un Buffer a Stream (útil para S3)
   */
  bufferToStream(buffer: Buffer): Readable {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
}
