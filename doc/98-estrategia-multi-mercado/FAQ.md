# ❓ Preguntas Frecuentes - Multi-Mercado

## 1. ¿Necesito dos landing pages separadas?

**No.** Recomendamos una sola landing page con detección geográfica automática.

**Ventajas:**
- Un solo código base
- Mejor SEO
- Fácil mantenimiento
- Escalable a más países

## 2. ¿Qué pasa con mis tenants actuales en Colombia?

**No se afectan.** Los tenants existentes mantienen:
- Sus precios actuales en COP
- Sus límites de recursos
- Su ciclo de facturación
- Su plan asignado

## 3. ¿Cómo se detecta el país del usuario?

El sistema detecta el país en este orden:
1. Header `X-Country` (si viene del frontend)
2. Dirección IP del usuario
3. Header `Accept-Language`
4. Default (Internacional)

## 4. ¿Puedo tener precios diferentes para otros países?

**Sí.** La arquitectura permite agregar fácilmente más países:
- México (MXN)
- España (EUR)
- Argentina (ARS)
- etc.

## 5. ¿Cómo funciona la facturación?

**Por región:**
- **Colombia:** Bold (COP) - Ya implementado
- **USA:** Stripe (USD) - Por implementar
- **Otros:** Stripe (USD)

El sistema selecciona automáticamente el gateway según la moneda del tenant.

## 6. ¿Los precios en USA son competitivos?

**Sí.** Análisis de mercado:
- Competidores USA: $70-150 USD/mes
- Nuestros precios: $79-249 USD/mes
- Dentro del rango competitivo

## 7. ¿Cuánto tiempo toma implementar esto?

**5-7 semanas:**
- Backend: 1-2 semanas
- Frontend: 1 semana
- Pagos (Stripe): 2-3 semanas
- Testing: 1 semana

## 8. ¿Qué pasa si un usuario cambia de país?

El tenant mantiene su región y moneda original. No cambia automáticamente.

Si necesita cambiar, debe contactar soporte.

## 9. ¿Cómo manejo los impuestos?

**Por región:**
- **Colombia:** IVA 19%
- **USA:** Sales Tax 0-10% (varía por estado)
- **Internacional:** Sin impuestos

El sistema calcula automáticamente según la región.

## 10. ¿Puedo ofrecer descuentos por región?

**Sí.** Puedes configurar:
- Descuentos por región
- Promociones específicas por país
- Precios especiales para mercados emergentes

## 11. ¿Necesito cumplir con regulaciones específicas?

**Sí, por región:**
- **Colombia:** Ley de protección de datos
- **USA:** HIPAA para datos médicos
- **Europa:** GDPR (si expandes)

## 12. ¿Cómo escalo a más países?

**Fácil:**
1. Agregar país a `REGION_PRICING`
2. Configurar precios en moneda local
3. Opcional: Agregar gateway de pago local
4. Listo

## 13. ¿Puedo bloquear precios para ciertos tenants?

**Sí.** Usa el campo `priceLocked`:
- `true`: El precio no cambia aunque actualices el plan
- `false`: El precio se actualiza con cambios de plan

## 14. ¿Cómo muestro los precios en la landing?

El sistema detecta automáticamente el país y muestra:
- Precios en la moneda local
- Símbolo de moneda correcto
- Indicador de región

## 15. ¿Qué pasa si no puedo detectar el país?

Se usa la región `DEFAULT` (Internacional) con precios en USD.

---

**¿Más preguntas?**

Consulta la documentación completa:
- `ESTRATEGIA_MULTI_MERCADO_RESUMEN.md`
- `doc/98-estrategia-multi-mercado/ESTRATEGIA_PRECIOS_MULTI_MERCADO.md`
