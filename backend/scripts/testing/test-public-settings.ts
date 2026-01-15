import axios from 'axios';

async function testPublicSettings() {
  console.log('🧪 Probando endpoint /api/settings/public\n');

  // Test 1: Super Admin (localhost sin subdominio)
  console.log('📋 Test 1: Super Admin (localhost:3000)');
  try {
    const response1 = await axios.get('http://localhost:3000/api/settings/public', {
      headers: {
        'Host': 'localhost:3000'
      }
    });
    console.log('✅ Respuesta recibida');
    console.log('   companyName:', response1.data.companyName);
    console.log('   companyEmail:', response1.data.companyEmail);
    console.log('   companyPhone:', response1.data.companyPhone);
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n📋 Test 2: Tenant demo-medico (demo-medico.localhost:3000)');
  try {
    const response2 = await axios.get('http://localhost:3000/api/settings/public', {
      headers: {
        'Host': 'demo-medico.localhost:3000'
      }
    });
    console.log('✅ Respuesta recibida');
    console.log('   companyName:', response2.data.companyName);
    console.log('   companyEmail:', response2.data.companyEmail);
    console.log('   companyPhone:', response2.data.companyPhone);
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n📋 Test 3: Admin subdomain (admin.localhost:3000)');
  try {
    const response3 = await axios.get('http://localhost:3000/api/settings/public', {
      headers: {
        'Host': 'admin.localhost:3000'
      }
    });
    console.log('✅ Respuesta recibida');
    console.log('   companyName:', response3.data.companyName);
    console.log('   companyEmail:', response3.data.companyEmail);
    console.log('   companyPhone:', response3.data.companyPhone);
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }
}

testPublicSettings();
