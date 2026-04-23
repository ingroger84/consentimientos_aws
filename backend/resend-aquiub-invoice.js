const { DataSource } = require('typeorm');
const http = require('http');
require('dotenv').config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: false,
});

// Configuración de DynamiaERP
const DYNAMIAERP_BASE_URL = process.env.DYNAMIAERP_BASE_URL || 'api.pos.dynamiaerp.co';
const DYNAMIAERP_TOKEN = process.env.DYNAMIAERP_TOKEN || 'be4c7acbeede150ed0cc1b6a02506e55';
const DYNAMIAERP_LLAVE_TECNICA = process.env.DYNAMIAERP_LLAVE_TECNICA || 'b4118824f61b55466c29a0d87f4067299bd77aa7681891fae449aae32657edca';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: DYNAMIAERP_BASE_URL,
      port: 80,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'tipoVentaToken': DYNAMIAERP_TOKEN,
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

async function resendAquiubInvoice() {
  try {
    console.log('🔍 Conectando a la base de datos...\n');
    await AppDataSource.initialize();

    const invoiceNumber = 'INV-202604-3740';

    // Buscar la factura de Aquiub
    const invoices = await AppDataSource.query(`
      SELECT 
        i.*,
        t.name as tenant_name,
        t."contactEmail" as tenant_email,
        t.document_number as tenant_document,
        t."contactPhone" as tenant_phone,
        t.plan as tenant_plan
      FROM invoices i
      LEFT JOIN tenants t ON i."tenantId" = t.id
      WHERE i."invoiceNumber" = $1
    `, [invoiceNumber]);

    if (invoices.length === 0) {
      console.log(`❌ No se encontró la factura ${invoiceNumber}`);
      await AppDataSource.destroy();
      return;
    }

    const invoice = invoices[0];

    // Obtener datos del pago
    const payments = await AppDataSource.query(`
      SELECT *
      FROM payments
      WHERE "invoiceId" = $1
      ORDER BY "createdAt" DESC
      LIMIT 1
    `, [invoice.id]);

    const payment = payments.length > 0 ? payments[0] : null;

    console.log('📄 FACTURA AQUIUB:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   Número original: ${invoice.invoiceNumber}`);
    console.log(`   Tenant: ${invoice.tenant_name}`);
    console.log(`   NIT: ${invoice.tenant_document}`);
    console.log(`   Estado: ${invoice.status}`);
    console.log(`   Monto: $${invoice.amount.toLocaleString('es-CO')}`);
    console.log(`   IVA: $${invoice.tax.toLocaleString('es-CO')}`);
    console.log(`   Total: $${invoice.total.toLocaleString('es-CO')}`);
    console.log(`   Creada: ${new Date(invoice.createdAt).toLocaleString('es-CO')}`);
    console.log(`   Vencimiento: ${new Date(invoice.dueDate).toLocaleString('es-CO')}`);
    console.log(`   Pagada: ${invoice.paidAt ? new Date(invoice.paidAt).toLocaleString('es-CO') : 'N/A'}`);
    
    if (payment) {
      console.log(`\n💳 DATOS DEL PAGO:`);
      console.log(`   Método: ${payment.paymentMethod || 'Efectivo'}`);
      console.log(`   Gateway: ${payment.gateway || 'Bold'}`);
      console.log(`   Monto: $${payment.amount.toLocaleString('es-CO')}`);
      console.log(`   Fecha pago: ${new Date(payment.createdAt).toLocaleString('es-CO')}`);
      console.log(`   Estado: ${payment.status}`);
    }
    console.log('');

    // Verificar que esté pagada
    if (invoice.status !== 'paid') {
      console.log(`❌ La factura no está pagada (estado: ${invoice.status})`);
      await AppDataSource.destroy();
      return;
    }

    console.log('📤 Preparando factura para DynamiaERP...\n');

    // Cambiar formato: INV-202604-3740 → 001-202604-3740
    const formattedInvoiceNumber = invoice.invoiceNumber.replace('INV-', '001-');

    console.log(`   ✅ Número para DynamiaERP: ${formattedInvoiceNumber}`);
    console.log(`   ✅ Sucursal: 001`);
    console.log(`   ✅ Observaciones: LINK DE PAGO`);
    console.log(`   ✅ Nombre producto: LINK DE PAGO`);
    console.log('');

    // Formatear fechas en formato "YYYY-MM-DD HH:mm:ss"
    const formatDate = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // Obtener items de la factura
    const items = invoice.items || [];

    // Determinar forma de pago según el método de Bold
    let formaPagoCode = 'EF'; // Efectivo por defecto
    
    if (payment) {
      const boldMethod = (payment.boldPaymentMethod || payment.paymentMethod || '').toLowerCase();
      
      if (boldMethod.includes('pse')) {
        formaPagoCode = 'PS'; // PSE
        console.log(`   ✅ Forma de pago: PSE (${payment.boldPaymentMethod || payment.paymentMethod})`);
      } else if (boldMethod.includes('card') || boldMethod.includes('tarjeta') || boldMethod.includes('credit') || boldMethod.includes('debit')) {
        formaPagoCode = 'TC'; // Tarjeta de crédito
        console.log(`   ✅ Forma de pago: Tarjeta (${payment.boldPaymentMethod || payment.paymentMethod})`);
      } else if (boldMethod.includes('transfer') || boldMethod.includes('transferencia')) {
        formaPagoCode = 'TR'; // Transferencia
        console.log(`   ✅ Forma de pago: Transferencia (${payment.boldPaymentMethod || payment.paymentMethod})`);
      } else {
        console.log(`   ✅ Forma de pago: Efectivo (default) - Original: ${payment.boldPaymentMethod || payment.paymentMethod}`);
      }
    } else {
      console.log(`   ⚠️ No se encontró payment asociado, usando Efectivo por defecto`);
    }

    // Determinar tipo de documento y ajustar datos del cliente
    const tipoId = '31'; // NIT para Aquiub
    const isNIT = tipoId === '31';

    // Preparar datos para DynamiaERP
    const dynamiaErpInvoice = {
      tipo: 'REMISION',
      numero: formattedInvoiceNumber, // 001-202604-3740
      fecha: formatDate(invoice.paidAt || invoice.createdAt),
      fechaEnvio: formatDate(invoice.paidAt || invoice.createdAt),
      fechaVencimiento: formatDate(invoice.dueDate),
      pdf: 'none',
      procesarPago: false,
      sucursal: '001',
      observaciones: 'LINK DE PAGO',
      cliente: {
        identificacion: invoice.tenant_document,
        tipoId: tipoId,
        nombre1: 'AQUIUB',
        nombre2: '',
        apellido1: 'CASA',
        apellido2: 'PESTAÑAS',
        razonSocial: isNIT ? invoice.tenant_name : '', // Solo para NIT, vacío para Cédula
        email: invoice.tenant_email,
        telefono: invoice.tenant_phone || '3000000000',
        celular: invoice.tenant_phone || '',
        direccion: 'Dirección no especificada',
        ciudad: 'BARRANQUILLA',
        codigoCiudad: '08001',
        departamento: 'ATLANTICO',
        codigoDepartamento: '08',
        pais: 'Colombia',
        codigoPais: 'CO',
        barrio: 'BARRANQUILLA',
        responsabilidades: ['O-13'],
        esquemaImpuesto: 'IVA',
      },
      detalles: items.map((item, index) => ({
        codigo: `PLAN-${invoice.tenant_plan.toUpperCase()}`,
        nombre: 'LINK DE PAGO',
        descripcion: item.description,
        cantidad: parseFloat(item.quantity),
        valorUnitario: parseFloat(item.unitPrice),
        subtotal: parseFloat(item.total),
        valorImpuesto: 0,
        porcentajeImpuesto: 0,
        baseImpuesto: parseFloat(item.total),
        valorDescuento: 0,
        porcentajeDescuento: 0,
        total: parseFloat(item.total),
        impuesto: 'IVA',
        numero: String(index + 1),
        excluido: true,
        impuestoIncluido: true,
        afectaInventario: false,
      })),
      totales: {
        subtotal: parseFloat(invoice.amount),
        totalImpuestos: 0,
        totalDescuentos: 0,
        total: parseFloat(invoice.total),
        totalPagable: parseFloat(invoice.total),
        totalIVA: 0,
        totalBaseGravable: 0,
      },
      formasPagos: [{
        codigo: formaPagoCode,
        valor: parseFloat(invoice.total),
      }],
    };

    console.log('📋 DATOS PARA DYNAMIAERP:');
    console.log(JSON.stringify(dynamiaErpInvoice, null, 2));
    console.log('');

    console.log('📤 Enviando a DynamiaERP...\n');

    const response = await makeRequest('/api/ventas/facturaElectronica', 'POST', dynamiaErpInvoice);

    console.log(`📊 Respuesta de DynamiaERP (Status: ${response.statusCode}):`);
    console.log(JSON.stringify(response.body, null, 2));
    console.log('');

    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log('✅ Factura enviada exitosamente a DynamiaERP');
      
      if (response.body.cufe || response.body.valido) {
        console.log(`   CUFE: ${response.body.cufe || 'N/A'}`);
        console.log(`   Estado: ${response.body.estado || 'N/A'}`);
        console.log(`   Enviada a DIAN: ${response.body.enviada ? 'Sí' : 'No'}`);
        console.log(`   Número DynamiaERP: ${response.body.numero || formattedInvoiceNumber}`);

        // Actualizar la factura en la base de datos
        await AppDataSource.query(`
          UPDATE invoices
          SET 
            "dynamiaerpCufe" = $1,
            "dynamiaerpSentAt" = NOW(),
            "dynamiaerpInvoiceId" = $2,
            "dynamiaerpInvoiceNumber" = $3,
            "dynamiaerpStatus" = $4,
            "dynamiaerpSentToDian" = $5,
            "dynamiaerpResponse" = $6,
            "dynamiaerpError" = NULL
          WHERE "invoiceNumber" = $7
        `, [
          response.body.cufe || null,
          response.body.id || null,
          response.body.numero || formattedInvoiceNumber,
          response.body.estado || 'NUEVA',
          response.body.enviada || false,
          JSON.stringify(response.body),
          invoiceNumber
        ]);

        console.log('\n✅ Factura actualizada en la base de datos');
      }
    } else {
      console.log('❌ Error al enviar factura a DynamiaERP');
      console.log(`   Status: ${response.statusCode}`);
      console.log(`   Error: ${response.body?.message || 'Error desconocido'}`);
      
      if (response.body?.errores) {
        console.log(`   Detalles: ${response.body.errores.join(', ')}`);
      }

      // Actualizar el error en la base de datos
      await AppDataSource.query(`
        UPDATE invoices
        SET 
          "dynamiaerpSentAt" = NOW(),
          "dynamiaerpError" = $1,
          "dynamiaerpResponse" = $2
        WHERE "invoiceNumber" = $3
      `, [
        response.body?.message || 'Error desconocido',
        JSON.stringify(response.body),
        invoiceNumber
      ]);

      console.log('\n⚠️ Error guardado en la base de datos');
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resendAquiubInvoice();
