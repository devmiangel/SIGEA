# Historial de Cambios — SIGEA

### Descripción general del proyecto
Se exploró la estructura del backend (Django REST Framework) y frontend (React + Vite) para entender el propósito del proyecto: sistema integral de gestión agropecuaria con módulos de usuarios, predios, unidades productivas, visitas técnicas e inventario.

### UserPreviewCard (nuevo componente)
- **Archivo:** `SIGEA-FRONT/src/components/UserPreviewCard/UserPreviewCard.jsx`
- Componente de previsualización horizontal de usuario.
- Muestra: avatar con inicial, nombre, email, badge de estado (activo/inactivo/pendiente), badge de rol.
- Botones de editar y eliminar (sin acción implementada, solo callbacks).
- Toda la card es clickeable (`onCardClick`).
- Estilado con Tailwind.

### Sidebar — Refactorización completa a Tailwind
- **Archivo:** `SIGEA-FRONT/src/components/SideBar/Sidebar.jsx`
- **Eliminado:** `SIGEA-FRONT/src/components/SideBar/Sidebar.css`
- Convertido de CSS plano a Tailwind.
- Desktop: `sticky top-0 left-0`, sidebar siempre visible.
- Mobile (< lg): `fixed`, oculto por defecto, toggle con botón flotante que muestra el logo SIGEA.
- Toggle abre overlay semitransparente y sidebar con animación `translate-x`.
- Cerrar sidebar al navegar en mobile.

### Layouts — Adaptación para sidebar
- **Archivo:** `SIGEA-FRONT/src/layouts/layout.css`
  - Agregado `.layout-wrapper { display: flex; min-height: 100vh; }`.
  - `.main-content` cambiado a `flex: 1`.
- **Archivo:** `SIGEA-FRONT/src/layouts/adminlayout.jsx`
  - Wrapper `<div className="layout-wrapper">` en lugar de fragment.
- **Archivo:** `SIGEA-FRONT/src/layouts/userLayout.jsx`
  - Wrapper `<div className="layout-wrapper">` en lugar de fragment.
- **Archivo:** `SIGEA-FRONT/src/layouts/EmployeeLayout.jsx`
  - Wrapper `<div className="layout-wrapper">` en lugar de fragment.

### UPPReviewCard (nuevo componente)
- **Archivo:** `SIGEA-FRONT/src/components/UPPReviewCard/UPPReviewCard.jsx`
- Componente de previsualización horizontal de Unidad Productiva.
- Muestra: avatar con inicial, nombre/RUEA, ubicación con icono, badge de tipo, badge de fecha con icono de calendario.
- Toda la card es clickeable (`onCardClick`).

### cardTokens.js (nuevo archivo de tokens compartidos)
- **Archivo:** `SIGEA-FRONT/src/styles/cardTokens.js`
- Tokens de Tailwind reutilizables para cards (wrapper, avatar, badges, botones).
- Unifica colores entre UserPreviewCard y UPPReviewCard.

### Login — Refactorización a Tailwind + responsive
- **Archivo:** `SIGEA-FRONT/src/pages/secure/login/login.jsx`
- **Eliminado:** `SIGEA-FRONT/src/pages/secure/secure.css`
- **Eliminado:** `SIGEA-FRONT/src/pages/secure/login/login.css`
- Eliminados imports CSS, todo a Tailwind.
- Errores de validación: `text-[#a22] text-[10px] absolute`.
- Se activó la visualización del `errorMsg` que antes estaba declarado pero nunca se mostraba.
- Responsive: `flex flex-col lg:flex-row` (columna en mobile, fila en desktop).

### Register — Refactorización a Tailwind + responsive
- **Archivo:** `SIGEA-FRONT/src/pages/secure/register/register.jsx`
- Eliminado import de `secure.css`.
- Todo a Tailwind con misma paleta que login.
- Grid de nombres: `grid grid-cols-[49%_49%] gap-x-[5px]`.
- Contenedor scrollable: `max-h-[90vh] overflow-y-auto`.
- Responsive: `flex flex-col lg:flex-row`.

