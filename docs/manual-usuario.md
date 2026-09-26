# Manual de usuario — Barbería House of Cut

Este manual explica cómo usar la aplicación web. Por ahora cubre los casos de uso
implementados: **CU02 Iniciar Sesión** y **CU01 Gestionar Usuarios**.

---

## 0. Antes de empezar

Deben estar corriendo las tres piezas:

| Pieza | Cómo se levanta | Cómo sabes que está lista |
|---|---|---|
| PostgreSQL | Servicio del sistema (se inicia solo) | pgAdmin se conecta a la base `barber` |
| Backend | `./gradlew bootRun` (Windows: `gradlew.bat bootRun`) en `barberia-backend` | En la consola aparece `Started BackendApplication` |
| Frontend | `npm run dev` en `barberia-frontend` | En la consola aparece `http://localhost:5173` |

Luego abre **http://localhost:5173** en el navegador.

### ¿Con qué correo y contraseña entro la primera vez?

Con el **administrador inicial**, que el backend crea automáticamente la primera vez que arranca
con la base vacía. Sus datos salen del archivo **`.env` del backend**:

```
APP_SEED_ADMIN_EMAIL=...      ← este es el correo
APP_SEED_ADMIN_PASSWORD=...   ← esta es la contraseña
```

> El administrador se crea **solo una vez**. Si después cambias esos valores en el `.env`,
> el administrador ya existente **no cambia**: sigue valiendo la contraseña con la que se creó.

---

## 1. Iniciar sesión (CU02)

1. Abre http://localhost:5173. Si no has iniciado sesión, te lleva a la pantalla de login.
2. Escribe tu **Correo** y **Contraseña**.
3. Presiona **Ingresar**.

**Si los datos son correctos** entras a la pantalla de **Inicio**, que muestra
"Bienvenido, *tu nombre*" y tus roles.

**Si algo falla** aparece **"Error al ingresar"**. Es el mismo mensaje si:
- el correo no existe,
- la contraseña es incorrecta,
- la cuenta está deshabilitada.

Es así a propósito: no revela si un correo está registrado.

> El correo no distingue mayúsculas: `Gustavo.Laime@...` y `gustavo.laime@...` son el mismo.

### El menú lateral

El menú muestra **solo las opciones que tu rol puede usar**:

| Opción | Quién la ve |
|---|---|
| **Inicio** | Todos |
| **Usuarios** | Solo quien tiene el permiso de gestionar usuarios (Administrador) |

Si recargas la página (F5) sigues dentro. No hace falta volver a iniciar sesión.

### Cerrar sesión

Presiona **Salir**, arriba a la derecha. Vuelves a la pantalla de login y el
cierre queda registrado en la bitácora.

---

## 2. Gestionar usuarios (CU01)

Solo para el **Administrador**. En el menú, entra a **Usuarios**.

### 2.1 Ver la lista

La tabla muestra **Nombre, Correo, Roles, Estado** y **Acciones**, ordenada por nombre.

Arriba tienes filtros:
- **Buscar por nombre o correo**: escribe parte del nombre o del correo.
- **Estado**: Todos, Activo, Inactivo o Suspendido.
- **Rol**: Administrador, Recepcionista, Barbero o Cliente.

Abajo puedes cambiar las **Filas por página** (10, 20 o 50) y avanzar de página.

En la columna **Acciones** de cada fila:
- 👁 **Ver detalle**
- ✏️ **Editar**

### 2.2 Registrar un usuario

1. Presiona **Nuevo usuario** (arriba a la derecha).
2. Completa **Datos personales**:

   | Campo | ¿Obligatorio? | Regla |
   |---|---|---|
   | Nombre | Sí | Máximo 80 caracteres |
   | Correo | Sí | Formato válido y **no repetido** |
   | Contraseña | Sí | No puede estar vacía |
   | Teléfono | No | Solo números, `+`, espacios y guiones (máx. 15) |
   | Fecha de nacimiento | No | No puede ser una fecha futura |

3. Marca uno o más **Roles** (al menos uno).
4. Si marcaste **Administrador, Recepcionista o Barbero**, aparece la sección
   **Datos de empleado**:

   | Campo | ¿Obligatorio? | Opciones |
   |---|---|---|
   | Tipo de contrato | Sí | Comisionista / Asalariado |
   | Especialidad | No | Texto libre, por ejemplo "Degradados" |
   | Turno | No | Mañana (09:00-15:00), Tarde (15:00-21:00), Completo (09:00-21:00) o Sin turno |

   Si solo marcaste **Cliente**, esta sección no aparece.

5. Presiona **Registrar**.

**Resultado:** te lleva al detalle del usuario nuevo con el mensaje
**"Usuario registrado correctamente"**.

**Errores comunes:**
- *"El correo ya está registrado"*: ese correo ya lo usa otra persona (sin importar mayúsculas).
- *"Debe asignar al menos un rol válido"*: no marcaste ningún rol.
- Un campo en rojo con su mensaje: falta ese dato o tiene un formato incorrecto.

