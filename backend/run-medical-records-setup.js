const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runSetup() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'consentimientos',
    user: 'admin',
    password: 'admin123',
  });

  try {
    console.log('🔌 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente\n');

    // Verificar si existe la tabla clients
    const clientsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'clients'
      );
    `);

    if (!clientsTableCheck.rows[0].exists) {
      console.log('📋 Creando tabla de clientes primero...');
      const clientsMigrationSQL = fs.readFileSync(
        path.join(__dirname, 'fix-clients-migration.sql'),
        'utf8'
      );
      await client.query(clientsMigrationSQL);
      console.log('✅ Tabla de clientes creada exitosamente\n');
    } else {
      console.log('✅ Tabla de clientes ya existe\n');
    }

    // Ejecutar migraciones de tablas de historias clínicas
    console.log('📋 Ejecutando migraciones de historias clínicas...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'src/migrations/create-medical-records-tables.sql'),
      'utf8'
    );
    await client.query(migrationSQL);
    console.log('✅ Tablas de historias clínicas creadas exitosamente\n');

    // Ejecutar script de permisos
    console.log('🔐 Creando permisos...');
    const permissionsSQL = fs.readFileSync(
      path.join(__dirname, 'add-medical-records-permissions.sql'),
      'utf8'
    );
    await client.query(permissionsSQL);
    console.log('✅ Permisos creados exitosamente\n');

    // Verificar tablas creadas
    console.log('🔍 Verificando tablas creadas...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%medical%'
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Tablas de historias clínicas:');
    tablesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Verificar permisos creados
    console.log('\n🔍 Verificando permisos creados...');
    const permissionsResult = await client.query(`
      SELECT name, description, category 
      FROM permissions 
      WHERE category = 'medical_records'
      ORDER BY name;
    `);
    
    console.log('\n🔐 Permisos de historias clínicas:');
    permissionsResult.rows.forEach(row => {
      console.log(`   ✓ ${row.name} - ${row.description}`);
    });

    console.log('\n✅ ¡Setup completado exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. cd backend && npm run start:dev');
    console.log('   2. cd frontend && npm run dev');
    console.log('   3. Abrir http://localhost:5173');
    console.log('   4. Ir al menú "Historias Clínicas"\n');

  } catch (error) {
    console.error('❌ Error durante el setup:', error.message);
    if (error.detail) {
      console.error('   Detalle:', error.detail);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSetup();