### form-input.jsx — Refactorización a Tailwind
- **Archivo:** `SIGEA-FRONT/src/components/formElements/form-input.jsx`
- **Eliminado:** `SIGEA-FRONT/src/components/formElements/components_login.css`
- `InputLogReg`: input con `border border-[#015d3b]`, `focus:ring-2`.
- `LinkLog`: texto pequeño con hover verde.
- `ButtonLink`: botón verde con hover más oscuro.

### InputDisable — Refactorización a Tailwind
- **Archivo:** `SIGEA-FRONT/src/components/formElements/forms/InputDisable.jsx`
- **Eliminado:** `SIGEA-FRONT/src/components/formElements/forms/formsStyles.css`
- Label con `bg-[#c4b5b5]`, texto con `bg-[#ffffff61]`.

### Selectstyling — Refactorización a Tailwind
- **Archivo:** `SIGEA-FRONT/src/components/selecComponent/Selectstyling.jsx`
- **Eliminado:** `SIGEA-FRONT/src/components/selecComponent/select.css`
- Wrapper con `border border-[#015d3b] rounded-[5px] font-mono`.

### Tettles-Buttons — Refactorización a Tailwind
- **Archivo:** `SIGEA-FRONT/src/components/Tettles-Buttons/Title.jsx`
- **Archivo:** `SIGEA-FRONT/src/components/Tettles-Buttons/Buttons.jsx`
- **Eliminado:** `SIGEA-FRONT/src/components/Tettles-Buttons/tittle.css`
- Componente `Header`: wrapper `bg-[#aaaaaa39]`, logo `rounded-full`, botones en columna.
- Componente `Title`: wrapper `bg-[#005C39]`, texto `text-[#ffffffee]`.
- Componente `ButtonLink`: `bg-[#229e14]` con hover.

### adminContent — Limpieza de CSS
- **Archivo:** `SIGEA-FRONT/src/pages/Content/adminContent/DashboardContentAdmin.jsx`
- **Archivo:** `SIGEA-FRONT/src/pages/Content/adminContent/inventaryContentAdmin.jsx`
- **Eliminado:** `SIGEA-FRONT/src/pages/Content/adminContent/contentadmin.css`
- Se removió el import de `contentadmin.css` (clases no utilizadas en los componentes).

### userContent / AgroExtensionViews — Refactorización a Tailwind
- **Archivo:** `SIGEA-FRONT/src/pages/Content/userContent/AgroExtensionViews/FirstLogAgro.jsx`
- **Archivo:** `SIGEA-FRONT/src/pages/Content/userContent/AgroExtensionViews/ProductorView.jsx`
- **Eliminado:** `SIGEA-FRONT/src/pages/Content/userContent/AgroExtensionViews/AgroExtensionViews.css`
- `FirstLogAgro`: clases `.firstLogForm`, `.form-section-header`, `.form-user-data`, `.visit-req-form`, `.req-description`, `.title-firstLog`, `.paragraph-title` reemplazadas por Tailwind.
- `ProductorView`: `.content-productorView` → `bg-white min-h-[80vh] w-full rounded-xl p-5 m-5`.

### MenuCard — Refactorización a Tailwind
- **Archivo:** `SIGEA-FRONT/src/components/MenuCard/MenuCard.jsx`
- **Eliminado:** `SIGEA-FRONT/src/components/MenuCard/MenuCard.css`
- Card: `rounded-xl w-full lg:w-auto lg:min-w-[400px] h-[235px] bg-[#ddd9] border-2 border-[#0000001a]`.
- Logo wrapper: `flex items-center justify-center w-[70px] h-[70px] rounded-full`.
- Fix responsive: `min-w-[400px]` causaba desbordamiento en móvil. Se cambió a `w-full lg:w-auto lg:min-w-[400px]` para que ocupe todo el ancho en mobile y mantenga el tamaño mínimo en desktop.
- Link "ver mas": `hover:bg-[#41414116]` con transición.

