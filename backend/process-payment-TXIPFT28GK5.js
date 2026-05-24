// Script para procesar manualmente el pago de Bold TXIPFT28GK5CUS:299432039
// Ejecutar: node process-payment-TXIPFT28GK5.js

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Datos del webhook de Bold (del log)
const webhookPayload = {
  "id": "6eaa8e73-9184-4607-b173-bd033f52321d",
  "type": "SALE_APPROVED",
  "subject": "TXIPFT28GK5",
  "source": "/payments/pse/payments",
  "spec_version": "1.0",
  "time": 1778521151085990400,
  "data": {
    "amount": {
      "taxes": [],
      "tip": 0,
      "total": 119900,
      "currency": "COP"
    },
    "user_id": "6960b1073481f5a7b90831d1",
    "metadata": {
      "reference": "INV-INV-202605-1778520833929-A1"
    },
    "created_at": "2026-05-11T12:35:46-05:00",
    "merchant_id": "2M0MTRAD37",
    "payment_method": "PSE",
    "payer_email": "krolina707@gmail.com",
    "integration": "LINK",
    "bold_code": "B000",
    "payment_id": "TXIPFT28GK5"
  },
  "datacontenttype": "application/json"
};

async function processPayment() {
  try {
    console.log('=== PROCESANDO PAGO MANUALMENTE ===\n');
    console.log('Transaction ID:', webhookPayload.data.payment_id);
    console.log('Reference:', webhookPayload.data.metadata.reference);
    console.log('Amount:', webhookPayload.data.amount.total);
    console.log('Payment Method:', webhookPayload.data.payment_method);
    console.log('');

    // Enviar webhook al endpoint local
    console.log('Enviando webhook al servidor...');
    
    const response = await axios.post(
      `${API_URL}/webhooks/bold`,
      webhookPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-bold-signature': 'acba4463f3fc9a27053124b23ce6b54cc6630cc571688ed5fb5766134fa0282c'
        }
      }
    );

    console.log('✅ Respuesta del servidor:', response.data);
    console.log('');
    console.log('=== PAGO PROCESADO EXITOSAMENTE ===');
  } catch (error) {
    console.error('❌ Error al procesar pago:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

processPayment();
