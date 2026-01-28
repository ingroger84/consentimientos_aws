import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';

@Injectable()
export class TemplateRendererService {
  constructor() {
    // Registrar helpers personalizados de Handlebars
    this.registerHelpers();
  }

  /**
   * Renderiza una plantilla con las variables proporcionadas
   */
  render(templateContent: string, variables: Record<string, any>): string {
    try {
      const template = Handlebars.compile(templateContent);
      return template(variables);
    } catch (error) {
      console.error('Error al renderizar plantilla:', error);
      throw new Error(`Error al renderizar plantilla: ${error.message}`);
    }
  }

  /**
   * Renderiza múltiples plantillas con las mismas variables
   */
  renderMultiple(
    templates: Array<{ name: string; content: string }>,
    variables: Record<string, any>,
  ): Array<{ name: string; content: string }> {
    return templates.map((template) => ({
      name: template.name,
      content: this.render(template.content, variables),
    }));
  }

  /**
   * Obtiene las variables disponibles para las plantillas
   */
  getAvailableVariables(): Record<string, string> {
    return {
      clientName: 'Nombre completo del cliente',
      clientId: 'Número de identificación del cliente',
      clientEmail: 'Email del cliente',
      clientPhone: 'Teléfono del cliente',
      clientAddress: 'Dirección del cliente',
      serviceName: 'Nombre del servicio',
      branchName: 'Nombre de la sede',
      branchAddress: 'Dirección de la sede',
      branchPhone: 'Teléfono de la sede',
      branchEmail: 'Email de la sede',
      companyName: 'Nombre de la empresa',
      signDate: 'Fecha de firma',
      signTime: 'Hora de firma',
      currentDate: 'Fecha actual',
      currentYear: 'Año actual',
      procedureName: 'Nombre del procedimiento',
      diagnosisCode: 'Código CIE-10',
      diagnosisDescription: 'Descripción del diagnóstico',
      recordNumber: 'Número de historia clínica',
      admissionDate: 'Fecha de admisión',
    };
  }

  /**
   * Registra helpers personalizados de Handlebars
   */
  private registerHelpers(): void {
    // Helper para formatear fechas
    Handlebars.registerHelper('formatDate', function (date: Date | string) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    });

    // Helper para formatear hora
    Handlebars.registerHelper('formatTime', function (date: Date | string) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      });
    });

    // Helper para uppercase
    Handlebars.registerHelper('uppercase', function (str: string) {
      return str ? str.toUpperCase() : '';
    });

    // Helper para lowercase
    Handlebars.registerHelper('lowercase', function (str: string) {
      return str ? str.toLowerCase() : '';
    });

    // Helper condicional
    Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
      return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    });
  }
}