### Layouts — Refactorización completa a Tailwind
- **Archivo:** `SIGEA-FRONT/src/layouts/adminlayout.jsx`
- **Archivo:** `SIGEA-FRONT/src/layouts/userLayout.jsx`
- **Archivo:** `SIGEA-FRONT/src/layouts/EmployeeLayout.jsx`
- **Eliminado:** `SIGEA-FRONT/src/layouts/layout.css`
- Wrapper: `flex min-h-screen` (reemplaza `.layout-wrapper`).
- Main-content: `flex-1 min-w-0 flex flex-col lg:flex-row flex-wrap bg-[#f1eee3] p-0 m-0 justify-center items-start`.
  - Mobile: `flex-col` (los hijos se apilan verticalmente).
  - Desktop (`lg:`): `lg:flex-row flex-wrap` (los hijos se alinean en fila con wrapping).
  - Sin padding ni margin, contenido centrado.

### TabList — Nuevo componente de switch con categorías
- **Archivo:** `SIGEA-FRONT/src/components/TabList/TabList.jsx`
- Componente tipo segmented control / switch de etiquetas.
- Props: `categories` (array de strings), `active` (categoría activa), `onChange` (callback al seleccionar).
- Categoría activa: fondo blanco con sombra y borde. Inactivas: texto gris con hover.
- Contenedor inline con `bg-gray-100 rounded-xl p-1`.

### Tab/Tab.jsx + tab.css — Eliminados
- **Archivo:** `SIGEA-FRONT/src/components/Tab/Tab.jsx`
- **Archivo:** `SIGEA-FRONT/src/components/Tab/tab.css`
- Componente `TabComponent` estaba vacío (sin implementación). Se eliminó junto con su CSS.

### SidebarData — Agregado rol Productores
- **Archivo:** `SIGEA-FRONT/src/components/sidebar/SidebarData.jsx`
- Las rutas `Principal`, `extension Agro` y `Pro Animal` ahora también aceptan el rol `'Productores'`.

### AgroExtentionContentUser — Lógica de productor implementada
- **Archivo:** `SIGEA-FRONT/src/pages/Content/userContent/AgroExtentionContentUser.jsx`
- Se agregó `useState`/`useEffect` para llamar a `checkEsProductor()` al montar.
- Si el usuario es productor → renderiza `ProductorView`.
- Si no es productor → renderiza `FirstLogAgro` con callback `onSolicitudCreada` que actualiza el estado.
- Mientras carga: muestra "Cargando...".

### agroService.js — Nuevo servicio de solicitudes
- **Archivo:** `SIGEA-FRONT/src/services/agroService.js`
- `checkEsProductor()` → `GET /api/usuarios/me/es_productor/`
- `crearSolicitud(observacion)` → `POST /api/visitas/solicitudes/crear/`
- `getSolicitudes()` → `GET /api/visitas/solicitudes/`

### Backend — Endpoint es_productor
- **Archivo:** `SIGEA/Usuarios/views.py`
  - Nueva vista `es_productor(request)` que verifica si el usuario autenticado tiene un registro en `Productores` con `Estado=True`.
- **Archivo:** `SIGEA/Usuarios/urls.py`
  - Nueva ruta: `me/es_productor/`.

### Backend — Modelo Solicitudes actualizado
- **Archivo:** `SIGEA/Visitas/models.py`
  - Campo `Usuario` cambiado de `ForeignKey(Funcionarios)` a `ForeignKey(Usuario, related_name="solicitudes")`.

### Backend — Endpoint crear_solicitud
- **Archivo:** `SIGEA/Visitas/views.py`
  - Nueva vista `crear_solicitud(request)`: crea una solicitud con `MotivoSolicitud_id=2`, `Estado_id=1`, `Usuario=request.user`.
  - También crea/obtiene un `Productores` para el usuario.
- **Archivo:** `SIGEA/Visitas/urls.py`
  - Nueva ruta: `solicitudes/crear/`.

### Backend — Seed data para Visitas
- **Archivo:** `SIGEA/seeders/management/commands/seed.py`
  - Agregados `MotivosSolicitudes` (id 1: Visita, id 2: Caracterización).
  - Agregados `Estados` (id 1: En Proceso, id 2: Aprobado, id 3: Rechazado).

