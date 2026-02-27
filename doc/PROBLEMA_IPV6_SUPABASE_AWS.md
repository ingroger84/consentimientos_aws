# ⚠️ Problema: Servidor AWS sin IPv6 - Supabase requiere IPv6

**Fecha:** 2026-02-27  
**Versión:** 42.3.0  
**Estado:** ❌ BLOQUEADO - Requiere solución de infraestructura

---

## 📋 Resumen del Problema

La migración a Supabase se completó exitosamente en local, pero el servidor AWS Lightsail no puede conectarse a Supabase porque:

1. **Supabase conexión directa** (db.witvuzaarlqxkiqfiljq.supabase.co:5432) solo tiene IPv6
2. **Servidor AWS Lightsail** no tiene conectividad IPv6 habilitada
3. **AWS RDS anterior** ya no existe o fue eliminada (DNS no resuelve)

---

## 🔍 Diagnóstico Técnico

### Conexión Directa a Supabase

```bash
# Desde servidor AWS
nslookup db.witvuzaarlqxkiqfiljq.supabase.co

# Resultado:
Address: 2600:1f18:2e13:9d15:f253:a517:3733:4468  # Solo IPv6
```

**Problema:** El servidor AWS intenta conectarse pero falla con:
```
Error: connect ENETUNREACH 2600:1f18:2e13:9d15:f253:a517:3733:4468:5432
```

### Connection Pooling de Supabase

```bash
# Pooler tiene IPv4
nslookup aws-0-sa-east-1.pooler.supabase.com

# Resultado:
Address: 52.67.1.88
Address: 54.94.90.106
Address: 15.229.150.166
```

**Problema:** El pooler requiere credenciales diferentes y falla con:
```
error: Tenant or user not found
```

---

## 🛠️ Soluciones Intentadas

### 1. ❌ Deshabilitar IPv6 en el servidor
```bash
sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1
```
**Resultado:** El DNS no puede resolver ningún host (ni Supabase ni AWS RDS)

### 2. ❌ Usar Connection Pooling
```
Host: aws-0-sa-east-1.pooler.supabase.com
Port: 6543
User: postgres.witvuzaarlqxkiqfiljq
```
**Resultado:** Error "Tenant or user not found" - credenciales incorrectas o pooler no configurado

### 3. ❌ Agregar entrada en /etc/hosts
```bash
echo '52.67.1.88 aws-0-sa-east-1.pooler.supabase.com' >> /etc/hosts
```
**Resultado:** Mismo error de autenticación

### 4. ❌ Volver a AWS RDS
**Resultado:** AWS RDS ya no existe (DNS NXDOMAIN)

---

## ✅ Soluciones Posibles

### Opción 1: Habilitar IPv6 en AWS Lightsail (RECOMENDADO)

**Pasos:**
1. Ir a AWS Lightsail Console
2. Seleccionar la instancia
3. Networking → Enable IPv6
4. Asignar dirección IPv6
5. Actualizar Security Group para permitir tráfico IPv6

**Ventajas:**
- ✅ Solución permanente
- ✅ No requiere cambios en el código
- ✅ Mejor rendimiento (conexión directa)

**Desventajas:**
- ⏱️ Requiere reiniciar la instancia
- ⏱️ Puede tomar tiempo en propagarse

### Opción 2: Configurar Proxy/Túnel IPv4 a IPv6

**Usando socat:**
```bash
# En el servidor AWS
sudo apt-get install socat

# Crear túnel
socat TCP4-LISTEN:5432,fork,reuseaddr \
  TCP6:[2600:1f18:2e13:9d15:f253:a517:3733:4468]:5432

# Actualizar .env
DB_HOST=localhost
DB_PORT=5432
```

**Ventajas:**
- ✅ No requiere cambios en AWS
- ✅ Funciona inmediatamente

**Desventajas:**
- ❌ Punto único de falla
- ❌ Requiere mantener el proceso corriendo
- ❌ Latencia adicional

### Opción 3: Usar Supabase Connection Pooling (Requiere configuración)

**Contactar con Supabase para:**
1. Verificar credenciales del pooler
2. Habilitar connection pooling si no está activo
3. Obtener credenciales correctas

**Formato esperado:**
```
Host: aws-0-sa-east-1.pooler.supabase.com
Port: 6543
User: postgres.witvuzaarlqxkiqfiljq (o postgres?)
Password: %6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD
Database: postgres
```

### Opción 4: Migrar a otro proveedor de servidor con IPv6

**Opciones:**
- DigitalOcean Droplets (IPv6 incluido)
- Linode (IPv6 incluido)
- AWS EC2 (IPv6 disponible)
- Hetzner Cloud (IPv6 incluido)

---

## 📝 Estado Actual

### Base de Datos

**Supabase (Funcionando en local):**
- ✅ Esquema creado (36 tablas)
- ✅ Roles creados (4 roles)
- ✅ Super Admin creado
- ✅ Conexión local exitosa
- ❌ Servidor AWS no puede conectar (IPv6)

**AWS RDS:**
- ❌ Ya no existe o fue eliminada
- ❌ DNS no resuelve

### Aplicación

**Local:**
- ✅ Backend conectado a Supabase
- ✅ Funcionando correctamente

**Servidor AWS:**
- ❌ Backend no puede conectar a ninguna base de datos
- ❌ Aplicación caída

---

## 🚀 Recomendación Inmediata

**Opción más rápida:** Habilitar IPv6 en AWS Lightsail

1. **Habilitar IPv6:**
   ```bash
   # Desde AWS Console
   Lightsail → Instances → [tu-instancia] → Networking → Enable IPv6
   ```

2. **Actualizar .env en servidor:**
   ```env
   DB_HOST=db.witvuzaarlqxkiqfiljq.supabase.co
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD
   DB_DATABASE=postgres
   DB_SSL=true
   ```

3. **Reiniciar backend:**
   ```bash
   pm2 restart datagree
   ```

4. **Verificar:**
   ```bash
   curl http://localhost:3000/api/health/detailed
   ```

---

## 📞 Información de Contacto

**Supabase:**
- Dashboard: https://supabase.com/dashboard
- Proyecto: witvuzaarlqxkiqfiljq
- Support: https://supabase.com/support

**AWS Lightsail:**
- Console: https://lightsail.aws.amazon.com
- Instancia: 100.28.198.249

---

## 🔗 Referencias

- [AWS Lightsail IPv6](https://lightsail.aws.amazon.com/ls/docs/en_us/articles/amazon-lightsail-enable-disable-ipv6)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [IPv6 Tunneling with socat](https://www.cyberciti.biz/faq/linux-unix-tcp-port-forwarding/)

---

## ✅ Checklist de Resolución

- [ ] Habilitar IPv6 en AWS Lightsail
- [ ] Verificar conectividad IPv6 desde servidor
- [ ] Actualizar .env con credenciales de Supabase
- [ ] Reiniciar backend
- [ ] Verificar conexión a Supabase
- [ ] Probar aplicación completa
- [ ] Documentar solución final
