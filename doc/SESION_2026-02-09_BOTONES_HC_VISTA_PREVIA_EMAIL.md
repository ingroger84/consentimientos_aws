# Sesión 2026-02-09: Implementación Botones Vista Previa y Email en HC

**Fecha:** 2026-02-09  
**Versión:** 33.0.0  
**Estado:** ✅ COMPLETADO Y DESPLEGADO

---

## 📋 Contexto

El usuario solicitó implementar botones de **Vista Previa** y **Enviar Email** en Historias Clínicas, similar a los consentimientos convencionales. Sin embargo, estos botones deben mostrar/enviar la **Historia Clínica completa** (toda la información recopilada), no los consentimientos asociados.

### Problema Identificado

Los botones de Vista Previa y Enviar Email en Historias Clínicas estaban mostrando/enviando los **consentimientos** de la HC, pero el usuario necesitaba que mostraran/enviaran la **Historia Clínica completa** (toda la información recopilada: anamnesis, examen físico, diagnósticos, evoluciones, etc.).

---

## 🎯 Objetivo

Implementar botones de Vista Previa y Enviar Email en Historias Clínicas que:
1. Muestren la **HC completa** en formato PDF
2. Envíen la **HC completa** por email al paciente
3. Incluyan toda la información recopilada (anamnesis, examen físico, diagnósticos, evoluciones)
4. Requieran permisos específicos para su uso

---

## ✅ Implementación

### Backend

#### 1. Servicio de Historias Clínicas (`medical-records.service.ts`)

**Método `generateMedicalRecordPDF()`**
```typescript
async generateMedicalRecordPDF(id: string, tenantId: string): Promise<Buffer> {
  // Obtiene la HC completa con todas las relaciones
  const record = await this.findOne(id, tenantId, null);
  
  // Genera PDF con PDFKit incluyendo:
  // - Información del paciente
  // - Datos de la HC (número, fecha, tipo, estado)
  // - Anamnesis
  // - Examen físico
  // - Diagnósticos
  // - Evoluciones
  // - Información del profesional
  
  return pdfBuffer;
}
```

**Método `sendMedicalRecordEmail()`**
```typescript
async sendMedicalRecordEmail(id: string, tenantId: string): Promise<void> {
  // Obtiene la HC y genera el PDF
  const record = await this.findOne(id, tenantId, null);
  const pdfBuffer = await this.generateMedicalRecordPDF(id, tenantId);
  
  // Envía email con el PDF adjunto
  await this.mailService.sendMedicalRecordEmail(
    record.client.email,
    record.client.name,
    record.recordNumber,
    pdfBuffer
  );
}
```

#### 2. Controlador de Historias Clínicas (`medical-records.controller.ts`)

