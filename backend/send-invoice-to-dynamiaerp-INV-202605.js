// Script para enviar manualmente la factura INV-202605 a DynamiaERP
const { Client } = require('pg');
const http = require('http');

// Configuración DynamiaERP
const DYNAMIAERP_BASE_URL = 'api.pos.dynamiaerp.co';
const DYNAMIAERP_TOKEN = 'tk60188bfb066427ba846544a563212d9f70e1acb8a4d52fa22b3cacf2018f90e6';
const DYNAMIAERP_LLAVE_TECNICA = 'b4118824f61b55466c29a0d87f4067299bd77aa7681891fae449aae32657edca';

// Función para hacer request a DynamiaERP
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

// Formatear fecha
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function sendInvoiceToDynamiaERP() {
  const client = new Client({
    host: 'db.witvuzaarlqxkiqfiljq.supabase.co',
    port: 5432,
    user: 'postgres',
    password: '%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('=== ENVÍO MANUAL DE FACTURA A DYNAMIAERP ===\n');

    const invoiceNumber = 'INV-202605';

    // Obtener factura con tenant y payment
    const result = await client.query(`
      SELECT 
        i.id,
        i."invoiceNumber",
        i.status,
        i.amount,
        i.tax,
        i.total,
        i.currency,
        i."paidAt",
        i."dueDate",
        i.items,
        i."tenantId",
        t.name as tenant_name,
        t.document_number,
        t.document_type_id,
        t."contactEmail",
        t."contactPhone",
        t.plan,
        dt.code as document_type_code,
        p.id as payment_id,
        p."paymentMethod" as payment_method,
        p."boldPaymentMethod" as bold_payment_method
      FROM invoices i
      JOIN tenants t ON i."tenantId" = t.id
      LEFT JOIN document_types dt ON t.document_type_id = dt.id
      LEFT JOIN payments p ON p."invoiceId" = i.id
      WHERE i."invoiceNumber" = $1
      ORDER BY p."createdAt" DESC
      LIMIT 1
    `, [invoiceNumber]);

    if (result.rows.length === 0) {
      console.error('❌ Factura no encontrada');
      return;
    }

    const invoice = result.rows[0];
    
    console.log('📄 FACTURA:', invoice.invoiceNumber);
    console.log('   Estado:', invoice.status);
    console.log('   Monto: $', invoice.total);
    console.log('   Tenant:', invoice.tenant_name);
    console.log('   Documento:', invoice.document_type_code, invoice.document_number);
    console.log('');

    // Verificar que esté pagada
    if (invoice.status !== 'paid') {
      console.error('❌ La factura no está pagada. Estado:', invoice.status);
      return;
    }

    // Mapear tipo de documento
    const tipoDocumentoMap = {
      'CC': '13',
      'CE': '22',
      'NIT': '31',
      'TI': '12',
      'PP': '41',
      'RC': '11',
    };

    const tipoId = tipoDocumentoMap[invoice.document_type_code] || '31';
    const isNIT = tipoId === '31';

    // Mapear método de pago
    let formaPagoCode = 'EF'; // Efectivo por defecto
    
    if (invoice.bold_payment_method || invoice.payment_method) {
      const boldMethod = (invoice.bold_payment_method || invoice.payment_method || '').toLowerCase();
      
      if (boldMethod.includes('pse')) {
        formaPagoCode = 'PS';
      } else if (boldMethod.includes('card') || boldMethod.includes('tarjeta') || boldMethod.includes('credit') || boldMethod.includes('debit')) {
        formaPagoCode = 'TC';
      } else if (boldMethod.includes('transfer') || boldMethod.includes('transferencia')) {
        formaPagoCode = 'TR';
      }
    }

    console.log('💳 Método de pago:', formaPagoCode);
    console.log('');

    // Preparar datos para DynamiaERP
    const dynamiaErpInvoice = {
      tipo: 'REMISION',
      tipoDoc: 'REMISION',
      numero: invoice.invoiceNumber.replace('INV-', '001-'),
      consecutivo: invoice.invoiceNumber.split('-')[2] || '0001',
      prefijo: '001',
      llaveTecnica: DYNAMIAERP_LLAVE_TECNICA,
      fecha: formatDate(new Date(invoice.paidAt)),
      fechaEnvio: formatDate(new Date(invoice.paidAt)),
      fechaVencimiento: formatDate(new Date(invoice.dueDate)),
      pdf: 'none',
      procesarPago: false,
      sucursal: '001',
      observaciones: 'Servicios excluidos del impuesto a las ventas IVA (articulo 10 de la Ley de financiamiento 1943 de 2018)',
      cliente: {
        identificacion: invoice.document_number,
        tipoId: tipoId,
        nombre1: invoice.tenant_name.split(' ')[0] || 'CLIENTE',
        nombre2: '',
        apellido1: invoice.tenant_name.split(' ')[1] || 'EMPRESA',
        apellido2: '',
        razonSocial: isNIT ? invoice.tenant_name : '',
        email: invoice.contactEmail,
        telefono: invoice.contactPhone || '3000000000',
        celular: invoice.contactPhone || '',
        direccion: 'Dirección no especificada',
        ciudad: 'MEDELLIN',
        codigoCiudad: '05001',
        departamento: 'ANTIOQUIA',
        codigoDepartamento: '05',
        pais: 'Colombia',
        codigoPais: 'CO',
        barrio: 'MEDELLIN',
        responsabilidades: ['O-13'],
        esquemaImpuesto: 'IVA',
      },
      detalles: invoice.items.map((item, index) => ({
        codigo: `PLAN-${invoice.plan.toUpperCase()}`,
        nombre: 'LINK DE PAGO',
        descripcion: item.description,
        cantidad: item.quantity,
        valorUnitario: item.unitPrice,
        subtotal: item.total,
        valorImpuesto: 0,
        porcentajeImpuesto: 0,
        baseImpuesto: item.total,
        valorDescuento: 0,
        porcentajeDescuento: 0,
        total: item.total,
        impuesto: 'IVA',
        numero: String(index + 1),
        excluido: true,
        impuestoIncluido: true,
        afectaInventario: false,
      })),
      totales: {
        subtotal: invoice.amount,
        totalImpuestos: 0,
        totalDescuentos: 0,
        total: invoice.total,
        totalPagable: invoice.total,
        totalIVA: 0,
        totalBaseGravable: 0,
      },
      formasPagos: [{
        codigo: formaPagoCode,
        valor: invoice.total,
      }],
    };

    console.log('📤 Enviando factura a DynamiaERP...');
    console.log('');

    // Enviar a DynamiaERP
    const response = await makeRequest('/api/ventas/facturaElectronica', 'POST', dynamiaErpInvoice);

    console.log('📋 RESPUESTA DE DYNAMIAERP:');
    console.log('   Status Code:', response.statusCode);
    console.log('');

    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log('✅ ÉXITO - Factura electrónica creada');
      console.log('');
      console.log('   CUFE:', response.body.cufe || 'N/A');
      console.log('   ID:', response.body.id || 'N/A');
      console.log('   Número:', response.body.numero || 'N/A');
      console.log('   Estado:', response.body.estado || 'N/A');
      console.log('   Válida:', response.body.valido ? 'Sí' : 'No');
      console.log('   Enviada:', response.body.enviada ? 'Sí' : 'No');
      console.log('');

      // Actualizar factura en la base de datos
      await client.query(`
        UPDATE invoices
        SET 
          "dynamiaerpCufe" = $1,
          "dynamiaerpInvoiceId" = $2,
          "dynamiaerpInvoiceNumber" = $3,
          "dynamiaerpStatus" = $4,
          "dynamiaerpSentToDian" = $5,
          "dynamiaerpSentAt" = NOW(),
          "dynamiaerpResponse" = $6,
          "dynamiaerpError" = NULL
        WHERE "invoiceNumber" = $7
      `, [
        response.body.cufe,
        response.body.id,
        response.body.numero,
        response.body.estado,
        response.body.enviada || false,
        JSON.stringify(response.body),
        invoiceNumber
      ]);

      console.log('💾 Factura actualizada en la base de datos');
      console.log('');

      // Registrar en historial
      await client.query(`
        INSERT INTO billing_history ("tenantId", action, description, metadata, "createdAt")
        VALUES ($1, $2, $3, $4, NOW())
      `, [
        invoice.tenantId,
        'PAYMENT_RECEIVED',
        `Factura electrónica generada en DynamiaERP (manual) - CUFE: ${response.body.cufe}`,
        JSON.stringify({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          cufe: response.body.cufe,
          dynamiaerpInvoiceId: response.body.id,
          dynamiaerpStatus: response.body.estado,
          manual: true
        })
      ]);

      console.log('📝 Evento registrado en historial de facturación');
      console.log('');
      console.log('✅ PROCESO COMPLETADO EXITOSAMENTE');

    } else {
      console.log('❌ ERROR - No se pudo crear la factura electrónica');
      console.log('');
      console.log('   Mensaje:', response.body?.message || 'Error desconocido');
      
      if (response.body?.errores && response.body.errores.length > 0) {
        console.log('   Errores:');
        response.body.errores.forEach((error, index) => {
          console.log(`     ${index + 1}. ${error}`);
        });
      }
      console.log('');
      console.log('   Respuesta completa:');
      console.log(JSON.stringify(response.body, null, 2));

      // Guardar error en la base de datos
      await client.query(`
        UPDATE invoices
        SET 
          "dynamiaerpError" = $1,
          "dynamiaerpSentAt" = NOW(),
          "dynamiaerpResponse" = $2
        WHERE "invoiceNumber" = $3
      `, [
        response.body?.message || 'Error desconocido',
        JSON.stringify(response.body),
        invoiceNumber
      ]);

      console.log('');
      console.log('💾 Error guardado en la base de datos');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

sendInvoiceToDynamiaERP();
