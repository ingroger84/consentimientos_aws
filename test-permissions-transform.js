// Test para verificar cómo se transforman los permisos

const permissionsString = "view_dashboard,view_global_stats,view_consents,create_consents,edit_consents";

// Simular el transformer "from"
function transformFrom(value) {
  if (!value) return [];
  // Si es un string separado por comas, convertirlo a array
  if (typeof value === 'string') {
    // Intentar parsear como JSON primero (por compatibilidad)
    if (value.startsWith('[') || value.startsWith('{')) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        // Si falla, asumir que es un string separado por comas
        return value.split(',').map(p => p.trim()).filter(p => p.length > 0);
      }
    }
    // String separado por comas
    return value.split(',').map(p => p.trim()).filter(p => p.length > 0);
  }
  // Si ya es un array, retornarlo
  return Array.isArray(value) ? value : [];
}

const result = transformFrom(permissionsString);

console.log('Input:', permissionsString);
console.log('Output:', result);
console.log('Length:', result.length);
console.log('First 5:', result.slice(0, 5));
