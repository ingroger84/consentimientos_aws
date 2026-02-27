# 🔧 Solución: Conectar AWS Lightsail a Supabase

**Fecha:** 2026-02-27  
**Versión:** 42.3.0  
**Estado:** ⚠️ REQUIERE ACCIÓN

---

## 📋 Problema Identificado

El servidor AWS Lightsail no puede conectarse a Supabase porque:

1. **Supabase conexión directa** (puerto 5432) solo tiene IPv6
2. **Supabase transaction mode** (puerto 6543) solo tiene IPv6  
3. **Supabase session pooler** (Supavisor) no está configurado o requiere credenciales específicas
4. **Servidor AWS Lightsail** no tiene IPv6 público asignado

---

## ✅ Soluciones Disponibles

### Opción 1: Habilitar IPv6 en AWS Lightsail (RECOMENDADO - GRATIS)

**Ventajas:**
- ✅ Solución permanente
- ✅ Sin costo adicional
- ✅ Mejor rendimiento (conexión directa)
- ✅ No requiere cambios en el código

**Pasos:**

1. **Ir a AWS Lightsail Console:**
   - URL: https://lightsail.aws.amazon.com/
   - Región: us-east-1

2. **Seleccionar la instancia:**
   - IP: 100.28.198.249
   - Nombre: (verificar en consola)

3. **Habilitar IPv6:**
   - Click en la instancia
   - Tab "Networking"
   - Sección "IPv6 networking"
   - Click "Enable IPv6"
   - Confirmar

4. **Esperar asignación:**
   - AWS asignará una dirección IPv6 pública
   - Puede tomar 1-2 minutos

5. **Verificar conectividad:**
   ```bash
   ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249
   
   # Verificar IPv6
   ip -6 addr show
   
   # Probar conectividad
   ping6 -c 2 google.com
   
   # Probar conexión a Supabase
   nslookup db.witvuzaarlqxkiqfiljq.supabase.co
   ```

6. **Actualizar .env del servidor:**
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

7. **Reiniciar backend:**
   ```bash
   pm2 restart datagree
   pm2 logs datagree --lines 50
   ```

---

### Opción 2: Add-on IPv4 Dedicado de Supabase ($4/mes)

**Ventajas:**
- ✅ Solución oficial de Supabase
- ✅ Dirección IPv4 dedicada
- ✅ Fácil de configurar

**Desventajas:**
- ❌ Costo adicional: ~$4/mes ($0.0055/hora)

**Pasos:**

1. **Ir al Dashboard de Supabase:**
   - URL: https://supabase.com/dashboard
   - Proyecto: witvuzaarlqxkiqfiljq

2. **Habilitar Add-on:**
   - Settings → Add-ons
   - "Dedicated IPv4 Address"
   - Click "Enable"
   - Confirmar costo

3. **Obtener nueva dirección:**
   - Supabase asignará una IPv4 dedicada
   - Aparecerá en la configuración de conexión

4. **Actualizar .env:**
   ```env
   DB_HOST=[nueva-ipv4-dedicada]
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=%6Q0MI6UeW6!pKVaa1alKVvOgWeJZPYD
   DB_DATABASE=postgres
   DB_SSL=true
   ```

5. **Reiniciar backend:**
   ```bash
   pm2 restart datagree
   ```

---

### Opción 3: Túnel SSH con Máquina Intermedia (TEMPORAL)

**Ventajas:**
- ✅ Sin costo adicional
- ✅ Funciona inmediatamente

**Desventajas:**
- ❌ Requiere máquina intermedia con IPv6
- ❌ Punto único de falla
- ❌ Latencia adicional
- ❌ Requiere mantenimiento

**No recomendado para producción.**

---

### Opción 4: Migrar a Otro Proveedor con IPv6

**Proveedores con IPv6 incluido:**
- DigitalOcean Droplets
- Linode
- AWS EC2 (requiere configuración)
- Hetzner Cloud
- Vultr

**Ventajas:**
- ✅ IPv6 incluido por defecto
- ✅ Solución permanente

**Desventajas:**
- ❌ Requiere migración completa
- ❌ Tiempo de configuración
- ❌ Posible downtime

---

## 🎯 Recomendación Final

**Opción 1: Habilitar IPv6 en AWS Lightsail**

Es la mejor solución porque:
1. Es gratis
2. Es permanente
3. No requiere cambios en el código
4. Mejor rendimiento (conexión directa)
5. Se configura en 5 minutos