### ProductorView — Integración con TabList y solicitudes
- **Archivo:** `SIGEA-FRONT/src/pages/Content/userContent/AgroExtensionViews/ProductorView.jsx`
- Se integró `TabList` con dos pestañas: "Mis UPs" y "Solicitudes".
- Al montar, fetch de solicitudes mediante `getSolicitudes()` filtradas por `Usuario === user.id`.
- Pestaña "Solicitudes": muestra loading, lista de cards con observación, estado y fecha, o mensaje vacío.

### Layouts — Ajustes de centrado finales
- **Archivo:** `SIGEA-FRONT/src/layouts/adminlayout.jsx`
- **Archivo:** `SIGEA-FRONT/src/layouts/EmployeeLayout.jsx`
- Main-content estandarizado: `flex-1 min-w-0 flex flex-col md:flex-row flex-wrap bg-[#f1eee3] justify-center items-center` — sin padding, centrado.
- **Archivo:** `SIGEA-FRONT/src/layouts/userLayout.jsx`
- Pendiente de estandarizar (aún conserva `p-2 justify-start items-start`).

### Fix: rutas de authService corregidas
- **Archivo:** `SIGEA-FRONT/src/services/authService.js`
- `currentUserService`: `/usuarios/me` → `/me/` (coincide con backend en `api/me/`).
- `logoutService`: `/usuarios/logout` → `/auth/logout/` (coincide con Knox en `api/auth/logout/`).

### Backend: UsuarioSerializer devuelve persona anidada
- **Archivo:** `SIGEA/Usuarios/serializers.py`
- Se agregó `to_representation()`: si `persona_id` existe, serializa el objeto `Personas` completo (nombres, apellidos, documento, etc.) en vez de solo el FK ID.

### Backend: VisitasViewSet filtrado por funcionario autenticado
- **Archivo:** `SIGEA/Visitas/views.py`
- Se agregó `permission_classes = [IsAuthenticated]`.
- Se agregó `get_queryset()`: si el usuario tiene `funcionarios` relacionado, filtra por `Funcionario=user.funcionarios`; si no (admin), devuelve todas.
- Se mantuvo `queryset = Visitas.objects.all()` para que el router de DRF pueda determinar el `basename` automáticamente.

### Frontend: contexto de usuario con /api/me/
- **Archivo:** `SIGEA-FRONT/src/context/dataUserContext.jsx`
- Al montar la app: si hay token en localStorage, llama a `/api/me/` para validar y obtener datos frescos (incluyendo persona anidada).
- Estado `loading`: evita renderizar rutas protegidas antes de completar la verificación.
- `login()`: almacena datos básicos inmediatamente, luego enriquece con `/api/me/` en segundo plano.
- `logout()`: limpia estado y localStorage.

### Frontend: roleRedirect corregido
- **Archivo:** `SIGEA-FRONT/src/utils/roleRedirect.js`
- Keys actualizadas a formato del backend: `Administradores`, `Funcionarios`, `Usuarios`, `Productores`.
- Nueva función `mapBackendRoleToSidebar()`: traduce rol backend (`Administradores`) a string del sidebar (`admin`).

### Frontend: ProtectedRoute — guardia de rutas
- **Archivo:** `SIGEA-FRONT/src/components/ProtectedRoute.jsx` (nuevo)
- Si `loading` → no renderiza nada (espera).
- Si no hay `user` → redirige a `/`.
- Si el rol no está en `allowedRoles` → redirige a `/`.

### Frontend: SigeaRoutes — rutas protegidas por rol
- **Archivo:** `SIGEA-FRONT/src/routes/SigeaRoutes.jsx`
- `/administrador/*` envuelto en `<ProtectedRoute allowedRoles={['Administradores']}>`.
- `/funcionario/*` envuelto en `<ProtectedRoute allowedRoles={['Funcionarios']}>`.
- `/usuario/*` envuelto en `<ProtectedRoute allowedRoles={['Usuarios', 'Productores']}>`.

