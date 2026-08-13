# Usuarios - Documentación

Aplicación encargada de la **autenticación, registro y roles** del sistema: catálogos (documentos, contactos, niveles educativos, sisben), personas, empresas, contactos, el usuario personalizado (login por email) y los roles de administradores, funcionarios y productores.

Estructura interna de la app:

```
Usuarios/
├── models.py               # Definición de las tablas (ORM)
├── serializers/            # Serializers de la API
│   ├── catalogs.py
│   ├── personas.py
│   ├── usuarios.py
│   └── roles.py
├── views/                  # ViewSets y vistas (CRUD / auth)
│   ├── catalogs.py
│   └── auth.py
├── auth_backend.py         # Backend de autenticación por email
├── urls.py                 # Registro de rutas (DefaultRouter + paths)
├── admin.py                # Registro en el panel de administración
└── migrations/             # Migraciones del ORM
```

> El usuario personalizado `Usuario` es el modelo de autenticación del proyecto (`AUTH_USER_MODEL = 'Usuarios.Usuario'` en `settings.py`).

---

## Models

Las tablas se generan a partir de `models.py` mediante el ORM de Django.

### Catálogos

| Tabla (Model) | Atributos | Relaciones (FK) |
|---|---|---|
| `TiposDocumentos` | `TipoDocumento` (CharField 100) | Sin FK |
| `TiposContactos` | `TipoContacto` (CharField 255) | Sin FK |
| `TiposNivelesEducativos` | `TipoNivelEducativo` (CharField) | Sin FK |
| `Sisben` | `NivelSisben` (CharField) | Sin FK |
| `Empresas` | `NombreEmpresa`, `NitEmpresa` (CharField, unique) | Sin FK |
| `Contactos` | `contacto` (CharField) | FK `TiposContactos` (PROTECT) |

### Personas

| Tabla (Model) | Atributos | Relaciones (FK) |
|---|---|---|
| `Personas` | `primer_nombre`, `primer_apellido` (CharField); `segundo_nombre`, `segundo_apellido` (CharField, nullable); `numero_documento` (CharField, unique); `fecha_nacimiento` (DateField) | FK `TiposDocumentos` (PROTECT); M2M `Contactos`, `TiposNivelesEducativos`, `Sisben`, `Empresas` (todas con `blank=True`) |

### Usuario y roles

| Tabla (Model) | Atributos | Relaciones (FK) |
|---|---|---|
| `Usuario` | Modelo `AbstractUser` personalizado. Sin `username`, `first_name` ni `last_name`; `email` (EmailField, unique, usado como campo de login); `Estado` (BooleanField) | OneToOne `Personas` (PROTECT, nullable). Manager: `UsuarioManager` (`create_user`, `create_superuser`) |
| `Funcionarios` | `Estado` (BooleanField) | OneToOne `Usuario` (PROTECT). En `save()` agrega al grupo `Funcionarios` |
| `Administradores` | `Estado` (BooleanField) | OneToOne `Usuario` (PROTECT). En `save()` agrega al grupo `Administradores` |
| `Productores` | `Estado` (BooleanField) | OneToOne `Usuario` (PROTECT). En `save()` agrega al grupo `Productores` |

> **Nota:** las tablas de roles (`Funcionarios`, `Administradores`, `Productores`) son referenciadas por FK desde otras aplicaciones (Inventario, Visitas, UPs).

---

## Serializers

### Catálogos (`serializers/catalogs.py`)

Todos `ModelSerializer` (`fields = '__all__'`):

`TiposDocumentosSerializer`, `TiposContactosSerializer`, `TiposNivelesEducativosSerializer`, `SisbenSerializer`, `EmpresasSerializer`, `ContactosSerializer`.

### Personas (`serializers/personas.py`)

| Serializer | Modelo | Descripción |
|---|---|---|
| `PersonasSerializer` | `Personas` | Expone todas las relaciones M2M anidadas en modo lectura (`Contactos`, `TipoNivelEducativo`, `NivelSisben`, `Empresa`). Valida que el primer nombre no sea igual al primer apellido y que la fecha de nacimiento sea anterior a hoy. |
| `PersonaBasicaSerializer` | `Personas` | Solo expone `primer_nombre` y `primer_apellido` (usado para anidar datos de la persona en otros serializers). |

