BLOG SENCILLO
PARCIAL DE COMUNICACIONES II

============================================================
1. DESCRIPCION
============================================================

Este proyecto corresponde al parcial de Comunicaciones II.

Consiste en una aplicacion web sencilla de un blog desplegada
utilizando Docker y Docker Compose.

El proyecto esta dividido en tres servicios:

- Frontend: React, Vite y TypeScript.
- Backend: Node.js, Express y TypeScript.
- Base de datos: PostgreSQL.

Los tres servicios se levantan desde el archivo
docker-compose.yml.


============================================================
2. ESTRUCTURA DEL PROYECTO
============================================================

proyecto/
|
+-- blog-client-main/
|   +-- Dockerfile
|   +-- codigo del frontend
|
+-- blog-api-main/
|   +-- Dockerfile
|   +-- prisma/
|   +-- codigo del backend
|
+-- docker-compose.yml
+-- README.txt


============================================================
3. TECNOLOGIAS UTILIZADAS
============================================================

FRONTEND
- React
- Vite
- TypeScript
- React Router
- Material UI
- Tailwind CSS

BACKEND
- Node.js
- Express
- TypeScript
- Prisma
- JWT
- bcryptjs

BASE DE DATOS
- PostgreSQL 16

DESPLIEGUE
- Docker
- Docker Compose


============================================================
4. REQUISITOS
============================================================

Para ejecutar el proyecto se necesita:

- Docker Desktop o Docker Engine con Docker Compose.
- Git, si se va a clonar el proyecto desde el repositorio.

No es necesario instalar Node.js ni PostgreSQL directamente
en el equipo para ejecutar la aplicacion mediante Docker.


============================================================
5. CLONAR EL PROYECTO
============================================================

Clonar el repositorio:

    git clone <URL_DEL_REPOSITORIO>

Entrar a la carpeta del proyecto:

    cd comunicaciones-II-parcial-I-main

Reemplazar <URL_DEL_REPOSITORIO> por la URL del repositorio.


============================================================
6. EJECUTAR EL PROYECTO
============================================================

Desde la carpeta principal ejecutar:

    docker compose up --build

Para ejecutarlo en segundo plano:

    docker compose up --build -d

Docker construira las imagenes del frontend y del backend
y levantara los servicios definidos en docker-compose.yml.


============================================================
7. SERVICIOS Y PUERTOS
============================================================

FRONTEND
Puerto: 5173

    http://localhost:5173


BACKEND
Puerto: 4000

    http://localhost:4000


HEALTH CHECK DEL BACKEND

    http://localhost:4000/api/health


POSTGRESQL
Puerto: 5432


============================================================
8. BASE DE DATOS
============================================================

La base de datos utilizada es PostgreSQL.

Configuracion utilizada:

    Usuario: postgres
    Base de datos: blog_db
    Puerto: 5432

El backend se conecta a PostgreSQL utilizando el nombre
"database", que corresponde al servicio definido en
Docker Compose.

Conexion utilizada:

    postgresql://postgres:123456@database:5432/blog_db?schema=public


============================================================
9. PERSISTENCIA DE DATOS
============================================================

PostgreSQL utiliza un volumen Docker llamado:

    postgres_data

El volumen permite conservar los datos aunque el contenedor
de PostgreSQL se detenga o se vuelva a crear.

Para detener los servicios:

    docker compose down

Para volver a iniciar:

    docker compose up

Los datos permanecen porque el volumen no se elimina.

IMPORTANTE:

El siguiente comando elimina tambien el volumen y los datos
almacenados en PostgreSQL:

    docker compose down -v


============================================================
10. VARIABLES DE ENTORNO
============================================================

Las variables necesarias estan configuradas en
docker-compose.yml.

POSTGRES:

    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=123456
    POSTGRES_DB=blog_db

BACKEND:

    DATABASE_URL=postgresql://postgres:123456@database:5432/blog_db?schema=public
    PORT=4000
    JWT_SECRET=comunicacionII
    JWT_EXPIRES_IN=1d

Estas variables corresponden a la configuracion utilizada
para el entorno del parcial.


============================================================
11. MIGRACIONES
============================================================

El backend utiliza Prisma para trabajar con PostgreSQL.

Al iniciar el backend se ejecutan las migraciones mediante:

    npx prisma migrate deploy

Esto permite aplicar automaticamente la estructura de la
base de datos al levantar el proyecto.


============================================================
12. COMUNICACION ENTRE CONTENEDORES
============================================================

Los servicios utilizan una red Docker definida en
docker-compose.yml.

La comunicacion general es:

    Navegador
        |
        v
    Frontend :5173
        |
        v
    Backend :4000
        |
        v
    PostgreSQL :5432

El backend utiliza "database" para conectarse a PostgreSQL,
ya que ese es el nombre del servicio dentro de Docker Compose.


============================================================
13. AUTENTICACION
============================================================

El backend utiliza JWT para la autenticacion.

Las contrasenas son procesadas mediante bcryptjs.

Las peticiones que requieren autenticacion utilizan:

    Authorization: Bearer <token>

Tambien se comprueba el rol del usuario para las operaciones
correspondientes al propietario del blog.


============================================================
14. COMPROBAR LOS CONTENEDORES
============================================================

Para comprobar los contenedores activos:

    docker ps

Tambien se puede utilizar:

    docker compose ps


============================================================
15. VER LOS LOGS
============================================================

Para ver los logs de todos los servicios:

    docker compose logs

Para verlos en tiempo real:

    docker compose logs -f

Logs del frontend:

    docker compose logs frontend

Logs del backend:

    docker compose logs backend

Logs de la base de datos:

    docker compose logs database


============================================================
16. DETENER EL PROYECTO
============================================================

Detener los contenedores:

    docker compose stop

Detener y eliminar los contenedores:

    docker compose down

Detener, eliminar contenedores y eliminar los datos:

    docker compose down -v


============================================================
17. COMANDOS PRINCIPALES
============================================================

Construir y ejecutar:

    docker compose up --build

Ejecutar en segundo plano:

    docker compose up --build -d

Ver contenedores:

    docker ps

Ver estado de los servicios:

    docker compose ps

Ver logs:

    docker compose logs -f

Detener:

    docker compose down

Eliminar contenedores y volumen:

    docker compose down -v


============================================================
18. PRUEBA DEL DESPLIEGUE
============================================================

Para comprobar que todo funciona:

1. Ejecutar:

       docker compose up --build

2. Comprobar los contenedores:

       docker ps

3. Abrir el frontend:

       http://localhost:5173

4. Comprobar el backend:

       http://localhost:4000/api/health

5. Revisar los logs si es necesario:

       docker compose logs -f


============================================================
19. OBJETIVO DEL PROYECTO
============================================================

El objetivo principal es demostrar el despliegue de una
aplicacion web formada por varios servicios utilizando Docker
y Docker Compose.

El proyecto cuenta con:

- Un contenedor para el frontend.
- Un contenedor para el backend.
- Un contenedor para PostgreSQL.
- Una red Docker para la comunicacion entre servicios.
- Un volumen para conservar los datos de la base de datos.


============================================================
20. PARCIAL DE COMUNICACIONES II
============================================================

Tema:

Despliegue de Aplicacion Web Multi-Contenedor con Docker.

El proyecto demuestra el uso de Docker, Docker Compose,
contenedores, redes, variables de entorno y persistencia de
datos mediante volúmenes.
