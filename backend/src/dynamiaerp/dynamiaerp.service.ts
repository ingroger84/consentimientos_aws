import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as http from 'http';

export interface DynamiaErpInvoiceItem {
  id?: string;
  numero?: string;
  codigo: string;
  referencia?: string;
  nombre: string;
  descripcion: string;
  categoria?: string;
  cantidad: number;
  valorUnitario: number;
  subtotal: number;
  valorImpuesto: number;
  porcentajeImpuesto: number;
  baseImpuesto: number;
  valorDescuento: number;
  porcentajeDescuento: number;
  periodo?: string;
  total: number;
  impuesto: string;
  impuestoIncluido: boolean;
  origen?: string;
  subtotalNeto?: number;
  seriales?: string[];
  excluido?: boolean;
  lote?: string;
  presentacion?: string;
  afectaInventario?: boolean;
}

export interface DynamiaErpCliente {
  identificacion: string;
  tipoId: string;
  nombre1?: string;
  nombre2?: string;
  apellido1?: string;
  apellido2?: string;
  razonSocial: string;
  responsabilidades: string[];
  email: string;
  ciudad: string;
  codigoCiudad: string;
  departamento: string;
  codigoDepartamento: string;
  pais: string;
  codigoPais: string;
  direccion: string;
  barrio?: string;
  telefono: string;
  celular?: string;
  codigoPostal?: string;
  exentoImpuestos?: boolean;
  esquemaImpuesto: string;
}

export interface DynamiaErpTotales {
  subtotal: number;
  total: number;
  totalDescuentos: number;
  totalImpuestos: number;
  totalRetenciones?: number;
  totalBaseGravable: number;
  totalPagable: number;
  totalIVA: number;
  totalImpoconsumo?: number;
  totalICA?: number;
}

export interface DynamiaErpFormaPago {
  id?: number;
  valor: number;
  sucursalId?: number;
  observaciones?: string;
  codigo?: string;
  nombre?: string;
  valorRecibido?: number;
}

export interface DynamiaErpInvoiceRequest {
  id?: string;
  numero: string;
  tipo: string;
  consecutivo: string;
  prefijo: string;
  cufe?: string;
  fecha: string;
  fechaEnvio?: string;
  fechaVencimiento: string;
  sucursal: string;
  centroCosto?: string;
  cliente: DynamiaErpCliente;
  proveedor?: DynamiaErpCliente;
  vendedor?: {
    identificacion?: string;
    nombres?: string;
    apellidos?: string;
    telefono?: string;
    celular?: string;
    email?: string;
    sucursal?: string;
  };
  detalles: DynamiaErpInvoiceItem[];
  totales: DynamiaErpTotales;
  documentoOrigen?: string;
  observaciones: string;
  totalImpuestos?: Array<{
    base: number;
    porcentaje: number;
    tipo: string;
    total: number;
    valor: number;
  }>;
  totalRetenciones?: Array<{
    base: number;
    porcentaje: number;
    tipo: string;
    total: number;
    valor: number;
  }>;
  tipoDoc: string;
  tipoNotaCredito?: string;
  tipoNotaDebito?: string;
  pdf?: string;
  emailsAdicionales?: string[];
  llaveSerie?: string;
  llaveTecnica: string;
  documentoRelacionados?: Array<{
    fecha: string;
    documento: string;
    tipo: string;
    numero: string;
    uuid?: string;
  }>;
  formasPagos?: DynamiaErpFormaPago[];
  procesarPago?: boolean;
  habilitacion?: boolean;
  extra1?: string;
  extra2?: string;
  extra3?: string;
  extra4?: string;
  extra5?: string;
  extra6?: string;
  extra7?: string;
  extra8?: string;
  extra9?: string;
  extra0?: string;
  ordenCompraCliente?: string;
  uuid?: string;
  webhookURL?: string;
  accountId?: number;
  revalidar?: boolean;
  estado?: {
    errores?: string[];
    advertencias?: string[];
    valido?: boolean;
    codigo?: string;
    descripcion?: string;
    mensaje?: string;
    llaveXML?: string;
    nombreArchivoXML?: string;
    id?: string;
    cufe?: string;
    estado?: string;
    estadoEnvio?: string;
    estadoEmail?: string;
    estadoPago?: string;
    fechaEstado?: string;
  };
  resolucion?: {
    tipo?: string;
    prefijo?: string;
    numero?: string;
    fecha?: string;
    fechaInicio?: string;
    fechaFin?: string;
    llaveTecnica?: string;
    llaveExterna?: string;
    desde?: number;
    hasta?: number;
    proveedor?: string;
    proveedorKey?: string;
    testSetId?: string;
    descripcion?: string;
    vencida?: boolean;
  };
  descuentosGlobales?: Array<{
    nombre: string;
    descripcion?: string;
    valor: number;
    porcentaje: number;
    base: number;
  }>;
  periodoFacturacion?: {
    fechaInicial: string;
    fechaFinal: string;
  };
  moneda?: string;
  imprimir?: boolean;
  gatewayKey?: string;
}