**Pasos resumidos:**
1. AWS Console → Lightsail → Networking → Enable IPv6
2. Esperar asignación (1-2 min)
3. Verificar conectividad
4. Actualizar .env con conexión directa
5. Reiniciar PM2

---

## 📊 Comparación de Opciones

| Aspecto | IPv6 Lightsail | IPv4 Add-on | Túnel SSH | Migrar |
|---------|----------------|-------------|-----------|--------|
| **Costo** | Gratis | $4/mes | Gratis | Variable |
| **Tiempo setup** | 5 min | 5 min | 30 min | Horas |
| **Permanente** | ✅ | ✅ | ❌ | ✅ |
| **Rendimiento** | Excelente | Excelente | Regular | Excelente |
| **Mantenimiento** | Ninguno | Ninguno | Alto | Ninguno |
| **Recomendado** | ✅ SÍ | ⚠️ Si no hay IPv6 | ❌ NO | ⚠️ Última opción |

---

## 🔍 Verificación Post-Implementación

Después de implementar cualquier solución, verificar:

### 1. Conectividad de Red

```bash
# Desde el servidor AWS
ssh -i credentials/AWS-ISSABEL.pem ubuntu@100.28.198.249

# Verificar resolución DNS
nslookup db.witvuzaarlqxkiqfiljq.supabase.co

# Probar conexión TCP
timeout 5 bash -c 'cat < /dev/null > /dev/tcp/db.witvuzaarlqxkiqfiljq.supabase.co/5432' && echo "✅ Conexión exitosa" || echo "❌ Conexión fallida"
```

### 2. Conexión de Base de Datos

```bash
cd /home/ubuntu/consentimientos_aws/backend
node test-supabase-connection.js
```

### 3. Backend Funcionando

```bash
# Verificar logs
pm2 logs datagree --lines 50

# Verificar health endpoint
curl http://localhost:3000/api/health/detailed
```

### 4. Aplicación Web

1. Abrir: https://demo-estetica.archivoenlinea.com
2. Iniciar sesión con:
   - Email: rcaraballo@innovasystems.com.co
   - Password: Admin123!
3. Verificar que carga correctamente
4. Cambiar password inmediatamente

---

## 📝 Estado Actual

### Base de Datos Supabase

- ✅ Esquema creado (36 tablas)
- ✅ Roles creados (4 roles)
- ✅ Super Admin creado
- ✅ Conexión local funcionando
- ❌ Servidor AWS no puede conectar (IPv6)

### Aplicación

- ✅ Backend local funcionando con Supabase
- ❌ Backend en servidor AWS sin base de datos
- ❌ Aplicación en producción CAÍDA

---

## 🚀 Próximos Pasos

1. **URGENTE:** Implementar Opción 1 (Habilitar IPv6)
2. Verificar conectividad
3. Actualizar .env del servidor
4. Reiniciar backend
5. Verificar aplicación funcionando
6. Cambiar password del super admin
7. Crear tenant de prueba
8. Documentar solución implementada

---

## 📞 Soporte

**AWS Lightsail:**
- Console: https://lightsail.aws.amazon.com
- Docs: https://lightsail.aws.amazon.com/ls/docs/en_us/articles/amazon-lightsail-enable-disable-ipv6

**Supabase:**
- Dashboard: https://supabase.com/dashboard
- Proyecto: witvuzaarlqxkiqfiljq
- Docs IPv4: https://supabase.com/docs/guides/platform/ipv4-address

---

## 🔗 Referencias

- [AWS Lightsail IPv6](https://lightsail.aws.amazon.com/ls/docs/en_us/articles/amazon-lightsail-enable-disable-ipv6)
- [Supabase IPv4 Add-on](https://supabase.com/docs/guides/platform/ipv4-address)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase IPv4/IPv6 Compatibility](https://supabase.com/docs/guides/troubleshooting/supabase--your-network-ipv4-and-ipv6-compatibility-cHe3BP)

---

## ✅ Checklist

- [x] Problema identificado
- [x] Soluciones investigadas
- [x] Documentación creada
- [ ] IPv6 habilitado en AWS Lightsail
- [ ] Conectividad verificada
- [ ] .env actualizado en servidor
- [ ] Backend reiniciado
- [ ] Aplicación verificada
- [ ] Password cambiado
- [ ] Tenant de prueba creado

