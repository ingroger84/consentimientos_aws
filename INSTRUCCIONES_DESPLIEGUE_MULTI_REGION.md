# 🚀 Instrucciones de Despliegue - Sistema Multi-Región

**Fecha:** 2026-02-08  
**Versión:** 29.1.0  
**Estado:** Listo para Desplegar

---

## ✅ Cambios Implementados

Se ha implementado el sistema multi-región completo que permite mostrar precios dinámicos según el país del usuario.

**Backend:** ✅ Implementado  
**Frontend:** ✅ Implementado  
**Migración:** ✅ Creada  
**GitHub:** ✅ Pusheado

---

## 🚀 PASO 1: Desplegar en Producción

### 1.1 Conectarse al Servidor

```bash
ssh -i "AWS-ISSABEL.pem" ubuntu@ec2-18-191-157-215.us-east-2.compute.amazonaws.com
```

### 1.2 Actualizar Código desde GitHub

```bash
cd /var/www/consentimientos
git pull origin main
```

### 1.3 Aplicar Migración de Base de Datos

```bash
cd /var/www/consentimientos/backend
node apply-region-migration.js
```

**Resultado esperado:**
```
✅ Migración aplicada exitosamente
📊 Primeros 5 tenants actualizados
📈 Distribución de tenants por región
```

### 1.4 Instalar Dependencias del Backend

```bash
cd /var/www/consentimientos/backend
npm install
```

### 1.5 Compilar Backend

```bash
npm run build
```

### 1.6 Instalar Dependencias del Frontend

```bash
cd /var/www/consentimientos/frontend
npm install
```

### 1.7 Compilar Frontend

```bash
npm run build
```

### 1.8 Reiniciar Servicios

```bash
pm2 restart all
```

### 1.9 Recargar Nginx

```bash
sudo systemctl reload nginx
```

---

## ✅ PASO 2: Verificar Despliegue

### 2.1 Verificar API de Planes

```bash
# Desde el servidor
curl http://localhost:3000/api/plans/public
```

**Resultado esperado:**
```json
{
  "region": "Colombia",
  "currency": "COP",
  "symbol": "$",
  "taxRate": 0.19,
  "taxName": "IVA",
  "plans": [...]
}
```

### 2.2 Verificar desde Navegador

1. Abrir: `https://archivoenlinea.com`
2. Ir a sección de precios
3. Verificar que muestra: **"Precios en COP para Colombia"**
4. Verificar que los precios están en COP

### 2.3 Verificar Tenants Existentes

```bash
# Conectarse a PostgreSQL
sudo -u postgres psql consentimientos

# Verificar tenants
SELECT id, name, region, currency, plan_price_original, price_locked 
FROM tenants 
LIMIT 5;
```

**Resultado esperado:**
- Todos los tenants con `region = 'CO'`
- Todos los tenants con `currency = 'COP'`
- Todos los tenants con `price_locked = true`

---

## 🌎 PASO 3: Testing con VPN USA

### 3.1 Conectar VPN a USA

Usar cualquier servicio de VPN y conectarse a un servidor en Estados Unidos.

### 3.2 Verificar Precios en USD

1. Abrir: `https://archivoenlinea.com`
2. Ir a sección de precios
3. Verificar que muestra: **"Precios en USD para United States"**
4. Verificar que los precios están en USD:
   - Basic: $79/mes
   - Professional: $119/mes
   - Plus: $169/mes
   - Enterprise: $249/mes

### 3.3 Verificar API desde USA

```bash
# Con VPN conectada a USA
curl https://archivoenlinea.com/api/plans/public
```

**Resultado esperado:**
```json
{
  "region": "United States",
  "currency": "USD",
  "symbol": "$",
  "taxRate": 0.08,
  "taxName": "Sales Tax",
  "plans": [...]
}
```

---

## 🔍 PASO 4: Verificar Logs

### 4.1 Ver Logs del Backend

```bash
pm2 logs backend
```

