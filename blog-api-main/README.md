# Blog API

Backend del proyecto Blog (Express + TypeScript + Prisma + PostgreSQL).

Este README está pensado para alguien que **nunca ha usado Prisma ni `psql`**.

---

## Qué es cada cosa (en corto)

| Herramienta | Para qué sirve |
|---|---|
| **PostgreSQL** | La base de datos (donde se guardan usuarios, etc.) |
| **pgAdmin** | Programa visual para crear/ver la base (viene con PostgreSQL) |
| **Prisma** | Traduce el código a tablas SQL y aplica cambios sin escribir SQL a mano |
| **Prisma Studio** | Pantalla visual para ver y editar datos (recomendado si no sabes SQL) |
| **`.env`** | Archivo local con contraseñas y conexiones (nunca se sube a Git) |

---

## Requisitos previos

1. **Node.js** (LTS): https://nodejs.org/
2. **Git** o **GitHub Desktop**
3. **PostgreSQL** (incluye pgAdmin): https://www.postgresql.org/download/windows/

Durante la instalación de PostgreSQL:
- Anota el usuario (casi siempre `postgres`)
- Anota la contraseña que elegiste
- Deja el puerto en `5432` (valor por defecto)

Comprueba que el servicio esté corriendo: en Windows busca *Services* → `postgresql-x64-...` → debe estar **Running**.

---

## 1. Clonar el repositorio

Con GitHub Desktop: **File → Clone repository** y elige `blog-api`.

O con terminal:

```powershell
git clone https://github.com/TU_USUARIO/blog-api.git
cd blog-api
```

---

## 2. Crear la base de datos (sin saber `psql`)

### Opción recomendada: pgAdmin

1. Abre **pgAdmin**.
2. Conéctate al servidor (te pedirá la contraseña de PostgreSQL).
3. Clic derecho en **Databases** → **Create** → **Database...**
4. En **Database**: escribe `blog_db`
5. **Save**

Listo. Ya existe la base vacía.

### Opción alternativa: `psql` (terminal)

Si instalaste PostgreSQL 18 en Windows, `psql` suele estar aquí:

`C:\Program Files\PostgreSQL\18\bin\psql.exe`

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE blog_db;"
```

Te pedirá la contraseña. Si la base ya existe, verás un error: puedes ignorarlo.

---

## 3. Configurar el archivo `.env`

1. En la carpeta `blog-api`, copia `.env.example` y renómbralo a `.env`.
2. Edita `.env` con tus datos reales:

```env
PORT=4000
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/blog_db?schema=public"
```

Reemplaza:
- `postgres` → tu usuario de PostgreSQL (casi siempre es `postgres`)
- `TU_PASSWORD` → la contraseña que pusiste al instalar PostgreSQL
- `blog_db` → el nombre de la base que creaste

**Importante:** el archivo `.env` es solo tuyo. No lo subas a Git ni lo compartas en el chat del equipo si tiene contraseñas.

---

## 4. Instalar dependencias y crear las tablas

En PowerShell, dentro de `blog-api`:

```powershell
npm install
npx prisma generate
npx prisma migrate deploy
```

Qué hace cada comando:
- `npm install` → descarga librerías del proyecto
- `npx prisma generate` → prepara el cliente de Prisma para el código
- `npx prisma migrate deploy` → crea las tablas en `blog_db` usando las migraciones del repo

Si todo salió bien, la base ya tiene la estructura del proyecto (todavía sin datos, o con los que cargues después).

---

## 5. Arrancar la API

```powershell
npm run dev
```

Debería decir algo como: `Blog API escuchando en el puerto 4000`.

Prueba rápida en el navegador:

`http://localhost:4000/api/health`

---

## 6. Ver y alterar datos (sin SQL): Prisma Studio

Con la API en la misma carpeta (puedes abrirlo en otra terminal):

```powershell
npx prisma studio
```

Se abre una web (normalmente `http://localhost:5555`) donde puedes:
- Ver tablas
- Crear / editar / borrar filas
- Revisar que tus cambios quedaron guardados

Esto es lo más fácil si no conoces `psql`.

---

## 7. Si cambias el esquema de la base (estructura)

Ejemplo: agregar un campo nuevo en `prisma/schema.prisma`.

1. Edita `prisma/schema.prisma`
2. Crea y aplica una migración en desarrollo:

```powershell
npx prisma migrate dev --name descripcion_corta_del_cambio
```

3. Regenera el cliente (a veces `migrate dev` ya lo hace):

```powershell
npx prisma generate
```

4. Sube el cambio a Git (incluyendo la carpeta nueva dentro de `prisma/migrations/`) para que tu compañero también lo reciba.

Tu compañero, después de hacer `git pull`, solo necesita:

```powershell
npx prisma migrate deploy
```

---

## Scripts útiles

```powershell
npm run dev              # API en modo desarrollo (se reinicia al guardar)
npm run build            # Compila TypeScript
npm run start            # Corre la versión compilada
npm run prisma:generate  # Genera el cliente Prisma
npm run prisma:migrate   # migrate dev (crear cambios en desarrollo)
npm run prisma:deploy    # Aplicar migraciones existentes (tu compañero usa esto)
npm run prisma:studio    # Abrir Prisma Studio
```

Equivalente directo:

```powershell
npx prisma studio
npx prisma migrate status
```

---

## Problemas comunes

| Problema | Qué revisar |
|---|---|
| `DATABASE_URL no esta definida` | Falta el archivo `.env` o el nombre no es exactamente `.env` |
| `Authentication failed` | Usuario/contraseña mal en `DATABASE_URL` |
| `database "blog_db" does not exist` | Crear la base en pgAdmin (paso 2) |
| `Can't reach database server` | Servicio PostgreSQL apagado; puerto distinto de `5432` |
| Tablas vacías / no existen | Correr `npx prisma migrate deploy` |

---

## Colaboración

- Cada persona tiene su **propia** base `blog_db` en su PC.
- No se comparte el `.env`.
- Sí se comparten el código y las migraciones de Prisma por Git.
- Después de cada `git pull` en `blog-api`, conviene correr:

```powershell
npm install
npx prisma migrate deploy
```
