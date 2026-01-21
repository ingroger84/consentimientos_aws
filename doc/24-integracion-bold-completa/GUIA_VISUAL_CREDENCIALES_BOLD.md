# Guía Visual: Dónde Encontrar las Credenciales de Bold Colombia

## 📍 Paso a Paso con Imágenes

### Paso 1: Acceder al Panel de Bold

1. Abre tu navegador y ve a: **https://panel.bold.co**
2. Inicia sesión con tu correo y contraseña de Bold Colombia

```
URL: https://panel.bold.co
```

---

### Paso 2: Buscar el Menú de Integraciones

Una vez dentro del panel, busca en el menú lateral izquierdo:

**Opción A: Si ves el menú completo**
- Busca el ícono que dice **"Integraciones"** o **"Integrations"**
- Haz clic en él

**Opción B: Si el menú está colapsado**
- Busca el ícono de hamburguesa (☰) en la esquina superior izquierda
- Haz clic para expandir el menú
- Busca **"Integraciones"**

```
Menú Lateral → Integraciones
```

---

### Paso 3: Seleccionar "Botón de Pagos"

Dentro de Integraciones, verás **DOS opciones diferentes**:

#### ❌ NO SELECCIONES ESTA:
- **"API Integrations"** o **"Integraciones API"**
- Esta es para datáfonos físicos
- NO es lo que necesitas

#### ✅ SELECCIONA ESTA:
- **"Botón de Pagos"** o **"Payment Button"** o **"Links de Pago"**
- Esta es para pagos online
- **Esta es la correcta**

```
Integraciones → Botón de Pagos (o Payment Button)
```

---

### Paso 4: Seleccionar Ambiente de Pruebas

Verás dos pestañas o secciones:

1. **Pruebas** (Test / Sandbox) ← **Selecciona esta primero**
2. **Producción** (Production)

Haz clic en **"Pruebas"** o **"Test"**

```
Botón de Pagos → Pruebas
```

---

### Paso 5: Encontrar las Llaves

En la sección de Pruebas, verás dos llaves:

#### 🔑 Llave Pública (Public Key)
```
Nombre: "Llave Pública" o "Public Key"
Formato: pub_test_XXXXXXXXXXXXXXXXXXXXXXXX
Ejemplo: pub_test_1XVQAZsH297hGUuW4KAqmC

📋 Botón: "Copiar" o ícono de copiar
```

#### 🔐 Llave Privada (Private Key)
```
Nombre: "Llave Privada" o "Private Key" o "Secret Key"
Formato: prv_test_XXXXXXXXXXXXXXXXXXXXXXXX
Ejemplo: prv_test_KWpgscWMWny3apOYs0Wvg

📋 Botón: "Copiar" o ícono de copiar
⚠️ Puede estar oculta con asteriscos (*****)
👁️ Haz clic en el ícono de "ojo" para mostrarla
```

---

### Paso 6: Copiar las Llaves

1. **Copiar Llave Pública**:
   - Haz clic en el botón "Copiar" junto a la Llave Pública
   - O selecciona el texto y copia (Ctrl+C)
   - Pégala en un lugar seguro temporalmente

2. **Copiar Llave Privada**:
   - Si está oculta, haz clic en el ícono del "ojo" 👁️ para mostrarla
   - Haz clic en el botón "Copiar"
   - O selecciona el texto y copia (Ctrl+C)
   - Pégala en un lugar seguro temporalmente



---

## 🔍 Cómo Identificar que son las Llaves Correctas

### ✅ Llaves CORRECTAS (Botón de Pagos)

```
Public Key:  pub_test_XXXXXXXXXXXXXXXX
Private Key: prv_test_XXXXXXXXXXXXXXXX

Características:
✓ Empiezan con "pub_test_" o "pub_prod_"
✓ Empiezan con "prv_test_" o "prv_prod_"
✓ Son relativamente cortas (20-30 caracteres)
✓ Están en la sección "Botón de Pagos"
```

### ❌ Llaves INCORRECTAS (API Integrations)

```
API Key: DZSkDqh2iWmpYQg204C2fLigQerhPGXAcm5WyujxwYH

Características:
✗ NO tienen prefijo pub_ o prv_
✗ Son muy largas (40+ caracteres)
✗ Están en la sección "API Integrations"
✗ Son para datáfonos físicos
```

---

## 📝 Qué Hacer con las Llaves

Una vez que tengas las dos llaves copiadas:

### 1. Actualizar archivo `.env` local

Abre el archivo `backend/.env` y actualiza:

```env
# Reemplaza estas líneas:
BOLD_API_KEY=pub_test_TU_LLAVE_PUBLICA_AQUI
BOLD_SECRET_KEY=prv_test_TU_LLAVE_PRIVADA_AQUI
BOLD_API_URL=https://sandbox.wompi.co/v1
```

### 2. Actualizar en el servidor

```bash
# Conectarse al servidor
ssh -i AWS-ISSABEL.pem ubuntu@100.28.198.249

# Editar el archivo .env
nano /home/ubuntu/consentimientos_aws/backend/.env

# Actualizar las mismas líneas
# Guardar: Ctrl+O, luego Enter, luego Ctrl+X

# Reiniciar el backend
pm2 restart datagree-backend
```

---

## 🆘 Si No Encuentras las Llaves

### Problema 1: No veo "Botón de Pagos"

**Posibles causas**:
- Tu cuenta no tiene habilitado el Botón de Pagos
- Necesitas permisos de administrador

**Solución**:
1. Contacta a soporte de Bold: soporte@bold.co
2. Pide que habiliten "Botón de Pagos" o "Payment Links"
3. Verifica que tengas permisos de administrador

### Problema 2: Las llaves no tienen el formato correcto

**Si ves algo como**:
```
g7zLcQ8RisN-5hJRFfGdUQU-2aJz5VsJkeAJN4dQUE
```

**Significa que**:
- Estás en la sección incorrecta (API Integrations)
- Necesitas ir a "Botón de Pagos"

### Problema 3: No veo ninguna llave

**Posibles causas**:
- Es la primera vez que usas integraciones
- Las llaves no se han generado

**Solución**:
1. Busca un botón que diga "Activar llaves" o "Generate Keys"
2. Haz clic en él
3. Espera unos segundos
4. Las llaves aparecerán



---

## 📱 Alternativa: Buscar en la App Móvil de Bold

Si tienes la app móvil de Bold instalada:

1. Abre la app Bold en tu teléfono
2. Ve a **Menú** (☰)
3. Busca **"Integraciones"** o **"Configuración"**
4. Selecciona **"Botón de Pagos"**
5. Verás las mismas llaves

---

## 🔐 Seguridad de las Llaves

### ⚠️ IMPORTANTE

- **Llave Pública (pub_test_)**: Puede usarse en el frontend, es segura
- **Llave Privada (prv_test_)**: NUNCA la compartas, solo en el backend

### Dónde NO poner la llave privada:
- ❌ En el código del frontend
- ❌ En repositorios públicos de GitHub
- ❌ En capturas de pantalla compartidas
- ❌ En correos electrónicos

### Dónde SÍ poner la llave privada:
- ✅ En el archivo `.env` del backend (que está en .gitignore)
- ✅ En variables de entorno del servidor
- ✅ En gestores de secretos (AWS Secrets Manager, etc.)

---

## 📞 Contacto de Soporte Bold

Si después de seguir esta guía aún no encuentras las llaves:

**Soporte Bold Colombia**:
- 📧 Email: soporte@bold.co
- 🌐 Panel: https://panel.bold.co
- 📱 WhatsApp: Busca en el panel de Bold
- 📞 Teléfono: Busca en el panel de Bold

**Qué decirles**:
> "Hola, necesito obtener las credenciales del Botón de Pagos (Payment Links) 
> para integrar pagos online en mi aplicación. Necesito la Public Key y 
> Private Key del ambiente de pruebas (sandbox). No encuentro estas llaves 
> en mi panel."

---

## ✅ Checklist Final

Antes de cerrar el panel de Bold, verifica que:

- [ ] Copiaste la **Llave Pública** (empieza con `pub_test_`)
- [ ] Copiaste la **Llave Privada** (empieza con `prv_test_`)
- [ ] Las llaves están en un lugar seguro temporalmente
- [ ] Estás en el ambiente de **Pruebas** (no Producción)
- [ ] Las llaves son del **Botón de Pagos** (no API Integrations)

---

## 🎯 Próximos Pasos

Una vez que tengas las llaves:

1. ✅ Actualizar `backend/.env` local
2. ✅ Actualizar `backend/.env` en el servidor
3. ✅ Reiniciar el backend con `pm2 restart datagree-backend`
4. ✅ Probar creando un pago con las tarjetas de prueba
5. ✅ Verificar que funcione correctamente

---

**Fecha**: 21 de Enero de 2026  
**Autor**: Guía creada para facilitar la obtención de credenciales  
**Versión**: 1.0