**Buscar líneas como:**
```
[GeoDetectionService] País detectado por IP (xxx.xxx.xxx.xxx): US
[GeoDetectionService] País detectado por header: CO
```

### 4.2 Ver Logs de Nginx

```bash
sudo tail -f /var/log/nginx/access.log
```

---

## 🐛 Solución de Problemas

### Problema 1: Migración Falla

**Error:** `Error aplicando migración`

**Solución:**
```bash
# Verificar conexión a base de datos
sudo -u postgres psql consentimientos

# Aplicar migración manualmente
\i /var/www/consentimientos/backend/migrations/add-region-fields-to-tenants.sql
```

### Problema 2: Precios No Cambian

**Error:** Siempre muestra precios en COP

**Solución:**
```bash
# Verificar que el servicio de detección geográfica funciona
curl https://ipapi.co/8.8.8.8/country/
# Debería retornar: US

# Limpiar caché del navegador
Ctrl + Shift + Delete
```

### Problema 3: Error 500 en API

**Error:** `/api/plans/public` retorna error 500

**Solución:**
```bash
# Ver logs detallados
pm2 logs backend --lines 100

# Verificar que CommonModule está importado
# Verificar que GeoDetectionService está registrado
```

---

## 📊 Monitoreo Post-Despliegue

### Métricas a Monitorear

1. **Distribución de Regiones:**
```sql
SELECT region, COUNT(*) as count 
FROM tenants 
GROUP BY region;
```

2. **Nuevos Registros por Región:**
```sql
SELECT region, currency, COUNT(*) as count 
FROM tenants 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY region, currency;
```

3. **Precios Bloqueados:**
```sql
SELECT 
  price_locked, 
  COUNT(*) as count 
FROM tenants 
GROUP BY price_locked;
```

---

## ✅ Checklist de Despliegue

- [ ] Conectado al servidor
- [ ] Código actualizado desde GitHub
- [ ] Migración aplicada exitosamente
- [ ] Dependencias instaladas (backend)
- [ ] Backend compilado
- [ ] Dependencias instaladas (frontend)
- [ ] Frontend compilado
- [ ] Servicios reiniciados
- [ ] Nginx recargado
- [ ] API verificada (Colombia)
- [ ] Landing page verificada (Colombia)
- [ ] Tenants existentes verificados
- [ ] Testing con VPN USA completado
- [ ] API verificada (USA)
- [ ] Landing page verificada (USA)
- [ ] Logs revisados
- [ ] Sin errores en producción

---

## 🎯 Próximos Pasos (Fase 3)

### Integración de Stripe para USA

1. **Crear cuenta Stripe**
   - Registrarse en https://stripe.com
   - Obtener API keys (test y production)

2. **Configurar en Backend**
   ```bash
   # Agregar a .env
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

3. **Implementar Servicio de Stripe**
   - Crear `backend/src/payments/stripe.service.ts`
   - Lógica de pago en USD
   - Webhooks de Stripe

4. **Selector de Gateway**
   ```typescript
   if (tenant.currency === 'COP') {
     // Usar Bold
   } else if (tenant.currency === 'USD') {
     // Usar Stripe
   }
   ```

5. **Testing de Pagos**
   - Testing con tarjetas de prueba Stripe
   - Verificar webhooks
   - Testing de facturación

---

## 📞 Soporte

Si encuentras algún problema durante el despliegue:

1. Revisar logs: `pm2 logs backend`
2. Verificar base de datos
3. Revisar documentación completa en `doc/98-estrategia-multi-mercado/`

---

## ✅ Conclusión

Una vez completados todos los pasos, el sistema multi-región estará funcionando en producción:

- ✅ Usuarios de Colombia verán precios en COP
- ✅ Usuarios de USA verán precios en USD
- ✅ Tenants existentes no se afectan
- ✅ Sistema escalable a más países

**¡Listo para expandirse al mercado USA!** 🚀

---

**Versión:** 29.1.0  
**Fecha:** 2026-02-08  
**Estado:** Listo para Desplegar
