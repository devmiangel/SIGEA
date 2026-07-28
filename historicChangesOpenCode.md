# Historial de Cambios — SIGEA

## 2026-07-28

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
  - Sin padding ni margin, contenido centrado y alineado al inicio.