### Usuarios (`serializers/usuarios.py`)

| Serializer | Modelo | Descripción |
|---|---|---|
| `UsuarioSerializer` | `Usuario` | `password` de solo escritura; expone `persona_info` y `rol` calculado (Administradores/Funcionarios/Productores/Usuarios). `create`/`update` gestionan el hash de la contraseña. Valida que el usuario tenga una persona asociada. |
| `LoginSerializer` | - | Serializer de login (email + password). Su `to_representation` devuelve `id`, `email` y el `rol` del usuario. |

### Roles (`serializers/roles.py`)

| Serializer | Modelo | Descripción |
|---|---|---|
| `FuncionariosSerializer` | `Funcionarios` | Expone `id`, `usuario`, `Estado`, `email` y `persona_info` (datos básicos de la persona anidados). |
| `AdministradoresSerializer` | `Administradores` | ModelSerializer completo. |
| `ProductoresSerializer` | `Productores` | ModelSerializer completo. |

---

## Views

### Catálogos (`views/catalogs.py`)

12 `ModelViewSet` con CRUD completo (`list`, `retrieve`, `create`, `update`, `partial_update`, `destroy`):

`TiposDocumentosViewSet`, `PersonasViewSet`, `EmpresasViewSet`, `UsuarioViewSet`, `FuncionariosViewSet`, `AdministradoresViewSet`, `ProductoresViewSet`, `TiposContactosViewSet`, `TiposNivelesEducativosViewSet`, `SisbenViewSet`, `ContactosViewSet`.

### Autenticación (`views/auth.py`)

| Vistas | Tipo | Descripción |
|---|---|---|
| `me` | `@api_view(['GET'])` | Devuelve el usuario autenticado (serializado con `UsuarioSerializer`). Requiere token. |
| `es_productor` | `@api_view(['GET'])` | Indica si el usuario autenticado es productor activo. Requiere token. |
| `register` | `@api_view(['POST'])` | Registro de usuario: crea `Personas`, contacto (correo), `Usuario` y asigna rol (Administradores/Funcionarios/Productores o grupo `Usuarios`). |
| `LoginViewSet` | `ViewSet` | `create` valida credenciales (email/password), autentica y devuelve `user` + `token` de Knox. |

---

## Endpoints (URLs)

Rutas registradas en `urls.py` bajo el prefijo `/api/usuarios/`, más rutas globales de `SIGEAsite/urls.py` y de Knox.

### Router (CRUD)

| Endpoint | Vista |
|---|---|
| `/api/usuarios/personas/` | `PersonasViewSet` |
| `/api/usuarios/usuarios/` | `UsuarioViewSet` |
| `/api/usuarios/empresas/` | `EmpresasViewSet` |
| `/api/usuarios/funcionarios/` | `FuncionariosViewSet` |
| `/api/usuarios/administradores/` | `AdministradoresViewSet` |
| `/api/usuarios/productores/` | `ProductoresViewSet` |
| `/api/usuarios/tiposDocumentos/` | `TiposDocumentosViewSet` |
| `/api/usuarios/tiposContactos/` | `TiposContactosViewSet` |
| `/api/usuarios/tiposNivelesEducativos/` | `TiposNivelesEducativosViewSet` |
| `/api/usuarios/sisben/` | `SisbenViewSet` |
| `/api/usuarios/contactos/` | `ContactosViewSet` |
| `/api/usuarios/login/` | `LoginViewSet` (POST) |

### Rutas adicionales

| Endpoint | Vista | Método |
|---|---|---|
| `/api/usuarios/me/es_productor/` | `es_productor` | GET |
| `/api/me/` | `me` | GET |
| `/api/register/` | `register` | POST |
| `/api/auth/` | Endpoints de Knox (`login`, `logout`, `logoutall`) | - |

---

## Admin

En `admin.py` se registran todos los modelos. Además:

- `PersonasAdmin`: `list_display` con nombres y documento, `search_fields` por documento/nombres y `filter_horizontal` para las M2M.
- `UsuarioAdmin`: `list_display` con email, persona y flags; `search_fields` por email y nombres; `list_filter` por flags.

## Backend de autenticación

`auth_backend.py` define `EmailAuthBackend`, que autentica buscando el usuario por **email** y validando su contraseña (sin usar username). Configurado como backend del proyecto en `settings.py`.
