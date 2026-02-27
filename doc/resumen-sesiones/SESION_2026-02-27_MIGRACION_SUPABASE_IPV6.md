# 📋 Resumen de Sesión: Migración a Supabase - Problema IPv6

**Fecha:** 2026-02-27  
**Versión:** 42.3.0  
**Duración:** ~2 horas  
**Estado:** ⚠️ BLOQUEADO - Requiere habilitar IPv6 en AWS

---

## 🎯 Objetivo de la Sesión

Completar la migración de la base de datos desde AWS RDS a Supabase y desplegar en el servidor de producción.

---

## ✅ Trabajo Completado

### 1. Migración Local Exitosa

- ✅ Conexión a Supabase establecida desde local
- ✅ Esquema completo creado con TypeORM (36 tablas)
- ✅ Datos iniciales insertados:
  * 4 roles creados (super_admin, admin, operador, admin_sede)
  * Usuario super admin: rcaraballo@innovasystems.com.co / Admin123!
- ✅ Backend local funcionando correctamente con Supabase

### 2. Scripts de Prueba Creados

- ✅ `backend/test-supabase-connection.js` - Prueba de conexión básica
- ✅ `backend/test-pooler-connection.js` - Prueba de connection pooler
- ✅ `backend/test-pooler-formats.js` - Prueba de diferentes formatos de usuario
- ✅ `backend/test-socat-tunnel.js` - Prueba de túnel IPv4 a IPv6
- ✅ `backend/test-supavisor-session.js` - Prueba de Supavisor session mode
- ✅ `backend/test-transaction-mode.js` - Prueba de transaction mode

### 3. Investigación de Soluciones

- ✅ Investigado problema de IPv6 en AWS Lightsail
- ✅ Probado connection pooler de Supabase (puerto 6543)
- ✅ Probado Supavisor session mode (puerto 5432)
- ✅ Intentado túnel socat IPv4 a IPv6
- ✅ Investigado add-on IPv4 de Supabase
- ✅ Documentado todas las soluciones posibles

### 4. Documentación Creada

- ✅ `doc/SOLUCION_IPV6_SUPABASE.md` - Guía completa de soluciones
- ✅ `doc/PROBLEMA_IPV6_SUPABASE_AWS.md` - Análisis técnico del problema
- ✅ `doc/MIGRACION_SUPABASE_COMPLETADA.md` - Estado de la migración local

---

## ❌ Problema Bloqueante Identificado

### Descripción del Problema

El servidor AWS Lightsail no puede conectarse a Supabase porque:

1. **Supabase conexión directa** (puerto 5432) solo tiene IPv6
2. **Supabase transaction mode** (puerto 6543) solo tiene IPv6
3. **Supabase session pooler** no está configurado o requiere credenciales específicas
4. **Servidor AWS Lightsail** no tiene IPv6 público asignado

### Errores Encontrados

```bash
# Conexión directa
Error: connect ENETUNREACH 2600:1f18:2e13:9d15:f253:a517:3733:4468:5432

# Connection pooler
Error: Tenant or user not found

# Túnel socat
Error: Network is unreachable (IPv6 no disponible en kernel)
```

### Diagnóstico Técnico

```bash
# DNS resuelve solo a IPv6
$ nslookup db.witvuzaarlqxkiqfiljq.supabase.co
Address: 2600:1f18:2e13:9d15:f253:a517:3733:4468

# Servidor no tiene IPv6 público
$ ip -6 addr show
1: lo: inet6 ::1/128 scope host
2: ens5: inet6 fe80::cf7:66ff:fe72:9dbd/64 scope link
```

---

## 🔧 Soluciones Propuestas

### Opción 1: Habilitar IPv6 en AWS Lightsail (RECOMENDADO)

**Ventajas:**
- ✅ Solución permanente
- ✅ Sin costo adicional
- ✅ Mejor rendimiento (conexión directa)
- ✅ No requiere cambios en el código

**Pasos:**
1. AWS Console → Lightsail → Networking → Enable IPv6
2. Esperar asignación (1-2 min)
3. Verificar conectividad
4. Actualizar .env con conexión directa
5. Reiniciar PM2

