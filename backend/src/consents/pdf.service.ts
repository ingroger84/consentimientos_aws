import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PDFDocument, PDFPage, rgb, StandardFonts, PDFImage } from 'pdf-lib';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Consent } from './entities/consent.entity';
import { SettingsService } from '../settings/settings.service';
import { StorageService } from '../common/services/storage.service';

interface PdfGenerationResult {
  procedurePdfUrl: string;
  dataTreatmentPdfUrl: string;
  imageRightsPdfUrl: string;
}

interface PdfTheme {
  primaryColor: { r: number; g: number; b: number };
  secondaryColor: { r: number; g: number; b: number };
  accentColor: { r: number; g: number; b: number };
  textColor: { r: number; g: number; b: number };
  linkColor: { r: number; g: number; b: number };
  borderColor: { r: number; g: number; b: number };
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  logoImage?: PDFImage;
  footerLogoImage?: PDFImage;
  watermarkLogoImage?: PDFImage;
  logoSize: number;
  logoPosition: 'left' | 'center' | 'right';
  watermarkOpacity: number;
  footerText: string;
  procedureTitle: string;
  dataTreatmentTitle: string;
  imageRightsTitle: string;
}

@Injectable()
export class PdfService {
  constructor(
    private configService: ConfigService,
    private settingsService: SettingsService,
    private storageService: StorageService,
  ) {}

  async generateAllConsentPdfs(consent: Consent): Promise<PdfGenerationResult> {
    // Generate single unified PDF with all 3 sections
    const pdfUrl = await this.generateUnifiedConsentPdf(consent);

    return {
      procedurePdfUrl: pdfUrl,
      dataTreatmentPdfUrl: pdfUrl,
      imageRightsPdfUrl: pdfUrl,
    };
  }

  async generateUnifiedConsentPdf(consent: Consent): Promise<string> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Cargar tema personalizado con el tenantId del consentimiento
    const tenantId = consent.tenant?.id;
    const theme = await this.loadPdfTheme(pdfDoc, tenantId);

    // Add all 3 sections to the same PDF
    await this.addProcedureSection(pdfDoc, consent, font, fontBold, theme);
    await this.addDataTreatmentSection(pdfDoc, consent, font, fontBold, theme);
    await this.addImageRightsSection(pdfDoc, consent, font, fontBold, theme);

    // Save unified PDF
    const pdfBytes = await pdfDoc.save();
    const fileName = `consent-unified-${consent.id}.pdf`;

    // Subir a S3 o almacenamiento local usando StorageService
    const pdfUrl = await this.storageService.uploadBuffer(
      Buffer.from(pdfBytes),
      'consents',
      fileName,
      'application/pdf'
    );

