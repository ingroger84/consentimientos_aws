# Guía de Pruebas - Landing Page SaaS

**Fecha:** 2026-01-21

## 🧪 Checklist de Pruebas

### 1. Landing Page Principal

#### Navegación
- [ ] El menú de navegación es sticky (se queda fijo al hacer scroll)
- [ ] Los enlaces del menú funcionan (scroll suave a secciones)
- [ ] El menú móvil se abre y cierra correctamente
- [ ] El botón "Comenzar Gratis" redirige a #pricing
- [ ] El botón "Iniciar Sesión" redirige a /login

#### Hero Section
- [ ] El título y descripción se muestran correctamente
- [ ] Los badges de características se ven bien
- [ ] Los botones CTA funcionan
- [ ] La imagen/demo se carga correctamente
- [ ] El badge "10x Más rápido" se posiciona bien

#### Stats Section
- [ ] Las 4 estadísticas se muestran correctamente
- [ ] Los números son legibles
- [ ] El fondo con gradiente se ve bien

#### Features Section
- [ ] Las 8 características se muestran en grid
- [ ] Los iconos se cargan correctamente
- [ ] El hover effect funciona en las cards
- [ ] Los colores de iconos son diferentes

#### Benefits Section
- [ ] La lista de beneficios se muestra completa
- [ ] Los checks verdes aparecen
- [ ] Las 4 cards de métricas se ven bien
- [ ] Los iconos de las cards son correctos

#### Use Cases Section
- [ ] Los 6 casos de uso se muestran
- [ ] Los emojis se ven correctamente
- [ ] Las listas de ejemplos aparecen
- [ ] El hover effect funciona

#### Testimonials Section
- [ ] Los 3 testimonios se muestran
- [ ] Las estrellas de rating aparecen
- [ ] Los nombres y empresas son legibles

#### Footer
- [ ] Todos los enlaces funcionan
- [ ] El copyright muestra el año actual
- [ ] Los iconos sociales aparecen

### 2. Sección de Planes

#### Carga de Datos
- [ ] Los planes se cargan desde el backend
- [ ] Se muestra loading spinner mientras carga
- [ ] Los 5 planes aparecen correctamente

#### Toggle Mensual/Anual
- [ ] El toggle cambia entre mensual y anual
- [ ] Los precios se actualizan correctamente
- [ ] El badge "Ahorra 17%" aparece en anual
- [ ] El precio anual dividido por 12 es correcto

#### Cards de Planes
- [ ] El plan "Básico" tiene badge "Más Popular"
- [ ] Los precios están formateados en COP
- [ ] Las características se listan correctamente
- [ ] Los botones "Seleccionar Plan" funcionan
- [ ] El plan gratuito dice "Comenzar Gratis"

#### Responsive
- [ ] En móvil se ve 1 columna
- [ ] En tablet se ven 2 columnas
- [ ] En desktop se ven 5 columnas
- [ ] El scroll horizontal no aparece

### 3. Modal de Registro

#### Apertura del Modal
- [ ] El modal se abre al seleccionar un plan
- [ ] El plan seleccionado se muestra en el header
- [ ] El precio se muestra correctamente
- [ ] El botón X cierra el modal
- [ ] Click fuera del modal NO lo cierra (por seguridad)

#### Formulario - Datos de Empresa
- [ ] Campo "Nombre de la Empresa" funciona
- [ ] El slug se genera automáticamente
- [ ] El slug se puede editar manualmente
- [ ] Se muestra preview del subdominio
- [ ] Campo "Nombre de Contacto" funciona
- [ ] Campo "Email de Contacto" valida formato
- [ ] Campo "Teléfono" es opcional

#### Formulario - Datos de Administrador
- [ ] Campo "Nombre Completo" funciona
- [ ] Campo "Email" valida formato
- [ ] Campo "Contraseña" requiere mínimo 6 caracteres
- [ ] Campo "Confirmar Contraseña" valida coincidencia
- [ ] Los campos de contraseña ocultan el texto

#### Validaciones
- [ ] Campos requeridos muestran error si están vacíos
- [ ] Email inválido muestra error
- [ ] Contraseña corta muestra error
- [ ] Contraseñas no coinciden muestra error
- [ ] Slug duplicado muestra error del backend
- [ ] Email duplicado muestra error del backend

#### Envío del Formulario
- [ ] El botón muestra "Creando cuenta..." mientras procesa
- [ ] El botón se deshabilita durante el envío
- [ ] Se muestra spinner durante el proceso

#### Estado de Éxito
- [ ] Se muestra icono de check verde
- [ ] El mensaje de éxito es claro
- [ ] Se muestra el email donde se envió el correo
- [ ] Se muestra la URL de acceso (subdominio)
- [ ] El botón "Ir a Iniciar Sesión" funciona
- [ ] El botón "Cerrar" cierra el modal

#### Estado de Error
- [ ] Se muestra icono de error rojo
- [ ] El mensaje de error es claro
- [ ] El botón "Intentar Nuevamente" vuelve al formulario
- [ ] El botón "Cerrar" cierra el modal

### 4. Integración Backend

#### Endpoint de Planes
```bash
# Probar manualmente:
curl http://localhost:3000/tenants/plans
```
- [ ] Retorna array de 5 planes
- [ ] Cada plan tiene todos los campos requeridos
- [ ] Los precios son números
- [ ] Las características son booleanos

#### Endpoint de Creación
```bash
# Probar manualmente:
curl -X POST http://localhost:3000/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "slug": "test-company",
    "contactName": "John Doe",
    "contactEmail": "john@test.com",
    "contactPhone": "+57 300 123 4567",
    "plan": "basic",
    "planPrice": 89900,
    "billingCycle": "monthly",
    "adminUser": {
      "name": "Admin User",
      "email": "admin@test.com",
      "password": "password123"
    }
  }'
```
- [ ] Retorna 201 Created
- [ ] Retorna datos del tenant creado
- [ ] El tenant se crea en la base de datos
- [ ] El usuario administrador se crea
- [ ] El correo de bienvenida se envía