**Documentación:** `doc/SOLUCION_IPV6_SUPABASE.md`

### Opción 2: Add-on IPv4 Dedicado de Supabase

**Costo:** ~$4/mes ($0.0055/hora)

**Ventajas:**
- ✅ Solución oficial de Supabase
- ✅ Dirección IPv4 dedicada
- ✅ Fácil de configurar

**Pasos:**
1. Supabase Dashboard → Settings → Add-ons
2. Enable "Dedicated IPv4 Address"
3. Actualizar .env con nueva dirección
4. Reiniciar PM2

### Opción 3: Túnel SSH (NO RECOMENDADO)

**Desventajas:**
- ❌ Punto único de falla
- ❌ Requiere mantenimiento
- ❌ Latencia adicional

Solo para pruebas temporales.

### Opción 4: Migrar a Otro Proveedor

**Proveedores con IPv6:**
- DigitalOcean Droplets
- Linode
- AWS EC2
- Hetzner Cloud

**Desventajas:**
- ❌ Requiere migración completa
- ❌ Tiempo de configuración
- ❌ Posible downtime

---

## 📊 Estado Actual del Sistema

### Base de Datos

**Supabase (Funcionando en local):**
- ✅ Host: db.witvuzaarlqxkiqfiljq.supabase.co
- ✅ Port: 5432 (directo) / 6543 (transaction)
- ✅ Database: postgres
- ✅ User: postgres
- ✅ Esquema: 36 tablas creadas
- ✅ Roles: 4 roles creados
- ✅ Super Admin: rcaraballo@innovasystems.com.co
- ❌ Servidor AWS: No puede conectar (IPv6)

**AWS RDS (Antigua):**
- ❌ Ya no existe o fue eliminada
- ❌ DNS no resuelve (NXDOMAIN)

### Aplicación

**Local:**
- ✅ Backend conectado a Supabase
- ✅ Funcionando correctamente

**Servidor AWS:**
- ❌ Backend no puede conectar a ninguna base de datos
- ❌ Aplicación en producción CAÍDA
- ⚠️ Requiere solución urgente

---

## 🚀 Próximos Pasos Inmediatos

### 1. URGENTE: Habilitar IPv6 en AWS Lightsail

```bash
# Desde AWS Console
1. Ir a: https://lightsail.aws.amazon.com/
2. Seleccionar instancia: 100.28.198.249
3. Tab "Networking"
4. Click "Enable IPv6"
5. Esperar asignación (1-2 min)
```

### 2. Verificar Conectividad

```bash
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249

# Verificar IPv6
ip -6 addr show

# Probar conectividad
ping6 -c 2 google.com

# Probar Supabase
nslookup db.witvuzaarlqxkiqfiljq.supabase.co
```

### 3. Actualizar .env del Servidor

```bash
cd /home/ubuntu/consentimientos_aws/backend
nano .env

# Actualizar:
DB_HOST=db.witvuzaarlqxkiqfiljq.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD
DB_DATABASE=postgres
DB_SSL=true
```

### 4. Reiniciar Backend

```bash
pm2 restart datagree
pm2 logs datagree --lines 50
```

### 5. Verificar Aplicación

1. Abrir: https://demo-estetica.archivoenlinea.com
2. Login: rcaraballo@innovasystems.com.co / Admin123!
3. Cambiar password inmediatamente
4. Verificar funcionalidad completa

---

## 📝 Archivos Creados/Modificados

### Nuevos Archivos

```
backend/test-pooler-connection.js
backend/test-pooler-formats.js
backend/test-socat-tunnel.js
backend/test-supavisor-session.js
backend/test-transaction-mode.js
doc/SOLUCION_IPV6_SUPABASE.md
doc/resumen-sesiones/SESION_2026-02-27_MIGRACION_SUPABASE_IPV6.md
```

### Archivos Modificados

```
backend/.env (local - actualizado con Supabase)
doc/PROBLEMA_IPV6_SUPABASE_AWS.md (actualizado)
doc/MIGRACION_SUPABASE_COMPLETADA.md (actualizado)
```

---

## 🔍 Lecciones Aprendidas