export interface DynamiaErpInvoiceResponse {
  success: boolean;
  cufe?: string;
  numero?: string;
  estado?: string;
  valido?: boolean;
  enviada?: boolean;
  id?: string;
  message?: string;
  errores?: string[];
}

@Injectable()
export class DynamiaErpService {
  private readonly logger = new Logger(DynamiaErpService.name);
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly llaveTecnica: string;
  private readonly sucursal: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get('DYNAMIAERP_BASE_URL') || 'api.pos.dynamiaerp.co';
    this.token = this.configService.get('DYNAMIAERP_TOKEN') || 'tk60188bfb066427ba846544a563212d9f70e1acb8a4d52fa22b3cacf2018f90e6';
    this.llaveTecnica = this.configService.get('DYNAMIAERP_LLAVE_TECNICA') || 'b4118824f61b55466c29a0d87f4067299bd77aa7681891fae449aae32657edca';
    this.sucursal = this.configService.get('DYNAMIAERP_SUCURSAL') || 'PRINCIPAL';
  }

  /**
   * Crear factura electrónica en DynamiaERP
   */
  async createElectronicInvoice(invoiceData: DynamiaErpInvoiceRequest): Promise<DynamiaErpInvoiceResponse> {
    this.logger.log(`📤 Enviando factura electrónica a DynamiaERP: ${invoiceData.numero}`);

    try {
      const response = await this.makeRequest('/api/ventas/facturaElectronica', 'POST', invoiceData);

      if (response.statusCode === 200 || response.statusCode === 201) {
        this.logger.log(`✅ Factura electrónica creada exitosamente: ${invoiceData.numero}`);
        if (response.body.cufe) {
          this.logger.log(`   CUFE: ${response.body.cufe}`);
        }
        
        return {
          success: true,
          ...response.body,
        };
      } else if (response.statusCode === 400) {
        this.logger.error(`❌ Error de validación en DynamiaERP para factura ${invoiceData.numero}`);
        this.logger.error(`   Detalles: ${JSON.stringify(response.body)}`);
        
        return {
          success: false,
          message: 'Error de validación',
          errores: response.body.errores || [response.body.message || 'Error desconocido'],
        };
      } else {
        this.logger.error(`❌ Error inesperado de DynamiaERP (${response.statusCode})`);
        this.logger.error(`   Body: ${JSON.stringify(response.body)}`);
        
        return {
          success: false,
          message: `Error ${response.statusCode}: ${response.body?.message || 'Error desconocido'}`,
        };
      }
    } catch (error) {
      this.logger.error(`❌ Error de conexión con DynamiaERP: ${error.message}`);
      return {
        success: false,
        message: `Error de conexión: ${error.message}`,
      };
    }
  }

  /**
   * Verificar estado del emisor de facturas electrónicas
   */
  async checkStatus(): Promise<any> {
    try {
      const response = await this.makeRequest('/api/ventas/facturaElectronica/status', 'GET');
      
      if (response.statusCode === 200) {
        return {
          success: true,
          data: response.body,
        };
      } else {
        return {
          success: false,
          message: `Error ${response.statusCode}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Función auxiliar para hacer requests HTTP a DynamiaERP
   */
  private makeRequest(path: string, method: 'GET' | 'POST' = 'GET', data: any = null): Promise<any> {
    return new Promise((resolve, reject) => {
      const postData = data ? JSON.stringify(data) : null;
      
      const options = {
        hostname: this.baseUrl,
        port: 80,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'tipoVentaToken': this.token, // Token en header tipoVentaToken
          'Accept': 'application/json',
        },
      };

      if (postData) {
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = http.request(options, (res) => {
        let body = '';

        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          try {
            const response = {
              statusCode: res.statusCode,
              headers: res.headers,
              body: body ? JSON.parse(body) : null,
            };
            resolve(response);
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: body,
              parseError: error.message,
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (postData) {
        req.write(postData);
      }

      req.end();
    });
  }
}
