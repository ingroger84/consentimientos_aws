/**
 * Script para probar el middleware de tenant
 */

// Simular el comportamiento del middleware
function extractTenantSlug(host) {
  // Remover puerto si existe
  const hostname = host.split(':')[0];
  
  // Dividir por puntos
  const parts = hostname.split('.');
  
  console.log(`Host: ${host}`);
  console.log(`Hostname: ${hostname}`);
  console.log(`Parts: ${JSON.stringify(parts)}`);
  
  // Si es EXACTAMENTE localhost o IP (sin subdominio), no hay tenant
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('→ Es localhost sin subdominio');
    return null;
  }
  
  // Si tiene 2 o más partes, el primero podría ser un subdominio
  if (parts.length >= 2) {
    const potentialSubdomain = parts[0];
    
    // Si es 'admin', SIEMPRE retornar null (Super Admin)
    if (potentialSubdomain.toLowerCase() === 'admin') {
      console.log('→ Es subdominio admin (Super Admin)');
      return null;
    }
    
    // Si tiene solo 2 partes y el segundo es localhost, es un subdominio válido
    // Ejemplo: demo.localhost -> tenant 'demo'
    if (parts.length === 2 && parts[1] === 'localhost') {
      console.log(`→ Subdominio detectado en localhost: ${potentialSubdomain}`);
      return potentialSubdomain;
    }
    
    // Si tiene 3 o más partes, el primero es el subdominio
    if (parts.length >= 3) {
      console.log(`→ Subdominio detectado: ${potentialSubdomain}`);
      return potentialSubdomain;
    }
  }
  
  console.log('→ No se detectó subdominio');
  return null;
}

// Casos de prueba
console.log('\n=== CASOS DE PRUEBA ===\n');

console.log('1. localhost:3000');
console.log('Resultado:', extractTenantSlug('localhost:3000'));
console.log('');

console.log('2. demo-medico.localhost:3000');
console.log('Resultado:', extractTenantSlug('demo-medico.localhost:3000'));
console.log('');

console.log('3. admin.localhost:3000');
console.log('Resultado:', extractTenantSlug('admin.localhost:3000'));
console.log('');

console.log('4. demo-medico.localhost');
console.log('Resultado:', extractTenantSlug('demo-medico.localhost'));
console.log('');