### 1. IPv6 en Cloud Providers

- AWS Lightsail no tiene IPv6 habilitado por defecto
- Supabase usa IPv6 para conexiones directas
- Siempre verificar compatibilidad de red antes de migrar

### 2. Connection Pooling de Supabase

- Supavisor session mode requiere formato específico de usuario
- Transaction mode también usa IPv6
- El pooler no está configurado por defecto en todos los proyectos

### 3. Alternativas de Conectividad

- Add-on IPv4 de Supabase es una opción viable ($4/mes)
- Túneles IPv4 a IPv6 son complejos y no recomendados para producción
- Habilitar IPv6 es la solución más simple y gratuita

---

## 📊 Comparación de Soluciones

| Solución | Costo | Tiempo | Permanente | Rendimiento | Recomendado |
|----------|-------|--------|------------|-------------|-------------|
| IPv6 Lightsail | Gratis | 5 min | ✅ | Excelente | ✅ SÍ |
| IPv4 Add-on | $4/mes | 5 min | ✅ | Excelente | ⚠️ Si no hay IPv6 |
| Túnel SSH | Gratis | 30 min | ❌ | Regular | ❌ NO |
| Migrar servidor | Variable | Horas | ✅ | Excelente | ⚠️ Última opción |

---

## 🔗 Referencias Útiles

### Documentación Oficial

- [AWS Lightsail IPv6](https://lightsail.aws.amazon.com/ls/docs/en_us/articles/amazon-lightsail-enable-disable-ipv6)
- [Supabase IPv4 Add-on](https://supabase.com/docs/guides/platform/ipv4-address)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase IPv4/IPv6 Compatibility](https://supabase.com/docs/guides/troubleshooting/supabase--your-network-ipv4-and-ipv6-compatibility-cHe3BP)

### Documentación del Proyecto

- `doc/SOLUCION_IPV6_SUPABASE.md` - Guía completa de soluciones
- `doc/PROBLEMA_IPV6_SUPABASE_AWS.md` - Análisis técnico
- `doc/MIGRACION_SUPABASE_COMPLETADA.md` - Estado de migración local

---

## ✅ Checklist de Resolución

- [x] Problema identificado y diagnosticado
- [x] Soluciones investigadas y documentadas
- [x] Scripts de prueba creados
- [x] Documentación completa creada
- [ ] IPv6 habilitado en AWS Lightsail
- [ ] Conectividad verificada
- [ ] .env actualizado en servidor
- [ ] Backend reiniciado
- [ ] Aplicación verificada en producción
- [ ] Password del super admin cambiado
- [ ] Tenant de prueba creado
- [ ] Monitoreo configurado

---

## 💡 Recomendación Final

**Habilitar IPv6 en AWS Lightsail es la mejor solución:**

1. Es gratis
2. Es permanente
3. Se configura en 5 minutos
4. No requiere cambios en el código
5. Mejor rendimiento (conexión directa)

**Pasos resumidos:**
1. AWS Console → Lightsail → Enable IPv6
2. Verificar conectividad
3. Actualizar .env
4. Reiniciar PM2
5. Verificar aplicación

---

## 📞 Información de Contacto

**Servidor AWS:**
- IP: 100.28.198.249
- Usuario: ubuntu
- Key: credentials/AWS-ISSABEL.pem
- Dominio: demo-estetica.archivoenlinea.com

**Supabase:**
- Dashboard: https://supabase.com/dashboard
- Proyecto: witvuzaarlqxkiqfiljq
- Host: db.witvuzaarlqxkiqfiljq.supabase.co

**Super Admin:**
- Email: rcaraballo@innovasystems.com.co
- Password: Admin123! (CAMBIAR después del primer login)

---

## 🎯 Conclusión

La migración a Supabase se completó exitosamente en el entorno local. El único obstáculo para desplegar en producción es la falta de IPv6 en el servidor AWS Lightsail. La solución es simple y gratuita: habilitar IPv6 desde la consola de AWS. Una vez habilitado, la aplicación estará completamente operativa con la nueva base de datos Supabase.

**Estado:** ⚠️ Esperando habilitación de IPv6 en AWS Lightsail

