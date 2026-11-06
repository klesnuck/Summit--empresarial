# 🚀 Guía de Arquitectura: Supabase + Stripe + JavaScript

## Summit Empresarial México

Hemos reestructurado el proyecto para desacoplar el monolito anterior, migrar la base de datos a **Supabase**, gestionar pagos con **Stripe** y convertir la lógica a **JavaScript moderno** sin alterar el diseño visual.

---

### 📂 Nueva Estructura del Proyecto

```text
Summit-Empresarial/
│
├── index.html           # Página principal del evento (Landing Page)
├── registro.html        # Pestaña dedicada para registro de datos y pago (Stripe)
├── login.html           # Inicio de sesión para asistentes
├── mi-cuenta.html       # Portal del usuario: visualización de boletos y código QR
├── boleto.html          # Vista individual del boleto digital (imprimible)
├── validar.html         # Panel staff para escanear y validar boletos en la entrada
│
├── js/
│   ├── supabase-config.js   # Credenciales e inicialización de Supabase
│   ├── stripe-config.js     # Configuración y llaves públicas de Stripe
│   └── api.js               # Lógica de registro, login, boletos y fallback offline
│
├── schema.sql           # Script SQL listo para ejecutar en Supabase SQL Editor
└── styles.css           # Estilos visuales del Summit
```

---

### 🗄️ Paso 1: Configurar Supabase

1. Entra a [https://supabase.com](https://supabase.com) y entra a tu proyecto.
2. Ve al **SQL Editor** en el menú lateral.
3. Copia el contenido del archivo [`schema.sql`](file:///d:/Summit-Empresarial/schema.sql) y haz clic en **Run**. Esto creará:
   - Tabla `usuarios`
   - Tabla `boletos`
   - Políticas de seguridad Row Level Security (RLS) e índices.
4. Ve a **Project Settings** -> **API**:
   - Copia la **Project URL**.
   - Copia la **anon / public key**.
5. Abre [`js/supabase-config.js`](file:///d:/Summit-Empresarial/js/supabase-config.js) y sustituye los valores:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'https://tu-proyecto.supabase.co',
       anonKey: 'tu-anon-key-aqui',
   };
   ```

> 💡 **Nota:** Si pruebas la página antes de poner tus llaves, el sistema tiene un **Modo Offline inteligente** con `localStorage` que te permite registrarte, iniciar sesión y generar boletos de inmediato sin errores.

---

### 💳 Paso 2: Configurar Stripe

1. Ve a [https://dashboard.stripe.com](https://dashboard.stripe.com) en modo **Test**.
2. Ve a **Developers** -> **API keys**.
3. Copia tu clave pública: `pk_test_...`
4. Abre [`js/stripe-config.js`](file:///d:/Summit-Empresarial/js/stripe-config.js) y pégala:
   ```javascript
   const STRIPE_CONFIG = {
       publishableKey: 'pk_test_tu_clave_publica_aqui',
       currency: 'mxn',
       ticketPrice: 350.00,
       eventName: 'Summit Empresarial México - Acceso Completo'
   };
   ```

---

### 🎟️ Flujo de Usuario Implementado

1. **Compra / Registro:**
   - El usuario hace clic en **"COMPRA TUS BOLETOS AQUI!"** en la barra de navegación o en la sección de boletos.
   - Entra a `registro.html`.
   - Ingresa sus datos (Nombre, Apellidos, Correo, Teléfono y su **Contraseña** para crear su cuenta).
   - Realiza el pago seguro con Stripe.
2. **Acceso Inmediato:**
   - Al completar la compra, la sesión se inicia automáticamente y se le redirige a `mi-cuenta.html`.
3. **Portal "Mi Cuenta":**
   - Muestra el boleto oficial con todos sus datos y su **código QR interactivo** generado en JavaScript con `qrcode.js`.
   - Permite **Imprimir / Guardar en PDF** o ver en pantalla completa.
4. **Inicio de Sesión Futuro:**
   - En cualquier momento, el usuario entra a `login.html` con su correo y contraseña (o buscando por su código de boleto) para ver sus pases.
5. **Validación en Puerta (Staff):**
   - Los organizadores pueden escanear el QR o abrir `validar.html?codigo=SUMMIT-XXXXXXXX` para verificar en tiempo real si el boleto es legítimo y marcarlo como ingresado.

