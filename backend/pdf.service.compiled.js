"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pdf_lib_1 = require("pdf-lib");
const path = require("path");
const settings_service_1 = require("../settings/settings.service");
const storage_service_1 = require("../common/services/storage.service");
const consent_templates_service_1 = require("../consent-templates/consent-templates.service");
const consent_template_entity_1 = require("../consent-templates/entities/consent-template.entity");
let PdfService = class PdfService {
    constructor(configService, settingsService, storageService, consentTemplatesService) {
        this.configService = configService;
        this.settingsService = settingsService;
        this.storageService = storageService;
        this.consentTemplatesService = consentTemplatesService;
    }
    async generateAllConsentPdfs(consent) {
        const pdfUrl = await this.generateUnifiedConsentPdf(consent);
        return {
            procedurePdfUrl: pdfUrl,
            dataTreatmentPdfUrl: pdfUrl,
            imageRightsPdfUrl: pdfUrl,
        };
    }
    async generateUnifiedConsentPdf(consent) {
        const pdfDoc = await pdf_lib_1.PDFDocument.create();
        const font = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
        const tenantId = consent.tenant?.id;
        const theme = await this.loadPdfTheme(pdfDoc, tenantId);
        const tenantSlug = consent.tenant?.slug;
        const serviceId = consent.service?.id;
        console.log('[PDF Service] Obteniendo plantillas para tenant:', tenantSlug || 'Super Admin');
        console.log('[PDF Service] Servicio del consentimiento:', serviceId);
        if (!serviceId) {
            throw new Error('El consentimiento no tiene un servicio asociado');
        }
        let procedureTemplate;
        let dataTreatmentTemplate;
        let imageRightsTemplate;
        try {
            procedureTemplate = await this.consentTemplatesService.findByTypeAndService(consent_template_entity_1.TemplateType.PROCEDURE, serviceId, tenantSlug);
            console.log('[PDF Service] Plantilla procedure encontrada:', procedureTemplate.name);
        }
        catch (error) {
            console.error('[PDF Service] Error obteniendo plantilla procedure:', error.message);
            throw new Error('No se encontró plantilla de procedimiento para este servicio');
        }
        try {
            dataTreatmentTemplate = await this.consentTemplatesService.findByTypeAndService(consent_template_entity_1.TemplateType.DATA_TREATMENT, serviceId, tenantSlug);
            console.log('[PDF Service] Plantilla data_treatment encontrada:', dataTreatmentTemplate.name);
        }
        catch (error) {
            console.error('[PDF Service] Error obteniendo plantilla data_treatment:', error.message);
            throw new Error('No se encontró plantilla de tratamiento de datos para este servicio');
        }
        try {
            imageRightsTemplate = await this.consentTemplatesService.findByTypeAndService(consent_template_entity_1.TemplateType.IMAGE_RIGHTS, serviceId, tenantSlug);
            console.log('[PDF Service] Plantilla image_rights encontrada:', imageRightsTemplate.name);
        }
        catch (error) {
            console.error('[PDF Service] Error obteniendo plantilla image_rights:', error.message);
            throw new Error('No se encontró plantilla de derechos de imagen para este servicio');
        }
        await this.addProcedureSection(pdfDoc, consent, font, fontBold, theme, procedureTemplate);
        await this.addDataTreatmentSection(pdfDoc, consent, font, fontBold, theme, dataTreatmentTemplate);
        await this.addImageRightsSection(pdfDoc, consent, font, fontBold, theme, imageRightsTemplate);
        const pdfBytes = await pdfDoc.save();
        const fileName = `consent-unified-${consent.id}.pdf`;
        const pdfUrl = await this.storageService.uploadBuffer(Buffer.from(pdfBytes), 'consents', fileName, 'application/pdf');
        return pdfUrl;
    }
    async loadPdfTheme(pdfDoc, tenantId) {
        console.log('[PDF Service] Cargando tema para tenantId:', tenantId || 'Super Admin');
        const settings = await this.settingsService.getSettings(tenantId);
        console.log('[PDF Service] Settings cargados:', {
            companyName: settings.companyName,
            logoUrl: settings.logoUrl,
            tenantId: tenantId || 'null'
        });
        const primaryColor = this.hexToRgb(settings.primaryColor);
        const secondaryColor = this.hexToRgb(settings.secondaryColor);
        const accentColor = this.hexToRgb(settings.accentColor);
        const textColor = this.hexToRgb(settings.textColor);
        const linkColor = this.hexToRgb(settings.linkColor);
        const borderColor = this.hexToRgb(settings.borderColor);
        let logoImage;
        if (settings.logoUrl) {
            try {
                const logoBytes = await this.storageService.downloadFile(settings.logoUrl);
                const ext = path.extname(settings.logoUrl).toLowerCase();
                logoImage = await this.loadImageSafe(pdfDoc, logoBytes, ext);
            }
            catch (error) {
                console.error('Error loading logo for PDF:', error);
            }
        }
        let footerLogoImage;
        if (settings.footerLogoUrl) {
            try {
                const logoBytes = await this.storageService.downloadFile(settings.footerLogoUrl);
                const ext = path.extname(settings.footerLogoUrl).toLowerCase();
                footerLogoImage = await this.loadImageSafe(pdfDoc, logoBytes, ext);
            }
            catch (error) {
                console.error('Error loading footer logo for PDF:', error);
            }
        }
        let watermarkLogoImage;
        if (settings.watermarkLogoUrl) {
            try {
                const logoBytes = await this.storageService.downloadFile(settings.watermarkLogoUrl);
                const ext = path.extname(settings.watermarkLogoUrl).toLowerCase();
                watermarkLogoImage = await this.loadImageSafe(pdfDoc, logoBytes, ext);
            }
            catch (error) {
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
            logoPosition: settings.logoPosition,
            watermarkOpacity: settings.watermarkOpacity,
            footerText: settings.footerText,
            procedureTitle: settings.procedureTitle,
            dataTreatmentTitle: settings.dataTreatmentTitle,
            imageRightsTitle: settings.imageRightsTitle,
        };
    }
    hexToRgb(hex) {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        return { r, g, b };
    }
    removeEmojis(text) {
        return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
    }
    async loadImageSafe(pdfDoc, imageBytes, ext) {
        try {
            if (ext === '.png') {
                return await pdfDoc.embedPng(imageBytes);
            }
            try {
                return await pdfDoc.embedJpg(imageBytes);
            }
            catch (jpgError) {
                console.log('Failed to load as JPG, trying PNG...');
                return await pdfDoc.embedPng(imageBytes);
            }
        }
        catch (error) {
            console.error('Failed to load image:', error);
            return undefined;
        }
    }
    addWatermark(page, theme) {
        if (!theme.watermarkLogoImage)
            return;
        const { width, height } = page.getSize();
        const watermarkSize = Math.min(width, height) * 0.4;
        const imgWidth = theme.watermarkLogoImage.width;
        const imgHeight = theme.watermarkLogoImage.height;
        let drawWidth = watermarkSize;
        let drawHeight = watermarkSize;
        if (imgWidth > imgHeight) {
            drawHeight = (imgHeight / imgWidth) * drawWidth;
        }
        else {
            drawWidth = (imgWidth / imgHeight) * drawHeight;
        }
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
    addFooter(page, font, theme) {
        const { width, height } = page.getSize();
        const margin = 50;
        const footerY = 40;
        page.drawLine({
            start: { x: margin, y: footerY + 25 },
            end: { x: width - margin, y: footerY + 25 },
            thickness: 0.5,
            color: (0, pdf_lib_1.rgb)(theme.borderColor.r, theme.borderColor.g, theme.borderColor.b),
        });
        if (theme.footerLogoImage) {
            const logoSize = 25;
            const imgWidth = theme.footerLogoImage.width;
            const imgHeight = theme.footerLogoImage.height;
            let drawWidth = logoSize;
            let drawHeight = logoSize;
            if (imgWidth > imgHeight) {
                drawHeight = (imgHeight / imgWidth) * drawWidth;
            }
            else {
                drawWidth = (imgWidth / imgHeight) * drawHeight;
            }
            page.drawImage(theme.footerLogoImage, {
                x: margin,
                y: footerY,
                width: drawWidth,
                height: drawHeight,
            });
        }
        const contactX = theme.footerLogoImage ? margin + 35 : margin;
        let currentY = footerY + 15;
        if (theme.companyAddress) {
            const addressText = this.removeEmojis(`Direccion: ${theme.companyAddress}`);
            const maxWidth = width - contactX - margin - 100;
            const addressLines = this.wrapText(addressText, font, 7, maxWidth);
            page.drawText(addressLines[0], {
                x: contactX,
                y: currentY,
                size: 7,
                font,
                color: (0, pdf_lib_1.rgb)(theme.textColor.r, theme.textColor.g, theme.textColor.b),
            });
            currentY -= 9;
        }
        const contactInfo = [];
        if (theme.companyPhone)
            contactInfo.push(this.removeEmojis(`Tel: ${theme.companyPhone}`));
        if (theme.companyEmail)
            contactInfo.push(this.removeEmojis(`Email: ${theme.companyEmail}`));
        if (theme.companyWebsite)
            contactInfo.push(this.removeEmojis(`Web: ${theme.companyWebsite}`));
        if (contactInfo.length > 0) {
            const contactText = contactInfo.join('  |  ');
            const maxWidth = width - contactX - margin - 100;
            const contactLines = this.wrapText(contactText, font, 7, maxWidth);
            page.drawText(contactLines[0], {
                x: contactX,
                y: currentY,
                size: 7,
                font,
                color: (0, pdf_lib_1.rgb)(theme.textColor.r, theme.textColor.g, theme.textColor.b),
            });
        }
        if (theme.footerText) {
            const cleanFooterText = this.removeEmojis(theme.footerText);
            const maxWidth = 200;
            const footerLines = this.wrapText(cleanFooterText, font, 7, maxWidth);
            const textWidth = font.widthOfTextAtSize(footerLines[0], 7);
            page.drawText(footerLines[0], {
                x: width - margin - textWidth,
                y: footerY + 10,
                size: 7,
                font,
                color: (0, pdf_lib_1.rgb)(theme.textColor.r, theme.textColor.g, theme.textColor.b),
            });
        }
    }
    async addProcedureSection(pdfDoc, consent, font, fontBold, theme, template) {
        let page = pdfDoc.addPage([595, 842]);
        const { width, height } = page.getSize();
        let yPosition = height - 50;
        const margin = 50;
        const contentWidth = width - (margin * 2);
        this.addWatermark(page, theme);
        page.drawRectangle({
            x: 0,
            y: height - 100,
            width: width,
            height: 100,
            color: (0, pdf_lib_1.rgb)(theme.primaryColor.r, theme.primaryColor.g, theme.primaryColor.b),
        });
        let logoX = margin;
        if (theme.logoImage) {
            const logoSize = theme.logoSize;
            const imgWidth = theme.logoImage.width;
            const imgHeight = theme.logoImage.height;
            let drawWidth = logoSize;
            let drawHeight = logoSize;
            if (imgWidth > imgHeight) {
                drawHeight = (imgHeight / imgWidth) * drawWidth;
            }
            else {
                drawWidth = (imgWidth / imgHeight) * drawHeight;
            }
            if (theme.logoPosition === 'center') {
                logoX = (width - drawWidth) / 2;
            }
            else if (theme.logoPosition === 'right') {
                logoX = width - margin - drawWidth;
            }
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
        const titleX = theme.logoImage && theme.logoPosition === 'left' ? margin + theme.logoSize + 20 : margin;
        page.drawText(theme.companyName.toUpperCase(), {
            x: titleX,
            y: height - 40,
            size: 10,
            font: fontBold,
            color: (0, pdf_lib_1.rgb)(1, 1, 1),
        });
        page.drawText(theme.procedureTitle, {
            x: titleX,
            y: height - 60,
            size: 14,
            font: fontBold,
            color: (0, pdf_lib_1.rgb)(1, 1, 1),
        });
        yPosition = height - 120;
        page.drawRectangle({
            x: margin,
            y: yPosition - 40,
            width: contentWidth,
            height: 40,
            color: (0, pdf_lib_1.rgb)(0.95, 0.95, 0.95),
            borderColor: (0, pdf_lib_1.rgb)(theme.borderColor.r, theme.borderColor.g, theme.borderColor.b),
            borderWidth: 1,
        });
        page.drawText(`SERVICIO: ${consent.service.name.toUpperCase()}`, {
            x: margin + 10,
            y: yPosition - 25,
            size: 12,
            font: fontBold,
            color: (0, pdf_lib_1.rgb)(theme.textColor.r, theme.textColor.g, theme.textColor.b),
        });
        yPosition -= 60;
        page.drawText('INFORMACIÓN DEL CLIENTE', {
            x: margin,
            y: yPosition,
            size: 14,
            font: fontBold,
            color: (0, pdf_lib_1.rgb)(theme.accentColor.r, theme.accentColor.g, theme.accentColor.b),
        });
        yPosition -= 5;
        page.drawLine({
            start: { x: margin, y: yPosition },
            end: { x: width - margin, y: yPosition },
            thickness: 2,
            color: (0, pdf_lib_1.rgb)(theme.accentColor.r, theme.accentColor.g, theme.accentColor.b),
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
                color: (0, pdf_lib_1.rgb)(theme.textColor.r, theme.textColor.g, theme.textColor.b),
            });
            page.drawText(info.value, {
                x: margin + 120,
                y: yPosition,
                size: 10,
                font,
                color: (0, pdf_lib_1.rgb)(theme.textColor.r, theme.textColor.g, theme.textColor.b),
            });
            yPosition -= 18;
        }
        yPosition -= 15;
        let currentPage = page;
        if (consent.answers && consent.answers.length > 0) {
            currentPage.drawText('PREGUNTAS Y RESPUESTAS', {
                x: margin,
                y: yPosition,
                size: 14,
                font: fontBold,
                color: (0, pdf_lib_1.rgb)(theme.accentColor.r, theme.accentColor.g, theme.accentColor.b),
            });
            yPosition -= 5;
            currentPage.drawLine({
                start: { x: margin, y: yPosition },
                end: { x: width - margin, y: yPosition },
                thickness: 2,
                color: (0, pdf_lib_1.rgb)(theme.accentColor.r, theme.accentColor.g, theme.accentColor.b),
            });
            yPosition -= 25;
            for (const answer of consent.answers) {
                if (yPosition < 180) {
                    this.addFooter(currentPage, font, theme);
                    currentPage = pdfDoc.addPage([595, 842]);
                    this.addWatermark(currentPage, theme);
                    yPosition = height - 50;
                }
                const questionLines = this.wrapText(answer.question.questionText, font, 10, contentWidth - 20);
                for (const line of questionLines) {
                    if (yPosition < 180) {
                        this.addFooter(currentPage, font, theme);
                        currentPage = pdfDoc.addPage([595, 842]);
                        this.addWatermark(currentPage, theme);
                        yPosition = height - 50;
                    }
                    currentPage.drawText(line, {
                        x: margin + 5,
                        y: yPosition,
                        size: 10,
                        font: fontBold,
                        color: (0, pdf_lib_1.rgb)(theme.textColor.r, theme.textColor.g, theme.textColor.b),
                    });
                    yPosition -= 15;
                }
                const answerText = `Respuesta: ${answer.value}`;
                const answerLines = this.wrapText(answerText, font, 10, contentWidth - 20);
                for (const line of answerLines) {
                    if (yPosition < 180) {
                        this.addFooter(currentPage, font, theme);
                        currentPage = pdfDoc.addPage([595, 842]);
                        this.addWatermark(currentPage, theme);
                        yPosition = height - 50;
                    }
                    currentPage.drawText(line, {
                        x: margin + 10,
                        y: yPosition,
                        size: 10,
                        font,
                        color: (0, pdf_lib_1.rgb)(theme.textColor.r, theme.textColor.g, theme.textColor.b),
                    });
                    yPosition -= 15;
                }
                yPosition -= 5;
            }
        }
        page = currentPage;
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
            color: (0, pdf_lib_1.rgb)(theme.accentColor.r, theme.accentColor.g, theme.accentColor.b),
        });
        yPosition -= 5;
        page.drawLine({
            start: { x: margin, y: yPosition },
            end: { x: width - margin, y: yPosition },
            thickness: 2,
            color: (0, pdf_lib_1.rgb)(theme.accentColor.r, theme.accentColor.g, theme.accentColor.b),
        });
        yPosition -= 25;
        const templateContent = this.replaceTemplateVariables(template.content, {
            clientName: consent.clientName,
            clientId: consent.clientId,
            clientEmail: consent.clientEmail,
            clientPhone: consent.clientPhone || 'N/A',
            serviceName: consent.service.name,
            branchName: consent.branch.name,
            branchAddress: consent.branch.address || 'N/A',
            branchPhone: consent.branch.phone || 'N/A',
            branchEmail: consent.branch.email || 'N/A',
            companyName: theme.companyName,
            signDate: consent.signedAt ? consent.signedAt.toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES'),
            signTime: consent.signedAt ? consent.signedAt.toLocaleTimeString('es-ES') : new Date().toLocaleTimeString('es-ES'),
            currentDate: new Date().toLocaleDateString('es-ES'),
            currentYear: new Date().getFullYear().toString(),
        });
        console.log('[PDF Service] Usando plantilla:', template.name);
        console.log('[PDF Service] Contenido procesado (primeros 200 chars):', templateContent.substring(0, 200));
        const contentLines = templateContent.split('\n');
        for (const line of contentLines) {
            if (!line.trim()) {
                yPosition -= 10;
                continue;
            }
            const wrappedLines = this.wrapText(line, font, 10, contentWidth);
            for (const wrappedLine of wrappedLines) {
                if (yPosition < 180) {
                    this.addFooter(page, font, theme);
                    page = pdfDoc.addPage([595, 842]);
                    this.addWatermark(page, theme);
                    yPosition = height - 50;
                }
                page.drawText(wrappedLine, {
                    x: margin,
                    y: yPosition,
                    size: 10,
                    font,
                    color: (0, pdf_lib_1.rgb)(theme.textColor.r, theme.textColor.g, theme.textColor.b),
                });
                yPosition -= 15;
            }
        }
        yPosition -= 20;
        const signatureSpaceNeeded = 150;
        const footerSpace = 80;
        const minSpaceForSignature = signatureSpaceNeeded + footerSpace;
        if (yPosition < minSpaceForSignature) {
            this.addFooter(page, font, theme);
            page = pdfDoc.addPage([595, 842]);
            this.addWatermark(page, theme);
            yPosition = height - 50;
        }
        await this.addSignatureSection(pdfDoc, page, consent, font, fontBold, margin, yPosition, theme);
        this.addFooter(page, font, theme);
    }
    async addDataTreatmentSection(pdfDoc, consent, font, fontBold, theme, template) {
        const page = pdfDoc.addPage([595, 842]);
        const { width, height } = page.getSize();
        let yPosition = height - 50;
        const margin = 50;
        this.addWatermark(page, theme);
        page.drawRectangle({
            x: 0,
            y: height - 100,
            width: width,
            height: 100,
            color: (0, pdf_lib_1.rgb)(theme.primaryColor.r, theme.primaryColor.g, theme.primaryColor.b),
        });
        let logoX = margin;
        if (theme.logoImage) {
            const logoSize = theme.logoSize;
            const imgWidth = theme.logoImage.width;
            const imgHeight = theme.logoImage.height;
            let drawWidth = logoSize;
            let drawHeight = logoSize;
            if (imgWidth > imgHeight) {
                drawHeight = (imgHeight / imgWidth) * drawWidth;
            }
            else {
                drawWidth = (imgWidth / imgHeight) * drawHeight;
            }
            if (theme.logoPosition === 'center') {
                logoX = (width - drawWidth) / 2;
            }
            else if (theme.logoPosition === 'right') {
                logoX = width - margin - drawWidth;
            }
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
        const titleX = theme.logoImage && theme.logoPosition === 'left' ? margin + theme.logoSize + 20 : margin;
        page.drawText(theme.companyName.toUpperCase(), {
            x: titleX,
            y: height - 40,
            size: 10,
            font: fontBold,
            color: (0, pdf_lib_1.rgb)(1, 1, 1),
        });
        const titleLines = this.wrapText(theme.dataTreatmentTitle, fontBold, 14, width - titleX - margin);
        let titleY = height - 60;
        for (const line of titleLines.slice(0, 2)) {
            page.drawText(line, {
                x: titleX,
                y: titleY,
                size: 14,
                font: fontBold,
                color: (0, pdf_lib_1.rgb)(1, 1, 1),
            });
            titleY -= 15;
        }
        yPosition = height - 120;
        const templateContent = this.replaceTemplateVariables(template.content, {
            clientName: consent.clientName,
            clientId: consent.clientId,
            clientEmail: consent.clientEmail,
            clientPhone: consent.clientPhone || 'N/A',
            serviceName: consent.service.name,
            branchName: consent.branch.name,
            branchAddress: consent.branch.address || 'N/A',
            branchPhone: consent.branch.phone || 'N/A',
            branchEmail: consent.branch.email || 'N/A',
            companyName: theme.companyName,
            signDate: consent.signedAt ? consent.signedAt.toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES'),
            signTime: consent.signedAt ? consent.signedAt.toLocaleTimeString('es-ES') : new Date().toLocaleTimeString('es-ES'),
            currentDate: new Date().toLocaleDateString('es-ES'),
            currentYear: new Date().getFullYear().toString(),
        });
        console.log('[PDF Service] Usando plantilla data_treatment:', template.name);
        const contentLines = templateContent.split('\n');
        const contentWidth = width - (margin * 2);
        let currentPage = page;
        for (const line of contentLines) {
            if (!line.trim()) {
                yPosition -= 10;
                continue;
            }
            const wrappedLines = this.wrapText(line, font, 10, contentWidth);
            for (const wrappedLine of wrappedLines) {
                if (yPosition < 180) {
                    this.addFooter(currentPage, font, theme);
                    currentPage = pdfDoc.addPage([595, 842]);
                    this.addWatermark(currentPage, theme);
                    yPosition = height - 50;
                }
                currentPage.drawText(wrappedLine, {
                    x: margin,
                    y: yPosition,
                    size: 10,
                    font,
                    color: (0, pdf_lib_1.rgb)(theme.textColor.r, theme.textColor.g, theme.textColor.b),
                });
                yPosition -= 15;
            }
        }
        yPosition -= 20;
        if (yPosition < 180) {
            this.addFooter(currentPage, font, theme);
            currentPage = pdfDoc.addPage([595, 842]);
            this.addWatermark(currentPage, theme);
            yPosition = height - 50;
        }
        currentPage.drawText('TITULAR DE LOS DATOS', {
            x: margin,
            y: yPosition,
            size: 12,
            font: fontBold,
            color: (0, pdf_lib_1.rgb)(theme.accentColor.r, theme.accentColor.g, theme.accentColor.b),
        });
        yPosition -= 25;
        const clientInfo = [
            { label: 'Nombre Completo:', value: consent.clientName },
            { label: 'C.C. No.:', value: consent.clientId },
            { label: 'Correo electrónico:', value: consent.clientEmail },
        ];
        for (const info of clientInfo) {
            if (yPosition < 180) {
                this.addFooter(currentPage, font, theme);
                currentPage = pdfDoc.addPage([595, 842]);
                this.addWatermark(currentPage, theme);
                yPosition = height - 50;
            }
            currentPage.drawText(info.label, {
                x: margin,
                y: yPosition,
                size: 10,
                font: fontBold,
                color: (0, pdf_lib_1.rgb)(theme.textColor.r, theme.textColor.g, theme.textColor.b),
            });
            currentPage.drawText(info.value, {
                x: margin + 120,
                y: yPosition,
                size: 10,
                font,
                color: (0, pdf_lib_1.rgb)(theme.textColor.r, theme.textColor.g, theme.textColor.b),
            });
            yPosition -= 18;
        }
        yPosition -= 10;
        const signatureSpaceNeeded = 150;
        const footerSpace = 80;
        const minSpaceForSignature = signatureSpaceNeeded + footerSpace;
        let signaturePage = currentPage;
        if (yPosition < minSpaceForSignature) {
            this.addFooter(currentPage, font, theme);
            signaturePage = pdfDoc.addPage([595, 842]);
            this.addWatermark(signaturePage, theme);
            yPosition = height - 50;
        }
        await this.addSignatureSection(pdfDoc, signaturePage, consent, font, fontBold, margin, yPosition, theme);
        this.addFooter(signaturePage, font, theme);
    }
    async addImageRightsSection(pdfDoc, consent, font, fontBold, theme, template) {
        const page = pdfDoc.addPage([595, 842]);
        const { width, height } = page.getSize();
        let yPosition = height - 50;
        const margin = 50;
        this.addWatermark(page, theme);
        page.drawRectangle({
            x: 0,
            y: height - 100,
            width: width,
            height: 100,
            color: (0, pdf_lib_1.rgb)(theme.primaryColor.r, theme.primaryColor.g, theme.primaryColor.b),
        });
        let logoX = margin;
        if (theme.logoImage) {
            const logoSize = theme.logoSize;
            const imgWidth = theme.logoImage.width;
            const imgHeight = theme.logoImage.height;
            let drawWidth = logoSize;
            let drawHeight = logoSize;
            if (imgWidth > imgHeight) {
                drawHeight = (imgHeight / imgWidth) * drawWidth;
            }
            else {
                drawWidth = (imgWidth / imgHeight) * drawHeight;
            }
            if (theme.logoPosition === 'center') {
                logoX = (width - drawWidth) / 2;
            }
            else if (theme.logoPosition === 'right') {
                logoX = width - margin - drawWidth;
            }
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
        const titleX = theme.logoImage && theme.logoPosition === 'left' ? margin + theme.logoSize + 20 : margin;
        page.drawText(theme.companyName.toUpperCase(), {
            x: titleX,
            y: height - 40,
            size: 10,
            font: fontBold,
            color: (0, pdf_lib_1.rgb)(1, 1, 1),
        });
        const titleLines = this.wrapText(theme.imageRightsTitle, fontBold, 14, width - titleX - margin);
        let titleY = height - 60;
        for (const line of titleLines.slice(0, 2)) {
            page.drawText(line, {
                x: titleX,
                y: titleY,
                size: 14,
                font: fontBold,
                color: (0, pdf_lib_1.rgb)(1, 1, 1),
            });
            titleY -= 15;
        }
        yPosition = height - 120;
        const templateContent = this.replaceTemplateVariables(template.content, {
            clientName: consent.clientName,
            clientId: consent.clientId,
            clientEmail: consent.clientEmail,
            clientPhone: consent.clientPhone || 'N/A',
            serviceName: consent.service.name,
            branchName: consent.branch.name,
            branchAddress: consent.branch.address || 'N/A',
            branchPhone: consent.branch.phone || 'N/A',
            branchEmail: consent.branch.email || 'N/A',
            companyName: theme.companyName,
            signDate: consent.signedAt ? consent.signedAt.toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES'),
            signTime: consent.signedAt ? consent.signedAt.toLocaleTimeString('es-ES') : new Date().toLocaleTimeString('es-ES'),
            currentDate: new Date().toLocaleDateString('es-ES'),
            currentYear: new Date().getFullYear().toString(),
        });
        console.log('[PDF Service] Usando plantilla image_rights:', template.name);
        const contentLines = templateContent.split('\n');
        const contentWidth = width - (margin * 2);
        let currentPage = page;
        for (const line of contentLines) {
            if (!line.trim()) {
                yPosition -= 10;
                continue;
            }
            const wrappedLines = this.wrapText(line, font, 10, contentWidth);
            for (const wrappedLine of wrappedLines) {
                if (yPosition < 180) {
                    this.addFooter(currentPage, font, theme);
                    currentPage = pdfDoc.addPage([595, 842]);
                    this.addWatermark(currentPage, theme);
                    yPosition = height - 50;
                }
                currentPage.drawText(wrappedLine, {
                    x: margin,
                    y: yPosition,
                    size: 10,
                    font,
                    color: (0, pdf_lib_1.rgb)(theme.textColor.r, theme.textColor.g, theme.textColor.b),
                });
                yPosition -= 15;
            }
        }
        yPosition -= 20;
        if (yPosition < 180) {
            this.addFooter(currentPage, font, theme);
            currentPage = pdfDoc.addPage([595, 842]);
            this.addWatermark(currentPage, theme);
            yPosition = height - 50;
        }
        currentPage.drawText('TITULAR DE LOS DATOS', {
            x: margin,
            y: yPosition,
            size: 12,
            font: fontBold,
            color: (0, pdf_lib_1.rgb)(theme.accentColor.r, theme.accentColor.g, theme.accentColor.b),
        });
        yPosition -= 25;
        const clientInfo = [
            { label: 'Nombre Completo:', value: consent.clientName },
            { label: 'C.C. No.:', value: consent.clientId },
            { label: 'Correo electrónico:', value: consent.clientEmail },
        ];
        for (const info of clientInfo) {
            if (yPosition < 180) {
                this.addFooter(currentPage, font, theme);
                currentPage = pdfDoc.addPage([595, 842]);
                this.addWatermark(currentPage, theme);
                yPosition = height - 50;
            }
            currentPage.drawText(info.label, {
                x: margin,
                y: yPosition,
                size: 10,
                font: fontBold,
                color: (0, pdf_lib_1.rgb)(theme.textColor.r, theme.textColor.g, theme.textColor.b),
            });
            currentPage.drawText(info.value, {
                x: margin + 120,
                y: yPosition,
                size: 10,
                font,
                color: (0, pdf_lib_1.rgb)(theme.textColor.r, theme.textColor.g, theme.textColor.b),
            });
            yPosition -= 18;
        }
        yPosition -= 10;
        const signatureSpaceNeeded = 150;
        const footerSpace = 80;
        const minSpaceForSignature = signatureSpaceNeeded + footerSpace;
        let signaturePage = currentPage;
        if (yPosition < minSpaceForSignature) {
            this.addFooter(currentPage, font, theme);
            signaturePage = pdfDoc.addPage([595, 842]);
            this.addWatermark(signaturePage, theme);
            yPosition = height - 50;
        }
        await this.addSignatureSection(pdfDoc, signaturePage, consent, font, fontBold, margin, yPosition, theme);
        this.addFooter(signaturePage, font, theme);
    }
    async addSignatureSection(pdfDoc, page, consent, font, fontBold, margin, yPosition, theme) {
        const { width } = page.getSize();
        const boxSize = 100;
        const spacing = 20;
        const totalWidth = (boxSize * 2) + spacing;
        const startX = (width - totalWidth) / 2;
        page.drawText('Firma:', {
            x: startX,
            y: yPosition,
            size: 10,
            font: fontBold,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        yPosition -= 10;
        page.drawRectangle({
            x: startX,
            y: yPosition - boxSize,
            width: boxSize,
            height: boxSize,
            borderColor: (0, pdf_lib_1.rgb)(0.5, 0.5, 0.5),
            borderWidth: 1,
        });
        if (consent.signatureData) {
            try {
                const signatureImage = await this.embedSignature(pdfDoc, consent.signatureData);
                const imgWidth = signatureImage.width;
                const imgHeight = signatureImage.height;
                let drawWidth = boxSize - 10;
                let drawHeight = boxSize - 10;
                if (imgWidth > imgHeight) {
                    drawHeight = (imgHeight / imgWidth) * drawWidth;
                }
                else {
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
            }
            catch (error) {
                console.error('Error embedding signature:', error);
            }
        }
        const photoX = startX + boxSize + spacing;
        page.drawText('Foto del Cliente:', {
            x: photoX,
            y: yPosition + 10,
            size: 10,
            font: fontBold,
            color: (0, pdf_lib_1.rgb)(0, 0, 0),
        });
        page.drawRectangle({
            x: photoX,
            y: yPosition - boxSize,
            width: boxSize,
            height: boxSize,
            borderColor: (0, pdf_lib_1.rgb)(0.5, 0.5, 0.5),
            borderWidth: 1,
        });
        if (consent.clientPhoto) {
            try {
                const photoImage = await this.embedPhoto(pdfDoc, consent.clientPhoto);
                const imgWidth = photoImage.width;
                const imgHeight = photoImage.height;
                let drawWidth = boxSize - 10;
                let drawHeight = boxSize - 10;
                if (imgWidth > imgHeight) {
                    drawHeight = (imgHeight / imgWidth) * drawWidth;
                }
                else {
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
            }
            catch (error) {
                console.error('Error embedding client photo:', error);
                page.drawText('Sin foto', {
                    x: photoX + boxSize / 2 - 20,
                    y: yPosition - boxSize / 2,
                    size: 9,
                    font,
                    color: (0, pdf_lib_1.rgb)(0.6, 0.6, 0.6),
                });
            }
        }
        else {
            page.drawText('Sin foto', {
                x: photoX + boxSize / 2 - 20,
                y: yPosition - boxSize / 2,
                size: 9,
                font,
                color: (0, pdf_lib_1.rgb)(0.6, 0.6, 0.6),
            });
        }
        yPosition -= (boxSize + 20);
        const signDate = consent.signedAt || new Date();
        const dateX = (width - ((boxSize * 2) + 20)) / 2;
        page.drawText(`Fecha: ${signDate.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })}`, {
            x: dateX,
            y: yPosition,
            size: 9,
            font,
            color: (0, pdf_lib_1.rgb)(0.5, 0.5, 0.5),
        });
    }
    wrapText(text, font, fontSize, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const width = font.widthOfTextAtSize(testLine, fontSize);
            if (width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            }
            else {
                currentLine = testLine;
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }
        return lines;
    }
    replaceTemplateVariables(content, variables) {
        let result = content;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(regex, value || '');
        }
        return result;
    }
    async embedSignature(pdfDoc, signatureData) {
        const base64Data = signatureData.replace(/^data:image\/\w+;base64,/, '');
        const imageBytes = Buffer.from(base64Data, 'base64');
        return await pdfDoc.embedPng(imageBytes);
    }
    async embedPhoto(pdfDoc, photoData) {
        const base64Data = photoData.replace(/^data:image\/\w+;base64,/, '');
        const imageBytes = Buffer.from(base64Data, 'base64');
        if (photoData.startsWith('data:image/png')) {
            return await pdfDoc.embedPng(imageBytes);
        }
        else {
            return await pdfDoc.embedJpg(imageBytes);
        }
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => consent_templates_service_1.ConsentTemplatesService))),
    __metadata("design:paramtypes", [config_1.ConfigService,
        settings_service_1.SettingsService,
        storage_service_1.StorageService,
        consent_templates_service_1.ConsentTemplatesService])
], PdfService);
//# sourceMappingURL=pdf.service.js.map