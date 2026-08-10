# Blog Client

Frontend del proyecto Blog (React + Vite + TypeScript).

Trabaja junto con el repo **blog-api**. La API debe estar corriendo para que el cliente funcione completo.

---

## Requisitos

1. **Node.js** (LTS): https://nodejs.org/
2. **Git** o **GitHub Desktop**
3. Tener **blog-api** configurada y corriendo en el puerto `4000` (ver el README de `blog-api`)

---

## 1. Clonar el repositorio

Con GitHub Desktop: **File → Clone repository** y elige `blog-client`.

O con terminal:

```powershell
git clone https://github.com/TU_USUARIO/blog-client.git
cd blog-client
```

---

## 2. Instalar dependencias

```powershell
npm install
```

---

## 3. (Opcional) Configurar la URL de la API

Por defecto el cliente usa:

`http://localhost:4000/api`

Si necesitas otra URL, crea un archivo `.env` en la raíz de `blog-client`:

```env
VITE_API_URL=http://localhost:4000/api
```

El `.env` no se sube a Git.

---

## 4. Arrancar el frontend

1. En una terminal, arranca la API (`blog-api` → `npm run dev`).
2. En otra terminal, dentro de `blog-client`:

```powershell
npm run dev
```

Vite te mostrará la URL local (normalmente `http://localhost:5173`).

---

## Scripts útiles

```powershell
npm run dev         # Desarrollo
npm run build       # Build de producción
npm run preview     # Previsualizar el build
npm run lint        # ESLint
npm run typecheck   # TypeScript sin emitir archivos
```

---

## Flujo diario en equipo

1. `git pull` (o Sync en GitHub Desktop) en **blog-api** y **blog-client**
2. En `blog-api`:

```powershell
npm install
npx prisma migrate deploy
npm run dev
```

3. En `blog-client`:

```powershell
npm install
npm run dev
```

---

## Problemas comunes

| Problema | Qué revisar |
|---|---|
| Login / datos no cargan | ¿Está corriendo `blog-api`? |
| Error de conexión a la API | Revisa `VITE_API_URL` o que el puerto sea `4000` |
| Pantalla en blanco tras un pull | Corre `npm install` otra vez |

La base de datos **no se configura en este repo**. Todo lo de PostgreSQL y Prisma está en **blog-api** (lee ese README).