### 2.3 Consultar un usuario

En la lista, presiona 👁 **Ver detalle**. Verás sus datos personales, roles, estado, fecha de
creación y, si es empleado, sus **Datos de empleado** (contrato, especialidad y turno).

Desde aquí tienes los botones **Editar**, **Restablecer contraseña** y
**Deshabilitar** / **Activar**. Con **Volver al listado** regresas a la tabla.

### 2.4 Editar un usuario

1. Presiona **Editar**, desde la lista (✏️) o desde el detalle.
2. Cambia lo que necesites: datos personales, roles o datos de empleado.
   *La contraseña no se cambia aquí* (ver 2.5).
3. Presiona **Guardar cambios**.

**Resultado:** vuelves al detalle con el mensaje **"Usuario actualizado correctamente"**.

> Si a un cliente le cambias el nombre o el teléfono, también se actualiza en sus datos de cliente.

### 2.5 Restablecer la contraseña

Úsalo cuando un usuario olvidó su contraseña. No existe "¿Olvidaste tu contraseña?":
**la restablece el administrador**.

1. En el detalle del usuario, presiona **Restablecer contraseña**.
2. Escribe la **Nueva contraseña** y presiona **Guardar**.
3. Aparece **"Contraseña restablecida correctamente"**. Comunícale la nueva contraseña al usuario.

### 2.6 Deshabilitar un usuario

Úsalo cuando alguien deja de trabajar en la barbería. **Los usuarios nunca se borran**, solo se
deshabilitan, para no perder su historial.

1. En el detalle, presiona **Deshabilitar** (botón rojo).
2. Aparece: *"*Nombre* ya no podrá iniciar sesión. ¿Deseas continuar?"*
3. Presiona **Deshabilitar** para confirmar.

**Resultado:** el estado pasa a **Inactivo** y aparece "Usuario deshabilitado". Si esa persona
intenta entrar, verá "Error al ingresar".

**No está permitido:**
- Deshabilitarte **a ti mismo**.
- Deshabilitar al **único administrador activo**, porque el sistema quedaría sin nadie que lo administre.

### 2.7 Activar un usuario

1. En la lista, filtra por **Estado: Inactivo** para encontrarlo.
2. Entra a su detalle y presiona **Activar** (botón verde) → confirma con **Activar**.

**Resultado:** aparece "Usuario activado" y la persona puede volver a iniciar sesión.

---

## 3. Recorrido de prueba sugerido

Para comprobar que todo funciona, en unos 10 minutos:

1. Entra como **administrador** (credenciales del `.env` del backend).
2. **Registra un Barbero**, por ejemplo `barbero.prueba@houseofcut.bo`, con contraseña
   `Prueba123`, contrato Comisionista y turno Mañana.
3. **Registra un Cliente** con teléfono.
4. Intenta registrar otro usuario con `BARBERO.PRUEBA@houseofcut.bo` → error de correo repetido.
5. **Edita** el nombre del Cliente.
6. Presiona **Salir** y entra como el **Barbero**. Solo ve **Inicio**, sin "Usuarios".
7. Vuelve como administrador y **deshabilita** al Barbero.
8. Intenta entrar como el Barbero → **"Error al ingresar"**.
9. Como administrador, **actívalo** de nuevo y **restablece su contraseña**.
10. Entra como el Barbero con la contraseña nueva → funciona.

### Ver lo que quedó registrado (pgAdmin)

Base `barber` → **Query Tool**:

```sql
-- Bitácora: cada acción, quién la hizo y cuándo
SELECT b.accion, b.detalle, u.correo AS hecho_por, b.fecha_hora
FROM bitacora b JOIN usuario u ON u.id_usuario = b.usuario_id
ORDER BY b.fecha_hora DESC LIMIT 20;
```

Deberías ver `INICIO_SESION`, `CIERRE_SESION`, `USUARIO_CREAR`, `USUARIO_ACTUALIZAR`,
`USUARIO_DESHABILITAR`, `USUARIO_ACTIVAR` y `USUARIO_CAMBIAR_CONTRASENA`.

---

## 4. Problemas frecuentes

| Problema | Causa probable | Solución |
|---|---|---|
| "Error al ingresar" con el administrador | La contraseña no es la del `.env`, o el admin se creó con otra | Revisa `APP_SEED_ADMIN_PASSWORD`; si la cambiaste después, usa la original |
| La página no carga datos / error de conexión | El backend no está corriendo | Levanta el backend y espera `Started BackendApplication` |
| No veo la opción "Usuarios" | Tu usuario no es Administrador | Entra con el administrador |
| Error de CORS en la consola del navegador | El frontend no corre en el puerto 5173 | Usa `npm run dev` sin cambiar el puerto, o ajusta `CORS_ORIGIN` en el `.env` del backend |
