# 🛡️ Implementación de Patrón BFF y Seguridad de Sesión

> **Proyecto Académico:** Blindaje de capa de red mediante Proxy Inverso (BFF) con Next.js, Política de Renovación Automática de Token (Refresh Token Interceptor) y Control Global de Inactividad de Sesión.  
> **Estudiante:** Rubén Canay  
> **Rama de Trabajo:** `feature/Ruben-canay-bff-session-security`

---

## 🎥 Enlace del Video de Demostración (Máx. 3 Minutos)

> [!IMPORTANT]
> **Enlace del Video de Evaluación:**  
> 🔗 **[Haz clic aquí para ver el Video Demostrativo en YouTube / Google Drive](https://www.youtube.com)**  
> *(Pega aquí la URL de tu video de YouTube en modo Oculto o tu enlace de Google Drive con acceso público)*

---

## 📋 Resumen de Criterios de Evaluación Implementados

| Criterio | Descripción Técnica | Archivos Clave | Puntaje |
| :--- | :--- | :--- | :---: |
| **1. Enmascaramiento BFF (Proxy Inverso)** | El frontend React se comunica exclusivamente con rutas locales (`/api/*`). Next.js procesa y enruta internamente las peticiones hacia el backend sin exponer endpoints reales. | [`src/app/api/auth/login/route.ts`](src/app/api/auth/login/route.ts)<br>[`src/app/api/products/route.ts`](src/app/api/products/route.ts) | **1.5 pts** |
| **2. Interceptor & Refresh Token** | Interceptor centralizado en `httpClient` que captura respuestas `401 Unauthorized`, pausa la solicitud, solicita silenciosamente un nuevo Access Token a `/api/auth/refresh` y repite la llamada original con éxito (`200 OK`). | [`src/shared/utils/httpClient.ts`](src/shared/utils/httpClient.ts)<br>[`src/app/api/auth/refresh/route.ts`](src/app/api/auth/refresh/route.ts) | **2.5 pts** |
| **3. Control de Inactividad (Frontend)** | Listener global (`mousemove`, `keydown`, `scroll`, `click`) que supervisa la inactividad del usuario (15 segundos). Al vencer, destruye la sesión en `localStorage` y redirige al Login con alerta de seguridad. | [`src/shared/context/InactivityContext.tsx`](src/shared/context/InactivityContext.tsx)<br>[`src/shared/hooks/useInactivityTimer.ts`](src/shared/hooks/useInactivityTimer.ts) | **1.0 pts** |

---

## 🚀 Puesta en Marcha Local

### 1. Clonar el repositorio y cambiar a la rama de la entrega:
```bash
git checkout feature/Ruben-canay-bff-session-security
```

### 2. Instalar dependencias:
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000) (o puerto asignado).

---

## 🔑 Credenciales de Acceso para Pruebas

| Perfil | Correo Electrónico | Contraseña | Rol / Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@empresa.com` | `admin123` | Acceso completo a inventario, métricas y gestión. |
| **Usuario Consulta** | `user@empresa.com` | `user123` | Acceso de solo lectura al catálogo de productos. |

---

## 🧪 Demostración en la Pestaña Network (Herramientas de Desarrollador)

1. **Demostración BFF (Paso 1):**
   - Presionar **"Consultar Catálogo (BFF)"** en el Dashboard.
   - En Network se valida: `GET http://localhost:3000/api/products` *(Status: 200 OK)*.

2. **Demostración Refresh Token (Paso 2):**
   - Presionar **"Verificar Renovación (401 ➔ 200)"** en el Dashboard.
   - En Network se evidencia la secuencia automática:
     - `1. products` ➔ `401 Unauthorized` (Token expirado)
     - `2. refresh`  ➔ `200 OK` (Solicitud silenciosa a `/api/auth/refresh`)
     - `3. products` ➔ `200 OK` (Reintento exitoso con nuevo token)

3. **Demostración Inactividad (Paso 3):**
   - Presionar **"Iniciar Monitoreo (15s)"** en el Dashboard y soltar el mouse/teclado.
   - Al llegar a 0s, el sistema expulsa al usuario al Login y muestra la notificación de cierre por inactividad.
