# 🗺️ Ruta Visual para Encontrar las Credenciales

## Navegación en el Panel de Bold

```
┌─────────────────────────────────────────────────────────────┐
│  1. Ir a: https://panel.bold.co                             │
│     Iniciar sesión con tu cuenta                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Buscar en el menú lateral izquierdo:                    │
│     ☰ Menú → "Integraciones" o "Integrations"              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Dentro de Integraciones, verás DOS opciones:            │
│                                                              │
│     ❌ API Integrations (NO ESTA)                           │
│        └─ Para datáfonos físicos                            │
│                                                              │
│     ✅ Botón de Pagos (ESTA ES LA CORRECTA)                 │
│        └─ Para pagos online                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Hacer clic en "Botón de Pagos"                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Seleccionar ambiente:                                    │
│                                                              │
│     [Pruebas] ← Selecciona esta primero                     │
│     [Producción]                                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  6. Verás las llaves:                                        │
│                                                              │
│     🔑 Llave Pública (Public Key)                           │
│        pub_test_XXXXXXXXXXXXXXXX                            │
│        [Copiar] ← Haz clic aquí                             │
│                                                              │
│     🔐 Llave Privada (Private Key)                          │
│        prv_test_XXXXXXXXXXXXXXXX                            │
│        [👁️ Mostrar] [Copiar] ← Haz clic aquí               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Qué Buscar en Cada Pantalla

### Pantalla 1: Login
```
┌──────────────────────────────┐
│   BOLD                       │
│                              │
│   Email: _______________     │
│   Password: ___________      │
│                              │
│   [Iniciar Sesión]           │
└──────────────────────────────┘
```

### Pantalla 2: Dashboard Principal
```
┌──────────────────────────────┐
│ ☰ Menú                       │
│                              │
│ 🏠 Inicio                    │
│ 💰 Ventas                    │
│ 📊 Reportes                  │
│ ⚙️ Integraciones ← AQUÍ      │
│ 👥 Usuarios                  │
└──────────────────────────────┘
```

### Pantalla 3: Integraciones
```
┌──────────────────────────────────────┐
│  Integraciones                       │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ ❌ API Integrations            │ │
│  │    Para datáfonos físicos      │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ ✅ Botón de Pagos              │ │
│  │    Para pagos online ← ESTA    │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### Pantalla 4: Botón de Pagos
```
┌──────────────────────────────────────────────┐
│  Botón de Pagos                              │
│                                              │
│  [Pruebas] [Producción] ← Selecciona Pruebas│
│                                              │
│  🔑 Llave Pública                            │
│  pub_test_1XVQAZsH297hGUuW4KAqmC            │
│  [📋 Copiar]                                 │
│                                              │
│  🔐 Llave Privada                            │
│  prv_test_******************* [👁️]          │
│  [📋 Copiar]                                 │
└──────────────────────────────────────────────┘
```

---

## 🔍 Nombres Alternativos que Podrías Ver

El panel de Bold puede mostrar diferentes nombres según el idioma:

### "Botón de Pagos" también puede aparecer como:
- ✅ Payment Button
- ✅ Links de Pago
- ✅ Payment Links
- ✅ Checkout Links
- ✅ Pagos Online

### "Llave Pública" también puede aparecer como:
- ✅ Public Key
- ✅ API Key (Pública)
- ✅ Client Key

### "Llave Privada" también puede aparecer como:
- ✅ Private Key
- ✅ Secret Key
- ✅ API Secret

---

## ⚡ Atajos Rápidos

Si ya estás en el panel de Bold:

1. **Buscar en la barra de búsqueda**: Escribe "integraciones" o "payment"
2. **URL directa**: Intenta ir a `https://panel.bold.co/integrations`
3. **Menú de ayuda**: Busca el ícono de "?" y pregunta por "credenciales API"

---

## 📸 Qué Hacer Si Necesitas Ayuda

Si después de seguir esta guía aún no encuentras las llaves:

1. **Toma una captura de pantalla** de lo que ves en el panel
2. **Oculta cualquier información sensible** (números de cuenta, etc.)
3. **Envíala al soporte de Bold** con este mensaje:

```
Asunto: Ayuda para encontrar credenciales del Botón de Pagos

Hola,

Necesito obtener las credenciales (Public Key y Private Key) del 
Botón de Pagos para integrar pagos online en mi aplicación.

He seguido la ruta:
Panel → Integraciones → Botón de Pagos → Pruebas

Pero no encuentro las llaves o no tienen el formato esperado 
(pub_test_ y prv_test_).

Adjunto captura de pantalla de lo que veo.

¿Pueden ayudarme a encontrar estas credenciales?

Gracias.
```

---

**Tip**: Si Bold te pide activar alguna funcionalidad o aceptar términos, 
hazlo. Es normal que la primera vez necesites activar el Botón de Pagos.
