import { Injectable } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { StorageService } from '../common/services/storage.service';

export interface MRConsentPDFOptions {
  clientName: string;
  clientDocument: string;
  clientEmail?: string;
  clientPhone?: string;
  recordNumber: string;
  admissionDate: string;
  branchName?: string;
  companyName?: string;
  signatureData?: string;
  clientPhoto?: string;
  logoUrl?: string;
  footerLogoUrl?: string;
  watermarkLogoUrl?: string;
  primaryColor?: string;
  footerText?: string;
}

export interface MRPDFTemplate {
  name: string;
  content: string;
}

@Injectable()
export class MedicalRecordsPdfService {
  constructor(private storageService: StorageService) {}
  /**
   * Genera un PDF compuesto con múltiples plantillas para HC
   */
  async generateCompositePDF(
    templates: MRPDFTemplate[],
    options: MRConsentPDFOptions,
  ): Promise<Buffer> {
    console.log('\n========================================');
    console.log('=== GENERANDO PDF HC - VERSIÓN 15.0.13 ===');
    console.log('========================================');
    console.log('Plantillas:', templates.length);
    console.log('Opciones recibidas:', {
      clientName: options.clientName,
      logoUrl: options.logoUrl ? 'Configurado' : 'NO configurado',
      footerLogoUrl: options.footerLogoUrl ? 'Configurado' : 'NO configurado',
      watermarkLogoUrl: options.watermarkLogoUrl ? 'Configurado' : 'NO configurado',
    });
    
    const pdfDoc = await PDFDocument.create();
    
    // Cargar fuentes
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Parsear color primario
    const primaryColor = this.parseColor(options.primaryColor || '#3B82F6');

    // Cargar logos si existen
    let logoImage = null;
    let footerLogoImage = null;
    let watermarkImage = null;

    console.log('=== CARGANDO LOGOS HC EN PDF SERVICE ===');
    console.log('logoUrl:', options.logoUrl);
    console.log('footerLogoUrl:', options.footerLogoUrl);
    console.log('watermarkLogoUrl:', options.watermarkLogoUrl);

    try {
      if (options.logoUrl) {
        console.log('Intentando cargar logo principal desde:', options.logoUrl);
        logoImage = await this.loadImage(pdfDoc, options.logoUrl);
        console.log('✓ Logo principal cargado exitosamente');
      } else {
        console.log('⚠️  No hay logoUrl configurado');
      }
    } catch (error) {
      console.error('❌ Error loading logo:', error.message);
      console.error('URL del logo:', options.logoUrl);
    }

    try {
      if (options.footerLogoUrl) {
        console.log('Intentando cargar logo footer desde:', options.footerLogoUrl);
        footerLogoImage = await this.loadImage(pdfDoc, options.footerLogoUrl);
        console.log('✓ Logo footer cargado exitosamente');
      } else {
        console.log('⚠️  No hay footerLogoUrl configurado');
      }
    } catch (error) {
      console.error('❌ Error loading footer logo:', error.message);
      console.error('URL del logo footer:', options.footerLogoUrl);
    }

    try {
      if (options.watermarkLogoUrl) {
        console.log('Intentando cargar marca de agua desde:', options.watermarkLogoUrl);
        watermarkImage = await this.loadImage(pdfDoc, options.watermarkLogoUrl);
        console.log('✓ Marca de agua cargada exitosamente');
      } else {
        console.log('⚠️  No hay watermarkLogoUrl configurado');
      }
    } catch (error) {
      console.error('❌ Error loading watermark:', error.message);
      console.error('URL de la marca de agua:', options.watermarkLogoUrl);
    }

    // Generar páginas para cada plantilla
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const page = pdfDoc.addPage([612, 792]); // Letter size
      const { width, height } = page.getSize();
      const margin = 50;

      let yPosition = height - margin;

      // Agregar marca de agua si existe
      if (watermarkImage) {
        this.addWatermark(page, watermarkImage, width, height);
      }

      // Header con logo y color
      yPosition = await this.addHeader(
        page,
        logoImage,
        primaryColor,
        options.companyName || '',
        font,
        fontBold,
        margin,
        width,
        yPosition,
      );

      // Información del paciente (solo en la primera página)
      if (i === 0) {
        yPosition = this.addClientInfo(
          page,
          options,
          font,
          fontBold,
          margin,
          yPosition,
        );
      }

      // Título de la plantilla con fondo naranja
      yPosition -= 20;
      const titleHeight = 25;
      const accentColor = rgb(0.96, 0.62, 0.04); // #F59E0B
      
      page.drawRectangle({
        x: margin,
        y: yPosition - titleHeight + 5,
        width: width - (margin * 2),
        height: titleHeight,
        color: accentColor,
      });
      
      page.drawText(template.name.toUpperCase(), {
        x: margin + 10,
        y: yPosition - 15,
        size: 12,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
      yPosition -= titleHeight + 15;

      // Contenido de la plantilla
      yPosition = this.renderContent(
        page,
        template.content,
        font,
        fontBold,
        margin,
        width,
        yPosition,
      );

      // Sección de firma (solo en la última página)
      if (i === templates.length - 1) {
        // Agregar espacio adicional antes de la firma para evitar sobreposición
        yPosition -= 40;
        
        yPosition = await this.addSignatureSection(
          page,
          pdfDoc,
          options,
          font,
          fontBold,
          margin,
          width,
          yPosition,
        );
      }

      // Footer
      this.addFooter(
        page,
        footerLogoImage,
        options.footerText || 'Documento generado electrónicamente',
        font,
        margin,
        width,
      );
    }

    return Buffer.from(await pdfDoc.save());
  }

  /**
   * Agrega header con logo y color - DISEÑO MEJORADO
   */
  private async addHeader(
    page: any,
    logoImage: any,
    primaryColor: any,
    companyName: string,
    font: any,
    fontBold: any,
    margin: number,
    width: number,
    yPosition: number,
  ): Promise<number> {
    const { height } = page.getSize();
    
    // Rectángulo de header con color primario - DESDE EL TOPE DE LA PÁGINA
    const headerHeight = 100;
    page.drawRectangle({
      x: 0,
      y: height - headerHeight,
      width: width,
      height: headerHeight,
      color: primaryColor,
    });

    // Logo circular si existe - EN LA ESQUINA SUPERIOR IZQUIERDA
    if (logoImage) {
      const logoSize = 70;
      const logoX = margin + 10;
      const logoY = height - headerHeight + 15;
      
      // Dibujar círculo blanco de fondo para el logo
      const centerX = logoX + logoSize / 2;
      const centerY = logoY + logoSize / 2;
      
      // Círculo blanco de fondo
      page.drawCircle({
        x: centerX,
        y: centerY,
        size: logoSize / 2,
        color: rgb(1, 1, 1),
      });
      
      // Logo dentro del círculo
      page.drawImage(logoImage, {
        x: logoX + 5,
        y: logoY + 5,
        width: logoSize - 10,
        height: logoSize - 10,
      });
    }

    // Texto del header - AL LADO DEL LOGO
    const textX = logoImage ? margin + 100 : margin + 20;
    const textY = height - headerHeight + 50;
    
    // Nombre de la empresa en mayúsculas
    page.drawText(companyName.toUpperCase(), {
      x: textX,
      y: textY,
      size: 14,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    
    // Subtítulo
    page.drawText('CONSENTIMIENTO INFORMADO', {
      x: textX,
      y: textY - 20,
      size: 18,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // Retornar posición después del header
    return height - headerHeight - 30;
  }

  /**
   * Agrega información del cliente con diseño mejorado
   */
  private addClientInfo(
    page: any,
    options: MRConsentPDFOptions,
    font: any,
    fontBold: any,
    margin: number,
    yPosition: number,
  ): number {
    // Color naranja para los títulos (accentColor)
    const accentColor = rgb(0.96, 0.62, 0.04); // #F59E0B

    // Título de la sección con fondo naranja
    const titleHeight = 25;
    page.drawRectangle({
      x: margin,
      y: yPosition - titleHeight + 5,
      width: page.getSize().width - (margin * 2),
      height: titleHeight,
      color: accentColor,
    });

    page.drawText('INFORMACIÓN DEL CLIENTE', {
      x: margin + 10,
      y: yPosition - 15,
      size: 12,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    yPosition -= titleHeight + 10;

    // Dibujar un rectángulo de fondo para la información
    const infoBoxHeight = 100;
    page.drawRectangle({
      x: margin,
      y: yPosition - infoBoxHeight + 10,
      width: page.getSize().width - (margin * 2),
      height: infoBoxHeight,
      color: rgb(0.98, 0.98, 0.98),
      borderColor: rgb(0.9, 0.9, 0.9),
      borderWidth: 1,
    });

    // Información en dos columnas
    const col1X = margin + 15;
    const col2X = margin + 300;
    let currentY = yPosition - 5;
    const lineHeight = 18;

    // Columna 1
    page.drawText('Nombre Completo:', {
      x: col1X,
      y: currentY,
      size: 9,
      font: fontBold,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText(options.clientName, {
      x: col1X,
      y: currentY - 12,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    currentY -= lineHeight + 12;

    page.drawText('Identificación:', {
      x: col1X,
      y: currentY,
      size: 9,
      font: fontBold,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText(options.clientDocument, {
      x: col1X,
      y: currentY - 12,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
    });
    currentY -= lineHeight + 12;

    if (options.clientEmail) {
      page.drawText('Email:', {
        x: col1X,
        y: currentY,
        size: 9,
        font: fontBold,
        color: rgb(0.3, 0.3, 0.3),
      });
      page.drawText(options.clientEmail, {
        x: col1X,
        y: currentY - 12,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });
    }

    // Columna 2
    currentY = yPosition - 5;

    if (options.clientPhone) {
      page.drawText('Teléfono:', {
        x: col2X,
        y: currentY,
        size: 9,
        font: fontBold,
        color: rgb(0.3, 0.3, 0.3),
      });
      page.drawText(options.clientPhone, {
        x: col2X,
        y: currentY - 12,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });
      currentY -= lineHeight + 12;
    }

    if (options.branchName) {
      page.drawText('Sede:', {
        x: col2X,
        y: currentY,
        size: 9,
        font: fontBold,
        color: rgb(0.3, 0.3, 0.3),
      });
      page.drawText(options.branchName, {
        x: col2X,
        y: currentY - 12,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });
    }

    return yPosition - infoBoxHeight - 20;
  }

  /**
   * Renderiza el contenido de texto
   */
  private renderContent(
    page: any,
    content: string,
    font: any,
    fontBold: any,
    margin: number,
    width: number,
    yPosition: number,
  ): number {
    const maxWidth = width - (margin * 2);
    const lineHeight = 15;
    
    // Primero dividir por párrafos (doble salto de línea)
    const paragraphs = content.split('\n\n');

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) continue;

      // Luego dividir cada párrafo por saltos de línea simples
      const lines = paragraph.split('\n');
      
      for (const line of lines) {
        if (!line.trim()) continue;

        // Detectar si es un título
        const isTitle =
          line.length < 100 &&
          line === line.toUpperCase() &&
          !line.includes(':');

        const fontSize = isTitle ? 12 : 10;
        const useFont = isTitle ? fontBold : font;

        // Dividir en líneas que quepan en el ancho
        const words = line.trim().split(' ');
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          
          // Limpiar el texto de caracteres especiales que WinAnsi no puede codificar
          const cleanTestLine = testLine.replace(/[\r\n\t]/g, ' ');
          
          const testWidth = useFont.widthOfTextAtSize(cleanTestLine, fontSize);

          if (testWidth > maxWidth && currentLine) {
            // Dibujar línea actual
            const cleanCurrentLine = currentLine.replace(/[\r\n\t]/g, ' ');
            page.drawText(cleanCurrentLine, {
              x: margin,
              y: yPosition,
              size: fontSize,
              font: useFont,
              color: rgb(0, 0, 0),
            });
            yPosition -= lineHeight;
            currentLine = word;

            // Verificar si necesitamos nueva página
            if (yPosition < 100) {
              // No podemos agregar nueva página aquí, solo retornar
              return yPosition;
            }
          } else {
            currentLine = testLine;
          }
        }

        // Dibujar última línea
        if (currentLine) {
          const cleanCurrentLine = currentLine.replace(/[\r\n\t]/g, ' ');
          page.drawText(cleanCurrentLine, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: useFont,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight;
        }
      }

      yPosition -= 10; // Espacio entre párrafos
    }

    return yPosition;
  }

  /**
   * Agrega sección de firma digital
   */
  private async addSignatureSection(
    page: any,
    pdfDoc: PDFDocument,
    options: MRConsentPDFOptions,
    font: any,
    fontBold: any,
    margin: number,
    width: number,
    yPosition: number,
  ): Promise<number> {
    // Asegurar espacio suficiente - AUMENTADO SIGNIFICATIVAMENTE
    // La firma debe estar mucho más arriba para dejar espacio al footer
    // Necesitamos: etiquetas (20) + cajas (120) + espacio footer (100) = 240 puntos mínimo
    if (yPosition < 250) {
      yPosition = 250;
    }

    // Espacio antes de las cajas de firma (sin título)
    yPosition -= 30;

    const boxSize = 120;
    const spacing = 40;
    const totalWidth = (boxSize * 2) + spacing;
    const startX = (width - totalWidth) / 2;

    // Dibujar etiquetas primero (ambas en la misma línea Y)
    const labelY = yPosition;
    
    // Etiqueta de firma (izquierda)
    if (options.signatureData) {
      page.drawText('Firma del Paciente:', {
        x: startX,
        y: labelY,
        size: 10,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
    }

    // Etiqueta de foto (derecha)
    if (options.clientPhoto) {
      const photoX = options.signatureData ? startX + boxSize + spacing : startX;
      page.drawText('Foto del Paciente:', {
        x: photoX,
        y: labelY,
        size: 10,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
    }

    // Bajar posición para las cajas (20 puntos debajo de las etiquetas)
    yPosition -= 20;

    // Columna izquierda: Firma capturada
    if (options.signatureData) {
      // Caja para firma
      page.drawRectangle({
        x: startX,
        y: yPosition - boxSize,
        width: boxSize,
        height: boxSize,
        borderColor: rgb(0.5, 0.5, 0.5),
        borderWidth: 1,
      });

      // Dibujar firma
      try {
        const signatureImage = await this.embedSignature(pdfDoc, options.signatureData);
        
        const imgWidth = signatureImage.width;
        const imgHeight = signatureImage.height;
        
        let drawWidth = boxSize - 10;
        let drawHeight = boxSize - 10;
        
        if (imgWidth > imgHeight) {
          drawHeight = (imgHeight / imgWidth) * drawWidth;
        } else {
          drawWidth = (imgWidth / imgHeight) * drawHeight;
        }
        
        const offsetX = (boxSize - drawWidth) / 2;
        const offsetY = (boxSize - drawHeight) / 2;
        
        page.drawImage(signatureImage, {
          x: startX + offsetX,
          y: yPosition - boxSize + offsetY,
          width: drawWidth,
          height: drawHeight,
        });
      } catch (error) {
        console.error('Error embedding signature:', error);
      }
    }

    // Columna derecha: Foto del cliente
    if (options.clientPhoto) {
      const photoX = options.signatureData ? startX + boxSize + spacing : startX;

      // Caja para foto
      page.drawRectangle({
        x: photoX,
        y: yPosition - boxSize,
        width: boxSize,
        height: boxSize,
        borderColor: rgb(0.5, 0.5, 0.5),
        borderWidth: 1,
      });

      // Dibujar foto
      try {
        const photoImage = await this.embedPhoto(pdfDoc, options.clientPhoto);
        
        const imgWidth = photoImage.width;
        const imgHeight = photoImage.height;
        
        let drawWidth = boxSize - 10;
        let drawHeight = boxSize - 10;
        
        if (imgWidth > imgHeight) {
          drawHeight = (imgHeight / imgWidth) * drawWidth;
        } else {
          drawWidth = (imgWidth / imgHeight) * drawHeight;
        }
        
        const offsetX = (boxSize - drawWidth) / 2;
        const offsetY = (boxSize - drawHeight) / 2;
        
        page.drawImage(photoImage, {
          x: photoX + offsetX,
          y: yPosition - boxSize + offsetY,
          width: drawWidth,
          height: drawHeight,
        });
      } catch (error) {
        console.error('Error embedding photo:', error);
      }
    }

    // Retornar posición debajo de las cajas de firma/foto
    // Dejando MUCHO más espacio para el footer (100 puntos)
    return yPosition - boxSize - 100;
  }

  /**
   * Agrega footer centrado debajo de la firma con buen espaciado
   */
  private addFooter(
    page: any,
    footerLogoImage: any,
    footerText: string,
    font: any,
    margin: number,
    width: number,
  ): void {
    // Posición del footer bien separada de la firma
    // Se coloca a 50 puntos desde abajo para dar buen espacio
    const footerY = 50;

    // Calcular ancho del texto para centrarlo
    const textWidth = font.widthOfTextAtSize(footerText, 9);
    const textX = (width - textWidth) / 2;

    // Texto del footer centrado
    page.drawText(footerText, {
      x: textX,
      y: footerY,
      size: 9,
      font: font,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  /**
   * Agrega marca de agua
   */
  private addWatermark(
    page: any,
    watermarkImage: any,
    width: number,
    height: number,
  ): void {
    const watermarkSize = Math.min(width, height) * 0.5;
    const x = (width - watermarkSize) / 2;
    const y = (height - watermarkSize) / 2;

    page.drawImage(watermarkImage, {
      x,
      y,
      width: watermarkSize,
      height: watermarkSize,
      opacity: 0.1,
    });
  }

  /**
   * Carga una imagen desde URL usando el storage service
   */
  private async loadImage(pdfDoc: PDFDocument, url: string): Promise<any> {
    console.log('loadImage - Descargando imagen desde:', url);
    
    try {
      // Usar storage service para descargar (maneja S3 y local)
      const imageBytes = await this.storageService.downloadFile(url);
      console.log('loadImage - Imagen descargada, tamaño:', imageBytes.length, 'bytes');

      // Detectar formato de imagen por magic numbers (primeros bytes)
      // PNG: 89 50 4E 47 (‰PNG)
      // JPEG: FF D8 FF
      const isPNG = imageBytes[0] === 0x89 && imageBytes[1] === 0x50 && imageBytes[2] === 0x4E && imageBytes[3] === 0x47;
      const isJPEG = imageBytes[0] === 0xFF && imageBytes[1] === 0xD8 && imageBytes[2] === 0xFF;

      if (isPNG) {
        console.log('loadImage - Detectado formato PNG (magic numbers)');
        return await pdfDoc.embedPng(imageBytes);
      } else if (isJPEG) {
        console.log('loadImage - Detectado formato JPEG (magic numbers)');
        return await pdfDoc.embedJpg(imageBytes);
      } else {
        console.error('loadImage - Formato de imagen no soportado');
        console.error('Primeros 4 bytes (hex):', imageBytes.slice(0, 4).toString('hex'));
        throw new Error('Formato de imagen no soportado. Solo PNG y JPEG son válidos.');
      }
    } catch (error) {
      console.error('loadImage - Error al cargar imagen:', error.message);
      throw error;
    }
  }

  /**
   * Embebe firma digital
   */
  private async embedSignature(pdfDoc: PDFDocument, signatureData: string): Promise<any> {
    const base64Data = signatureData.replace(/^data:image\/\w+;base64,/, '');
    const imageBytes = Buffer.from(base64Data, 'base64');
    return await pdfDoc.embedPng(imageBytes);
  }

  /**
   * Embebe foto del cliente
   */
  private async embedPhoto(pdfDoc: PDFDocument, photoData: string): Promise<any> {
    const base64Data = photoData.replace(/^data:image\/\w+;base64,/, '');
    const imageBytes = Buffer.from(base64Data, 'base64');
    
    // Intentar como PNG primero, si falla intentar como JPG
    try {
      return await pdfDoc.embedPng(imageBytes);
    } catch {
      return await pdfDoc.embedJpg(imageBytes);
    }
  }

  /**
   * Parsea un color hexadecimal a RGB
   */
  private parseColor(hex: string): any {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return rgb(
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      );
    }
    return rgb(0.23, 0.51, 0.96); // Default blue
  }
}