    return pdfUrl;
  }

  private async loadPdfTheme(pdfDoc: PDFDocument, tenantId?: string): Promise<PdfTheme> {
    console.log('[PDF Service] Cargando tema para tenantId:', tenantId || 'Super Admin');
    const settings = await this.settingsService.getSettings(tenantId);
    console.log('[PDF Service] Settings cargados:', {
      companyName: settings.companyName,
      logoUrl: settings.logoUrl,
      tenantId: tenantId || 'null'
    });

    // Convertir colores hex a RGB
    const primaryColor = this.hexToRgb(settings.primaryColor);
    const secondaryColor = this.hexToRgb(settings.secondaryColor);
    const accentColor = this.hexToRgb(settings.accentColor);
    const textColor = this.hexToRgb(settings.textColor);
    const linkColor = this.hexToRgb(settings.linkColor);
    const borderColor = this.hexToRgb(settings.borderColor);

    // Cargar logo principal si existe
    let logoImage: PDFImage | undefined;
    if (settings.logoUrl) {
      try {
        const logoBytes = await this.storageService.downloadFile(settings.logoUrl);
        const ext = path.extname(settings.logoUrl).toLowerCase();
        logoImage = await this.loadImageSafe(pdfDoc, logoBytes, ext);
      } catch (error) {
        console.error('Error loading logo for PDF:', error);
      }
    }

    // Cargar logo del footer si existe
    let footerLogoImage: PDFImage | undefined;
    if (settings.footerLogoUrl) {
      try {
        const logoBytes = await this.storageService.downloadFile(settings.footerLogoUrl);
        const ext = path.extname(settings.footerLogoUrl).toLowerCase();
        footerLogoImage = await this.loadImageSafe(pdfDoc, logoBytes, ext);
      } catch (error) {
        console.error('Error loading footer logo for PDF:', error);
      }
    }

    // Cargar logo de marca de agua si existe
    let watermarkLogoImage: PDFImage | undefined;
    if (settings.watermarkLogoUrl) {
      try {
        const logoBytes = await this.storageService.downloadFile(settings.watermarkLogoUrl);
        const ext = path.extname(settings.watermarkLogoUrl).toLowerCase();
        watermarkLogoImage = await this.loadImageSafe(pdfDoc, logoBytes, ext);
      } catch (error) {
        console.error('Error loading watermark logo for PDF:', error);
      }
    }

    return {
      primaryColor,
      secondaryColor,
      accentColor,
      textColor,
      linkColor,
      borderColor,
      companyName: settings.companyName,
      companyAddress: settings.companyAddress,
      companyPhone: settings.companyPhone,
      companyEmail: settings.companyEmail,
      companyWebsite: settings.companyWebsite,
      logoImage,
      footerLogoImage,
      watermarkLogoImage,
      logoSize: settings.logoSize,
      logoPosition: settings.logoPosition as 'left' | 'center' | 'right',
      watermarkOpacity: settings.watermarkOpacity,
      footerText: settings.footerText,
      procedureTitle: settings.procedureTitle,
      dataTreatmentTitle: settings.dataTreatmentTitle,
      imageRightsTitle: settings.imageRightsTitle,
    };
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    // Remover el # si existe
    hex = hex.replace('#', '');
    
    // Convertir a RGB (valores entre 0 y 1 para pdf-lib)
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    return { r, g, b };
  }

  private removeEmojis(text: string): string {
    // Remover emojis y caracteres especiales que WinAnsi no puede codificar
    return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
  }

  private async loadImageSafe(pdfDoc: PDFDocument, imageBytes: Buffer, ext: string): Promise<PDFImage | undefined> {
    try {
      // Intentar cargar como PNG primero
      if (ext === '.png') {
        return await pdfDoc.embedPng(imageBytes);
      }
      
      // Para JPG, intentar primero como JPG, si falla intentar como PNG
      try {
        return await pdfDoc.embedJpg(imageBytes);
      } catch (jpgError) {
        console.log('Failed to load as JPG, trying PNG...');
        return await pdfDoc.embedPng(imageBytes);
      }
    } catch (error) {
      console.error('Failed to load image:', error);
      return undefined;
    }
  }

  private addWatermark(page: PDFPage, theme: PdfTheme): void {
    if (!theme.watermarkLogoImage) return;

    const { width, height } = page.getSize();
    const watermarkSize = Math.min(width, height) * 0.4; // 40% del tamaño de la página

    // Calcular dimensiones manteniendo aspect ratio
    const imgWidth = theme.watermarkLogoImage.width;
    const imgHeight = theme.watermarkLogoImage.height;
    let drawWidth = watermarkSize;
    let drawHeight = watermarkSize;
    
    if (imgWidth > imgHeight) {
      drawHeight = (imgHeight / imgWidth) * drawWidth;
    } else {
      drawWidth = (imgWidth / imgHeight) * drawHeight;
    }

    // Centrar la marca de agua
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;

    page.drawImage(theme.watermarkLogoImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
      opacity: theme.watermarkOpacity,
    });
  }

  private addFooter(page: PDFPage, font: any, theme: PdfTheme): void {
    const { width, height } = page.getSize();
    const margin = 50;
    const footerY = 30;

    // Línea separadora
    page.drawLine({
      start: { x: margin, y: footerY + 20 },
      end: { x: width - margin, y: footerY + 20 },
      thickness: 0.5,
      color: rgb(theme.borderColor.r, theme.borderColor.g, theme.borderColor.b),
    });

    // Logo del footer (si existe)
    if (theme.footerLogoImage) {
      const logoSize = 30;
      const imgWidth = theme.footerLogoImage.width;
      const imgHeight = theme.footerLogoImage.height;
      let drawWidth = logoSize;
      let drawHeight = logoSize;
      
      if (imgWidth > imgHeight) {
        drawHeight = (imgHeight / imgWidth) * drawWidth;
      } else {
        drawWidth = (imgWidth / imgHeight) * drawHeight;
      }

      page.drawImage(theme.footerLogoImage, {
        x: margin,
        y: footerY - 5,
        width: drawWidth,
        height: drawHeight,
      });
    }

    // Información de contacto
    const contactX = theme.footerLogoImage ? margin + 40 : margin;
    let currentY = footerY + 10;

    if (theme.companyAddress) {
      const addressText = this.removeEmojis(`Direccion: ${theme.companyAddress}`);
      page.drawText(addressText, {
        x: contactX,
        y: currentY,
        size: 7,
        font,
        color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
      });
      currentY -= 10;
    }

    const contactInfo: string[] = [];
    if (theme.companyPhone) contactInfo.push(this.removeEmojis(`Tel: ${theme.companyPhone}`));
    if (theme.companyEmail) contactInfo.push(this.removeEmojis(`Email: ${theme.companyEmail}`));
    if (theme.companyWebsite) contactInfo.push(this.removeEmojis(`Web: ${theme.companyWebsite}`));

    if (contactInfo.length > 0) {
      page.drawText(contactInfo.join('  |  '), {
        x: contactX,
        y: currentY,
        size: 7,
        font,
        color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
      });
    }

    // Texto personalizado del footer
    if (theme.footerText) {
      const cleanFooterText = this.removeEmojis(theme.footerText);
      page.drawText(cleanFooterText, {
        x: width - margin - font.widthOfTextAtSize(cleanFooterText, 7),
        y: footerY + 5,
        size: 7,
        font,
        color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
      });
    }
  }

  private async addProcedureSection(
    pdfDoc: PDFDocument,
    consent: Consent,
    font: any,
    fontBold: any,
    theme: PdfTheme,
  ): Promise<void> {
    let page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    let yPosition = height - 50;
    const margin = 50;
    const contentWidth = width - (margin * 2);

    // Agregar marca de agua
    this.addWatermark(page, theme);

    // Header con color personalizado
    page.drawRectangle({
      x: 0,
      y: height - 100,
      width: width,
      height: 100,
      color: rgb(theme.primaryColor.r, theme.primaryColor.g, theme.primaryColor.b),
    });

    // Logo (si existe) con posición y tamaño configurables
    let logoX = margin;
    if (theme.logoImage) {
      const logoSize = theme.logoSize;
      
      // Calcular dimensiones manteniendo aspect ratio
      const imgWidth = theme.logoImage.width;
      const imgHeight = theme.logoImage.height;
      let drawWidth = logoSize;
      let drawHeight = logoSize;
      
      if (imgWidth > imgHeight) {
        drawHeight = (imgHeight / imgWidth) * drawWidth;
      } else {
        drawWidth = (imgWidth / imgHeight) * drawHeight;
      }

      // Calcular posición X según configuración
      if (theme.logoPosition === 'center') {
        logoX = (width - drawWidth) / 2;
      } else if (theme.logoPosition === 'right') {
        logoX = width - margin - drawWidth;
      }
      
      // Centrar verticalmente dentro del header azul (100px de altura)
      const headerHeight = 100;
      const headerTop = height - headerHeight;
      const logoY = headerTop + (headerHeight - drawHeight) / 2;
      
      page.drawImage(theme.logoImage, {
        x: logoX,
        y: logoY,
        width: drawWidth,
        height: drawHeight,
      });
    }

    // Título y nombre de la empresa
    const titleX = theme.logoImage && theme.logoPosition === 'left' ? margin + theme.logoSize + 20 : margin;
    page.drawText(theme.companyName.toUpperCase(), {
      x: titleX,
      y: height - 40,
      size: 10,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText(theme.procedureTitle, {
      x: titleX,
      y: height - 60,
      size: 14,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    yPosition = height - 120;

    // Service info con color de acento
    page.drawRectangle({
      x: margin,
      y: yPosition - 40,
      width: contentWidth,
      height: 40,
      color: rgb(0.95, 0.95, 0.95),
      borderColor: rgb(theme.borderColor.r, theme.borderColor.g, theme.borderColor.b),
      borderWidth: 1,
    });

    page.drawText(`SERVICIO: ${consent.service.name.toUpperCase()}`, {
      x: margin + 10,
      y: yPosition - 25,
      size: 12,
      font: fontBold,
      color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
    });

    yPosition -= 60;

    // Client info section
    page.drawText('INFORMACIÓN DEL CLIENTE', {
      x: margin,
      y: yPosition,
      size: 14,
      font: fontBold,
      color: rgb(theme.accentColor.r, theme.accentColor.g, theme.accentColor.b),
    });

    yPosition -= 5;
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 2,
      color: rgb(theme.accentColor.r, theme.accentColor.g, theme.accentColor.b),
    });

    yPosition -= 25;

    const clientInfo = [
      { label: 'Nombre Completo:', value: consent.clientName },
      { label: 'Identificación:', value: consent.clientId },
      { label: 'Email:', value: consent.clientEmail },
      { label: 'Teléfono:', value: consent.clientPhone || 'N/A' },
      { label: 'Sede:', value: consent.branch.name },
    ];

    for (const info of clientInfo) {
      page.drawText(info.label, {
        x: margin,
        y: yPosition,
        size: 10,
        font: fontBold,
        color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
      });
      page.drawText(info.value, {
        x: margin + 120,
        y: yPosition,
        size: 10,
        font,
        color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
      });
      yPosition -= 18;
    }

    yPosition -= 15;

    // Questions and answers
    if (consent.answers && consent.answers.length > 0) {
      page.drawText('PREGUNTAS Y RESPUESTAS', {
        x: margin,
        y: yPosition,
        size: 14,
        font: fontBold,
        color: rgb(theme.accentColor.r, theme.accentColor.g, theme.accentColor.b),
      });

      yPosition -= 5;
      page.drawLine({
        start: { x: margin, y: yPosition },
        end: { x: width - margin, y: yPosition },
        thickness: 2,
        color: rgb(theme.accentColor.r, theme.accentColor.g, theme.accentColor.b),
      });

      yPosition -= 25;

      for (const answer of consent.answers) {
        if (yPosition < 150) {
          // Agregar footer a la página actual
          this.addFooter(page, font, theme);
          
          page = pdfDoc.addPage([595, 842]);
          this.addWatermark(page, theme);
          yPosition = height - 50;
        }

        const questionLines = this.wrapText(
          answer.question.questionText,
          font,
          10,
          contentWidth - 20,
        );

        for (const line of questionLines) {
          page.drawText(line, {
            x: margin + 5,
            y: yPosition,
            size: 10,
            font: fontBold,
            color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
          });
          yPosition -= 15;
        }

        page.drawText(`Respuesta: ${answer.value}`, {
          x: margin + 10,
          y: yPosition,
          size: 10,
          font,
          color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
        });
        yPosition -= 20;
      }
    }

    // Declaration
    if (yPosition < 200) {
      this.addFooter(page, font, theme);
      page = pdfDoc.addPage([595, 842]);
      this.addWatermark(page, theme);
      yPosition = height - 50;
    }

    yPosition -= 20;

    page.drawText('DECLARACIÓN DE CONSENTIMIENTO', {
      x: margin,
      y: yPosition,
      size: 14,
      font: fontBold,
      color: rgb(theme.accentColor.r, theme.accentColor.g, theme.accentColor.b),
    });

    yPosition -= 5;
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 2,
      color: rgb(theme.accentColor.r, theme.accentColor.g, theme.accentColor.b),
    });

    yPosition -= 25;

    const declaration = [
      'Declaro que he sido informado(a) sobre el procedimiento/servicio mencionado,',
      'sus beneficios, riesgos y alternativas. Autorizo voluntariamente la realización',
      'del procedimiento/servicio descrito en este documento.',
    ];

    for (const line of declaration) {
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: 10,
        font,
        color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
      });
      yPosition -= 15;
    }

    yPosition -= 20;

    // Signature
    await this.addSignatureSection(pdfDoc, page, consent, font, fontBold, margin, yPosition, theme);

    // Agregar footer a la última página
    this.addFooter(page, font, theme);
  }

  private async addDataTreatmentSection(
    pdfDoc: PDFDocument,
    consent: Consent,
    font: any,
    fontBold: any,
    theme: PdfTheme,
  ): Promise<void> {
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    let yPosition = height - 50;
    const margin = 50;

    // Agregar marca de agua
    this.addWatermark(page, theme);

    // Header con color personalizado
    page.drawRectangle({
      x: 0,
      y: height - 100,
      width: width,
      height: 100,
      color: rgb(theme.primaryColor.r, theme.primaryColor.g, theme.primaryColor.b),
    });

    // Logo (si existe) con posición y tamaño configurables
    let logoX = margin;
    if (theme.logoImage) {
      const logoSize = theme.logoSize;
      
      const imgWidth = theme.logoImage.width;
      const imgHeight = theme.logoImage.height;
      let drawWidth = logoSize;
      let drawHeight = logoSize;
      
      if (imgWidth > imgHeight) {
        drawHeight = (imgHeight / imgWidth) * drawWidth;
      } else {
        drawWidth = (imgWidth / imgHeight) * drawHeight;
      }

      if (theme.logoPosition === 'center') {
        logoX = (width - drawWidth) / 2;
      } else if (theme.logoPosition === 'right') {
        logoX = width - margin - drawWidth;
      }
      
      // Centrar verticalmente dentro del header azul (100px de altura)
      const headerHeight = 100;
      const headerTop = height - headerHeight;
      const logoY = headerTop + (headerHeight - drawHeight) / 2;
      
      page.drawImage(theme.logoImage, {
        x: logoX,
        y: logoY,
        width: drawWidth,
        height: drawHeight,
      });
    }

    // Título y nombre de la empresa
    const titleX = theme.logoImage && theme.logoPosition === 'left' ? margin + theme.logoSize + 20 : margin;
    page.drawText(theme.companyName.toUpperCase(), {
      x: titleX,
      y: height - 40,
      size: 10,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // Dividir el título en dos líneas si es necesario
    const titleLines = this.wrapText(theme.dataTreatmentTitle, fontBold, 14, width - titleX - margin);
    let titleY = height - 60;
    for (const line of titleLines.slice(0, 2)) {
      page.drawText(line, {
        x: titleX,
        y: titleY,
        size: 14,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
      titleY -= 15;
    }

    yPosition = height - 120;

    // Content
    const content = [
      'De acuerdo con la Ley Estatutaria 1581 de 2.012 de Protección de Datos y sus normas',
      'reglamentarias, doy mi consentimiento, como Titular de los datos, para que éstos sean',
      `incorporados en una base de datos responsabilidad de ${consent.branch.name}, para que sean`,
      'tratados con arreglo a los siguientes criterios:',
      '',
      'La finalidad del tratamiento será la que se defina en cada caso concreto, respetando en',
      'todo momento con los principios básicos que marca la Ley.',
      '',
      'La posibilidad de ejercitar los derechos de acceso, corrección, supresión, revocación o',
      `reclamo por infracción sobre mis datos, con un escrito dirigido a ${consent.branch.name},`,
      `a la dirección de correo electrónico ${consent.branch.email}, indicando en el asunto el`,
      'derecho que desea ejercitar, o mediante correo ordinario remitido a',
      `${consent.branch.address}.`,
    ];

    for (const line of content) {
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: 10,
        font,
        color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
      });
      yPosition -= 15;
    }

    yPosition -= 20;

    // Client info
    page.drawText('TITULAR DE LOS DATOS', {
      x: margin,
      y: yPosition,
      size: 12,
      font: fontBold,
      color: rgb(theme.accentColor.r, theme.accentColor.g, theme.accentColor.b),
    });

    yPosition -= 25;

    const clientInfo = [
      { label: 'Nombre Completo:', value: consent.clientName },
      { label: 'C.C. No.:', value: consent.clientId },
      { label: 'Correo electrónico:', value: consent.clientEmail },
    ];

    for (const info of clientInfo) {
      page.drawText(info.label, {
        x: margin,
        y: yPosition,
        size: 10,
        font: fontBold,
        color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
      });
      page.drawText(info.value, {
        x: margin + 120,
        y: yPosition,
        size: 10,
        font,
        color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
      });
      yPosition -= 18;
    }

    yPosition -= 10;

    // Signature
    await this.addSignatureSection(pdfDoc, page, consent, font, fontBold, margin, yPosition, theme);

    // Agregar footer
    this.addFooter(page, font, theme);
  }

  private async addImageRightsSection(
    pdfDoc: PDFDocument,
    consent: Consent,
    font: any,
    fontBold: any,
    theme: PdfTheme,
  ): Promise<void> {
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    let yPosition = height - 50;
    const margin = 50;

    // Agregar marca de agua
    this.addWatermark(page, theme);

    // Header con color personalizado
    page.drawRectangle({
      x: 0,
      y: height - 100,
      width: width,
      height: 100,
      color: rgb(theme.primaryColor.r, theme.primaryColor.g, theme.primaryColor.b),
    });

    // Logo (si existe) con posición y tamaño configurables
    let logoX = margin;
    if (theme.logoImage) {
      const logoSize = theme.logoSize;
      
      const imgWidth = theme.logoImage.width;
      const imgHeight = theme.logoImage.height;
      let drawWidth = logoSize;
      let drawHeight = logoSize;
      
      if (imgWidth > imgHeight) {
        drawHeight = (imgHeight / imgWidth) * drawWidth;
      } else {
        drawWidth = (imgWidth / imgHeight) * drawHeight;
      }

      if (theme.logoPosition === 'center') {
        logoX = (width - drawWidth) / 2;
      } else if (theme.logoPosition === 'right') {
        logoX = width - margin - drawWidth;
      }
      
      // Centrar verticalmente dentro del header azul (100px de altura)
      const headerHeight = 100;
      const headerTop = height - headerHeight;
      const logoY = headerTop + (headerHeight - drawHeight) / 2;
      
      page.drawImage(theme.logoImage, {
        x: logoX,
        y: logoY,
        width: drawWidth,
        height: drawHeight,
      });
    }

    // Título y nombre de la empresa
    const titleX = theme.logoImage && theme.logoPosition === 'left' ? margin + theme.logoSize + 20 : margin;
    page.drawText(theme.companyName.toUpperCase(), {
      x: titleX,
      y: height - 40,
      size: 10,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // Dividir el título en dos líneas si es necesario
    const titleLines = this.wrapText(theme.imageRightsTitle, fontBold, 14, width - titleX - margin);
    let titleY = height - 60;
    for (const line of titleLines.slice(0, 2)) {
      page.drawText(line, {
        x: titleX,
        y: titleY,
        size: 14,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
      titleY -= 15;
    }

    yPosition = height - 120;

    // Content
    const content = [
      'De acuerdo con la Ley Estatutaria 1581 de 2.012 de Protección de Datos y normas',
      'reglamentarias, y a las demás normas concordantes, autorizo como titular de mis datos',
      'biométricos relacionados con imágenes fotográficas, para que sean incorporadas en una',
      `base de datos responsabilidad de ${consent.branch.name}, con la finalidad de:`,
      '',
      '• Actividades asociativas, culturales, recreativas, deportivas y sociales',
      '• Capacitación y Educación',
      '• Fines históricos, científicos o estadísticos',
      '• Gestión de estadísticas internas',
      '• Marketing, Publicidad y prospección comercial',
      '',
      'De igual modo, declaro haber sido informado de que puedo ejercitar mis derechos de',
      'acceso, corrección, supresión, revocación o reclamo por infracción sobre mis datos,',
      `mediante escrito dirigido a ${consent.branch.name}, a la dirección de correo electrónico`,
      `${consent.branch.email}, indicando en el asunto el derecho que desea ejercitar, o`,
      `mediante correo ordinario remitido a ${consent.branch.address}.`,
    ];

    for (const line of content) {
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: 10,
        font,
        color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
      });
      yPosition -= 15;
    }

    yPosition -= 20;

    // Client info
    page.drawText('TITULAR DE LOS DATOS', {
      x: margin,
      y: yPosition,
      size: 12,
      font: fontBold,
      color: rgb(theme.accentColor.r, theme.accentColor.g, theme.accentColor.b),
    });

    yPosition -= 25;

    const clientInfo = [
      { label: 'Nombre Completo:', value: consent.clientName },
      { label: 'C.C. No.:', value: consent.clientId },
      { label: 'Correo electrónico:', value: consent.clientEmail },
    ];

    for (const info of clientInfo) {
      page.drawText(info.label, {
        x: margin,
        y: yPosition,
        size: 10,
        font: fontBold,
        color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
      });
      page.drawText(info.value, {
        x: margin + 120,
        y: yPosition,
        size: 10,
        font,
        color: rgb(theme.textColor.r, theme.textColor.g, theme.textColor.b),
      });
      yPosition -= 18;
    }

    yPosition -= 10;

    // Signature
    await this.addSignatureSection(pdfDoc, page, consent, font, fontBold, margin, yPosition, theme);

    // Agregar footer
    this.addFooter(page, font, theme);
  }

  private async addSignatureSection(
    pdfDoc: PDFDocument,
    page: PDFPage,
    consent: Consent,
    font: any,
    fontBold: any,
    margin: number,
    yPosition: number,
    theme: PdfTheme,
  ): Promise<void> {
    const { width } = page.getSize();
    
    // Dimensiones cuadradas para mejor visualización
    const boxSize = 100; // Tamaño cuadrado de 100x100
    const spacing = 20; // Espacio entre las dos cajas
    const totalWidth = (boxSize * 2) + spacing;
    const startX = (width - totalWidth) / 2; // Centrar horizontalmente

    // Columna izquierda: Firma
    page.drawText('Firma:', {
      x: startX,
      y: yPosition,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    yPosition -= 10;

    // Caja cuadrada para la firma
    page.drawRectangle({
      x: startX,
      y: yPosition - boxSize,
      width: boxSize,
      height: boxSize,
      borderColor: rgb(0.5, 0.5, 0.5),
      borderWidth: 1,
    });

    if (consent.signatureData) {
      try {
        const signatureImage = await this.embedSignature(
          pdfDoc,
          consent.signatureData,
        );
        
        // Obtener dimensiones originales de la imagen
        const imgWidth = signatureImage.width;
        const imgHeight = signatureImage.height;
        
        // Calcular dimensiones manteniendo aspect ratio dentro del cuadrado
        let drawWidth = boxSize - 10;
        let drawHeight = boxSize - 10;
        
        if (imgWidth > imgHeight) {
          // Imagen horizontal
          drawHeight = (imgHeight / imgWidth) * drawWidth;
        } else {
          // Imagen vertical o cuadrada
          drawWidth = (imgWidth / imgHeight) * drawHeight;
        }
        
        // Centrar la imagen dentro del cuadrado
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
    const photoX = startX + boxSize + spacing;
    
    page.drawText('Foto del Cliente:', {
      x: photoX,
      y: yPosition + 10,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    // Caja cuadrada para la foto
    page.drawRectangle({
      x: photoX,
      y: yPosition - boxSize,
      width: boxSize,
      height: boxSize,
      borderColor: rgb(0.5, 0.5, 0.5),
      borderWidth: 1,
    });

    if (consent.clientPhoto) {
      try {
        const photoImage = await this.embedPhoto(
          pdfDoc,
          consent.clientPhoto,
        );
        
        // Obtener dimensiones originales de la imagen
        const imgWidth = photoImage.width;
        const imgHeight = photoImage.height;
        
        // Calcular dimensiones manteniendo aspect ratio dentro del cuadrado
        let drawWidth = boxSize - 10;
        let drawHeight = boxSize - 10;
        
        if (imgWidth > imgHeight) {
          // Imagen horizontal
          drawHeight = (imgHeight / imgWidth) * drawWidth;
        } else {
          // Imagen vertical o cuadrada
          drawWidth = (imgWidth / imgHeight) * drawHeight;
        }
        
        // Centrar la imagen dentro del cuadrado
        const offsetX = (boxSize - drawWidth) / 2;
        const offsetY = (boxSize - drawHeight) / 2;
        
        page.drawImage(photoImage, {
          x: photoX + offsetX,
          y: yPosition - boxSize + offsetY,
          width: drawWidth,
          height: drawHeight,
        });
      } catch (error) {
        console.error('Error embedding client photo:', error);
        // Si hay error, mostrar texto indicativo
        page.drawText('Sin foto', {
          x: photoX + boxSize / 2 - 20,
          y: yPosition - boxSize / 2,
          size: 9,
          font,
          color: rgb(0.6, 0.6, 0.6),
        });
      }
    } else {
      // Si no hay foto, mostrar texto indicativo
      page.drawText('Sin foto', {
        x: photoX + boxSize / 2 - 20,
        y: yPosition - boxSize / 2,
        size: 9,
        font,
        color: rgb(0.6, 0.6, 0.6),
      });
    }

    yPosition -= (boxSize + 20); // Ajustar según el nuevo tamaño de las cajas

    const signDate = consent.signedAt || new Date();
    // Reusar el mismo startX calculado arriba
    const dateX = (width - ((boxSize * 2) + 20)) / 2;
    page.drawText(
      `Fecha: ${signDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`,
      {
        x: dateX,
        y: yPosition,
        size: 9,
        font,
        color: rgb(0.5, 0.5, 0.5),
      },
    );
  }

  private wrapText(
    text: string,
    font: any,
    fontSize: number,
    maxWidth: number,
  ): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const width = font.widthOfTextAtSize(testLine, fontSize);

      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private async embedSignature(
    pdfDoc: PDFDocument,
    signatureData: string,
  ): Promise<any> {
    const base64Data = signatureData.replace(/^data:image\/\w+;base64,/, '');
    const imageBytes = Buffer.from(base64Data, 'base64');
    return await pdfDoc.embedPng(imageBytes);
  }

  private async embedPhoto(
    pdfDoc: PDFDocument,
    photoData: string,
  ): Promise<any> {
    const base64Data = photoData.replace(/^data:image\/\w+;base64,/, '');
    const imageBytes = Buffer.from(base64Data, 'base64');
    
    // Detectar el tipo de imagen (JPEG o PNG)
    if (photoData.startsWith('data:image/png')) {
      return await pdfDoc.embedPng(imageBytes);
    } else {
      return await pdfDoc.embedJpg(imageBytes);
    }
  }
}