### Frontend: Layouts simplificados
- **Archivo:** `SIGEA-FRONT/src/layouts/adminlayout.jsx`
- **Archivo:** `SIGEA-FRONT/src/layouts/EmployeeLayout.jsx`
- **Archivo:** `SIGEA-FRONT/src/layouts/userLayout.jsx`
- Se removió la prop `role` hardcodeada del `<Sidebar>`. Ahora el Sidebar deduce su propio rol del contexto.

### Frontend: Sidebar con datos del usuario logueado
- **Archivo:** `SIGEA-FRONT/src/components/SideBar/Sidebar.jsx`
- Lee rol del contexto vía `mapBackendRoleToSidebar()` en vez de prop.
- Muestra nombre completo de la persona (desde `user.persona.primer_nombre` + `primer_apellido`).
- Botón "Cerrar sesión" que llama a `logoutService()` + `context.logout()` + redirige a `/`.

### Frontend: FirstLogAgro muestra datos reales
- **Archivo:** `SIGEA-FRONT/src/pages/Content/userContent/AgroExtensionViews/FirstLogAgro.jsx`
- Reemplaza texto hardcodeado (`'nombre completo de persona'`, `'email@completode.com'`) por datos reales desde `user.persona` y `user.email`.

### Fix: ProtectedRoute — redirect loop por ruta protegida
- **Archivo:** `SIGEA-FRONT/src/components/ProtectedRoute.jsx`
- `!user` redirigía a `/usuario` (ruta también protegida), causando bucle infinito.
- Corregido a `Navigate to="/"` (ruta pública con Login).

### Fix: await faltante en currentUserService
- **Archivo:** `SIGEA-FRONT/src/services/authService.js`
- `currentUserService()` faltaba `await` en `api.get('/me/')`, resolvía con `undefined`.
- Esto sobrescribía el usuario del contexto con `undefined`, forzando redirect a login.

### Fix: mismatch de roles en Frontend completo
- **Archivo:** `SIGEA-FRONT/src/routes/SigeaRoutes.jsx` — `allowedRoles` corregidos a `['Administradores']`, `['Funcionarios']`, `['Usuarios', 'Productores']`.
- **Archivo:** `SIGEA-FRONT/src/components/SideBar/SidebarData.jsx` — Roles actualizados a valores del backend.
- **Archivo:** `SIGEA-FRONT/src/components/SideBar/Sidebar.jsx` — Cambiado `getRouteByRole(user?.rol)` por `user?.rol` directo. Eliminado import de `getRouteByRole`.

### Fix: overflow horizontal en UserPreviewCard
- **Archivo:** `SIGEA-FRONT/src/components/UserPreviewCard/UserPreviewCard.jsx`
- `w-screen` (100vw) causaba overflow horizontal en mobile. Cambiado a `w-full`.

### Fix: overflow en layout de usuario + sidebar sticky
- **Archivo:** `SIGEA-FRONT/src/layouts/userLayout.jsx`
- `overflow-x-hidden` movido del contenedor padre (rompía `sticky` del sidebar) al div de contenido `flex-1`.

### Backend: persona_info con nested serializer
- **Archivo:** `SIGEA/Usuarios/serializers.py`
- `PersonaBasicaSerializer` nuevo con solo `primer_nombre` y `primer_apellido`.
- `UsuarioSerializer`: campo `persona_info = PersonaBasicaSerializer(source='persona', read_only=True)`.
- `persona` original (ID) se conserva para writes.
- **Archivo:** `SIGEA-FRONT/src/components/SideBar/Sidebar.jsx`
- Sidebar actualizado a `user?.persona_info.primer_nombre`.

### Fix: conflicto de rutas en Visitas/urls.py
- **Archivo:** `SIGEA/Visitas/urls.py`
- La ruta personalizada `solicitudes/crear/` se evaluaba después de las rutas del router, y `solicitudes/{pk}/` capturaba `crear` como un ID, resultando en 405.
- Corregido: `path(...)` antes de `router.urls` para prioridad correcta.