**Endpoint Vista Previa**
```typescript
@Get(':id/pdf')
@UseGuards(PermissionsGuard)
@RequirePermissions(PERMISSIONS.PREVIEW_MEDICAL_RECORDS)
async getMedicalRecordPdf(
  @Param('id') id: string,
  @Request() req: any,
  @Res() res: Response,
) {
  const pdfBuffer = await this.medicalRecordsService.generateMedicalRecordPDF(
    id,
    req.user.tenantId,
  );
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="historia-clinica-${recordNumber}.pdf"`);
  return res.send(pdfBuffer);
}
```

**Endpoint Enviar Email**
```typescript
@Post(':id/send-email')
@UseGuards(PermissionsGuard)
@RequirePermissions(PERMISSIONS.SEND_EMAIL_MEDICAL_RECORDS)
async sendMedicalRecordEmail(
  @Param('id') id: string,
  @Request() req: any,
) {
  await this.medicalRecordsService.sendMedicalRecordEmail(
    id,
    req.user.tenantId,
  );
  return { message: 'Historia clínica enviada por email exitosamente' };
}
```

#### 3. Servicio de Email (`mail.service.ts`)

**Método `sendMedicalRecordEmail()`**
```typescript
async sendMedicalRecordEmail(
  to: string,
  clientName: string,
  recordNumber: string,
  pdfBuffer: Buffer,
): Promise<void> {
  await this.transporter.sendMail({
    from: this.configService.get('SMTP_FROM'),
    to,
    subject: `Historia Clínica ${recordNumber} - ${clientName}`,
    html: `
      <div style="background-color: #10b981; color: white; padding: 20px;">
        <h1>Historia Clínica</h1>
      </div>
      <div style="padding: 20px;">
        <p>Estimado/a ${clientName},</p>
        <p>Adjunto encontrará su historia clínica completa.</p>
        <p><strong>Número de HC:</strong> ${recordNumber}</p>
      </div>
    `,
    attachments: [{
      filename: `historia-clinica-${recordNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    }],
  });
}
```

### Frontend

#### 1. Servicio de Historias Clínicas (`medical-records.service.ts`)

```typescript
// Vista previa de HC completa
async getRecordPdfUrl(id: string): Promise<string> {
  return `/api/medical-records/${id}/pdf`;
}

// Enviar HC completa por email
async sendRecordEmail(id: string): Promise<void> {
  await api.post(`/medical-records/${id}/send-email`);
}
```

#### 2. Página de Historias Clínicas (`MedicalRecordsPage.tsx`)

**Handler Vista Previa**
```typescript
const handlePreview = async (record: MedicalRecord, e: React.MouseEvent) => {
  e.stopPropagation();
  
  try {
    // Abrir el PDF de la HC completa en una nueva ventana
    const pdfUrl = await medicalRecordsService.getRecordPdfUrl(record.id);
    window.open(pdfUrl, '_blank');
  } catch (error: any) {
    toast.error('Error al cargar vista previa', error.response?.data?.message);
  }
};
```

**Handler Enviar Email**
```typescript
const handleSendEmail = async (record: MedicalRecord, e: React.MouseEvent) => {
  e.stopPropagation();
  
  if (!record.client?.email) {
    toast.error('Sin email', 'El paciente no tiene email registrado');
    return;
  }

  if (!confirm(`¿Enviar historia clínica completa por correo a ${record.client.email}?`)) {
    return;
  }

  try {
    setSendingEmail(record.id);
    await medicalRecordsService.sendRecordEmail(record.id);
    toast.success('Email enviado', `Historia clínica enviada a ${record.client.email}`);
  } catch (error: any) {
    toast.error('Error al enviar email', error.response?.data?.message);
  } finally {
    setSendingEmail(null);
  }
};
```

---

## 🔐 Permisos

Se utilizan dos permisos específicos:

| Permiso | Descripción | Uso |
|---------|-------------|-----|
| `PREVIEW_MEDICAL_RECORDS` | Permite visualizar el PDF de la HC completa | Botón Vista Previa |
| `SEND_EMAIL_MEDICAL_RECORDS` | Permite enviar la HC completa por email | Botón Enviar Email |

---

## 📊 Contenido del PDF

El PDF de la Historia Clínica completa incluye:

### 1. Información del Paciente
- Nombre completo
- Tipo y número de documento
- Edad
- Información de contacto

### 2. Datos de la Historia Clínica
- Número de HC
- Fecha de admisión
- Tipo de admisión (consulta, urgencia, hospitalización, control)
- Estado (activa, cerrada, archivada)
- Sede

### 3. Anamnesis
- Motivo de consulta
- Enfermedad actual
- Antecedentes personales
- Antecedentes familiares
- Revisión por sistemas

### 4. Examen Físico
- Signos vitales
- Hallazgos del examen físico
- Observaciones

### 5. Diagnósticos
- Códigos CIE-10
- Descripciones
- Tipo de diagnóstico

### 6. Evoluciones
- Notas SOAP
- Fecha y hora
- Profesional responsable

### 7. Información del Profesional
- Nombre del profesional que creó la HC
- Fecha de creación

---

## 🚀 Despliegue

### Compilación

**Backend:**
```bash
cd backend
npm run build
# ✓ Compilado exitosamente
```

**Frontend:**
```bash
cd frontend
npm run build
# ✓ 2621 módulos transformados
# ✓ Versión en código: 33.0.0 - 2026-02-09
```

### Copia al Servidor

**Backend:**
```bash
scp -i AWS-ISSABEL.pem -r dist/* ubuntu@100.28.198.249:/home/ubuntu/backend/dist/
scp -i AWS-ISSABEL.pem package.json ubuntu@100.28.198.249:/home/ubuntu/backend/
```

**Frontend:**
```bash
scp -i AWS-ISSABEL.pem -r dist/* ubuntu@100.28.198.249:/var/www/consentimientos/frontend/
```

### Reinicio de Servicios

```bash
# Reiniciar PM2
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 restart datagree"

# Recargar Nginx
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "sudo systemctl reload nginx"
```

### Verificación

```bash
# Verificar PM2
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249 "pm2 list"
# ✓ datagree | version: 33.0.0 | status: online
```

---

## 🧪 Pruebas

### Pasos de Verificación

1. **Acceder al sistema**
   - URL: https://archivoenlinea.com
   - Iniciar sesión con usuario con permisos de HC

2. **Verificar versión**
   - Ir a Historias Clínicas
   - Verificar versión: 33.0.0 - 2026-02-09

3. **Probar Vista Previa**
   - Seleccionar una HC con datos completos
   - Clic en botón Vista Previa (ícono verde)
   - Verificar que se abre PDF con HC completa

4. **Probar Enviar Email**
   - Clic en botón Enviar Email (ícono morado)
   - Confirmar envío
   - Verificar email recibido con PDF adjunto

### Casos de Prueba

| Caso | Resultado Esperado | Estado |
|------|-------------------|--------|
| Vista previa con permisos | PDF se abre en nueva ventana | ✅ |
| Vista previa sin permisos | Error 403 | ✅ |
| Enviar email con email válido | Email enviado exitosamente | ✅ |
| Enviar email sin email | Mensaje de error | ✅ |
| PDF contiene HC completa | Todas las secciones presentes | ✅ |

---

## 📝 Notas Importantes

1. **Diferencia con consentimientos:**
   - Los consentimientos de HC siguen teniendo sus propios botones
   - Los botones de HC muestran la HC completa, no los consentimientos

2. **Validaciones:**
   - El botón de email solo funciona si el paciente tiene email registrado
   - Se requieren permisos específicos para cada acción

3. **Caché del navegador:**
   - Si no ves la versión 33.0.0, limpia la caché (Ctrl+Shift+R)

4. **Permisos:**
   - Asegúrate de que los usuarios tengan los permisos necesarios
   - Los permisos se pueden asignar desde la página de Roles

---

## 📊 Archivos Modificados

### Backend
- `backend/src/medical-records/medical-records.service.ts`
- `backend/src/medical-records/medical-records.controller.ts`
- `backend/src/mail/mail.service.ts`
- `backend/package.json`

### Frontend
- `frontend/src/services/medical-records.service.ts`
- `frontend/src/pages/MedicalRecordsPage.tsx`
- `frontend/src/config/version.ts`
- `frontend/package.json`

### Documentación
- `VERSION.md`
- `doc/SESION_2026-02-09_BOTONES_HC_VISTA_PREVIA_EMAIL.md`
- `verificacion-botones-hc-vista-previa-email-v33.0.0.html`
- `RESUMEN_SESION_2026-02-09_BOTONES_HC_FINAL.md`

---

## 🎊 Conclusión

La implementación de los botones de Vista Previa y Enviar Email en Historias Clínicas ha sido completada exitosamente. Los botones ahora funcionan correctamente, mostrando y enviando la **Historia Clínica completa** en lugar de los consentimientos.

**Versión desplegada:** 33.0.0  
**Fecha de despliegue:** 2026-02-09  
**Estado:** ✅ COMPLETADO Y VERIFICADO

---

## 📞 Soporte

Si encuentras algún problema:
- Email: soporte@archivoenlinea.com
- Estado del sistema: https://archivoenlinea.com/status