### 5. Correo de Bienvenida

#### Contenido del Correo
- [ ] El correo llega a la bandeja de entrada
- [ ] El asunto es correcto
- [ ] El diseño HTML se ve bien
- [ ] El gradiente del header aparece
- [ ] El nombre del usuario es correcto
- [ ] El nombre de la empresa es correcto
- [ ] El email de acceso es correcto
- [ ] La contraseña temporal es visible
- [ ] La URL de acceso es correcta
- [ ] El rol asignado es correcto

#### Funcionalidad
- [ ] El link de acceso funciona
- [ ] Se puede copiar la contraseña
- [ ] El correo es responsive (se ve bien en móvil)

### 6. Acceso con Credenciales

#### Login
- [ ] Acceder a `http://[slug].localhost:5173/login`
- [ ] Ingresar email del administrador
- [ ] Ingresar contraseña temporal
- [ ] Click en "Iniciar Sesión"
- [ ] Se redirige al dashboard
- [ ] El usuario está autenticado
- [ ] Se muestra el nombre del tenant en el header

#### Dashboard
- [ ] El dashboard se carga correctamente
- [ ] Las estadísticas muestran valores iniciales (0)
- [ ] El menú lateral funciona
- [ ] Se puede navegar a otras secciones

### 7. Responsive Design

#### Móvil (< 768px)
- [ ] El menú hamburguesa funciona
- [ ] Las secciones se apilan verticalmente
- [ ] Los textos son legibles
- [ ] Los botones son clickeables
- [ ] El modal ocupa toda la pantalla
- [ ] El formulario es usable

#### Tablet (768px - 1024px)
- [ ] El layout se adapta correctamente
- [ ] Los grids muestran 2 columnas
- [ ] El espaciado es adecuado

#### Desktop (> 1024px)
- [ ] El layout usa el ancho máximo (7xl)
- [ ] Los grids muestran 3-5 columnas
- [ ] El espaciado es generoso

### 8. Performance

#### Tiempos de Carga
- [ ] La landing page carga en < 2 segundos
- [ ] Los planes se cargan en < 1 segundo
- [ ] El modal se abre instantáneamente
- [ ] El formulario responde rápido

#### Optimizaciones
- [ ] Las imágenes están optimizadas
- [ ] Los iconos se cargan correctamente
- [ ] No hay errores en consola
- [ ] No hay warnings en consola

### 9. SEO y Accesibilidad

#### SEO
- [ ] El título de la página es descriptivo
- [ ] La meta description existe
- [ ] Los headings (h1, h2, h3) están bien estructurados
- [ ] Los enlaces tienen texto descriptivo

#### Accesibilidad
- [ ] Los botones tienen labels
- [ ] Los inputs tienen labels
- [ ] Los colores tienen buen contraste
- [ ] Se puede navegar con teclado (Tab)
- [ ] Los formularios son accesibles

### 10. Casos de Borde

#### Datos Inválidos
- [ ] Email sin @ muestra error
- [ ] Contraseña de 5 caracteres muestra error
- [ ] Slug con espacios se convierte a guiones
- [ ] Slug con caracteres especiales se limpia

#### Errores de Red
- [ ] Si el backend está caído, muestra error claro
- [ ] Si el SMTP falla, la cuenta se crea igual
- [ ] Si hay timeout, muestra mensaje apropiado

#### Datos Duplicados
- [ ] Slug duplicado muestra error específico
- [ ] Email duplicado muestra error específico
- [ ] El mensaje sugiere usar otro valor

## 📊 Resultados Esperados

### Flujo Completo Exitoso:
1. Usuario visita `http://localhost:5173`
2. Navega por la landing page
3. Hace scroll hasta la sección de planes
4. Selecciona el plan "Básico"
5. Se abre el modal de registro
6. Llena el formulario completo
7. Envía el formulario
8. Ve mensaje de éxito
9. Recibe correo de bienvenida
10. Accede a `http://[slug].localhost:5173/login`
11. Inicia sesión con credenciales
12. Accede al dashboard

**Tiempo estimado:** 3-5 minutos

### Métricas de Éxito:
- ✅ 0 errores en consola
- ✅ 100% de funcionalidades operativas
- ✅ Correo recibido en < 30 segundos
- ✅ Formulario enviado en < 3 segundos
- ✅ Landing page carga en < 2 segundos

## 🐛 Reporte de Bugs

Si encuentras algún bug, documenta:
1. **Descripción**: ¿Qué pasó?
2. **Pasos para reproducir**: ¿Cómo llegaste ahí?
3. **Resultado esperado**: ¿Qué debería pasar?
4. **Resultado actual**: ¿Qué pasó realmente?
5. **Screenshots**: Si es posible
6. **Consola**: Errores en la consola del navegador
7. **Navegador**: Chrome, Firefox, Safari, etc.
8. **Dispositivo**: Desktop, móvil, tablet

## ✅ Checklist Final

Antes de dar por terminado:
- [ ] Todas las pruebas pasaron
- [ ] No hay errores en consola
- [ ] El diseño es responsive
- [ ] Los correos se envían correctamente
- [ ] La documentación está completa
- [ ] El código está comentado
- [ ] Las variables de entorno están configuradas
- [ ] El README está actualizado

---

**Última actualización:** 2026-01-21  
**Testeado por:** [Tu nombre]  
**Estado:** ✅ Aprobado / ⚠️ Con observaciones / ❌ Rechazado