### Backend: UsuarioSerializer — persona_info con nested serializer
- **Archivo:** `SIGEA/Usuarios/serializers.py`
- `PersonaBasicaSerializer` nuevo con solo `primer_nombre` y `primer_apellido`.
- Se agregó `persona_info = PersonaBasicaSerializer(source='persona', read_only=True)` en `UsuarioSerializer`.

### Frontend: FirstLogAgro — formulario conectado a crear_solicitud
- **Archivo:** `SIGEA-FRONT/src/pages/Content/userContent/AgroExtensionViews/FirstLogAgro.jsx`
- `onSubmit` del formulario conectado a `crearSolicitud()` del servicio.
- Estados `enviando` (deshabilita doble click), `error` (feedback visual).
- Al éxito, llama a `onSolicitudCreada()` para cambiar a `ProductorView`.
- `user?.persona` corregido a `user?.persona_info` por el nuevo serializer.

### UserRequest — Nuevo componente de card de solicitud
- **Archivo:** `SIGEA-FRONT/src/components/UserRequest/UserRequest.jsx`
- Card horizontal de 100px (`h-25`) con: número de solicitud (badge verde `#015d3b`), descripción, fecha y badge de estado.
- Estados mapeados: 1 → "En Proceso" (amarillo), 2 → "Aprobado" (verde), 3 → "Rechazado" (rojo).
- Clickable (`onClick`) para ver detalle. Hover con `border-[#015d3b]`.

### ProductorView — Integración de UserRequest
- **Archivo:** `SIGEA-FRONT/src/pages/Content/userContent/AgroExtensionViews/ProductorView.jsx`
- Reemplazado el div inline de solicitudes por el componente `UserRequest`.

### AlertRequestInfo — Popup de detalle de solicitud con SweetAlert2
- **Archivo:** `SIGEA-FRONT/src/components/AlertRequestInfo/AlertRequestInfo.jsx`
- Método estático `AlertRequestInfo.show(solicitud, user)` que abre un modal con SweetAlert2.
- Muestra: fecha, motivo, estado, observación, unidad productiva, datos del solicitante (nombre completo, email).
- Botón "Cerrar" con color `#015d3b` (verde institucional).

### ProductorView — Implementado popup en onClick
- **Archivo:** `SIGEA-FRONT/src/pages/Content/userContent/AgroExtensionViews/ProductorView.jsx`
- `onClick` de cada `UserRequest` ahora llama a `AlertRequestInfo.show(s, user)`.

### Fix: overflow de UserRequest en móvil
- **Archivo:** `SIGEA-FRONT/src/components/UserRequest/UserRequest.jsx`
- `w-auto` → `w-full max-w-full` para que las cards llenen el contenedor sin desbordar.
- **Archivo:** `SIGEA-FRONT/src/pages/Content/userContent/AgroExtensionViews/ProductorView.jsx`
- Contenedor: `min-w-19/20` (95%) → `w-full max-w-full`. El 95% + márgenes excedía el ancho de la pantalla en móvil.

### Fix: modal Nueva Solicitud — textarea ancho y select con borde
- **Archivo:** `SIGEA-FRONT/src/components/AgroModals/NuevaSolicitudModal.js`
- Popup más ancho: `width: 'min(92vw, 560px)'` para que la alerta se vea simétrica.
- Textarea: `width:100%; min-height:110px` con borde verde redondeado.
- Select: `width:100%` con borde `1.5px solid #015d3b`.

### Layouts — Estilado unificado con UserLayout
- **Archivo:** `SIGEA-FRONT/src/layouts/adminlayout.jsx`
- **Archivo:** `SIGEA-FRONT/src/layouts/EmployeeLayout.jsx`
- Main-content igualado a UserLayout: `flex-1 min-w-0 flex flex-col bg-[#f1eee3] p-2 m-0 justify-start items-center overflow-x-hidden sm:p-5`.
- Se eliminó `md:flex-row flex-wrap justify-center` de ambos.


### Alerta de vulnerabilidad 
- al realizar npm audit fix, aparece un mensaje  `React Router: RSC Mode CSRF Bypass Allows Action Execution Before 400 Response`, como se ve la alerta refleja unproblema en la fincionalidad RSC la cual no esta siendo utilizada en el proyecto.