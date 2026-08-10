-- Migración del esquema anterior (donaciones/educación) al esquema del blog.

DROP TABLE IF EXISTS "donaciones" CASCADE;
DROP TABLE IF EXISTS "secciones" CASCADE;
DROP TABLE IF EXISTS "categorias_juguetes" CASCADE;
DROP TABLE IF EXISTS "asignaturas" CASCADE;
DROP TABLE IF EXISTS "periodos" CASCADE;
DROP TABLE IF EXISTS "usuarios" CASCADE;

DROP TYPE IF EXISTS "GeneroJuguete";
DROP TYPE IF EXISTS "RolUsuario";

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('dueno', 'lector');

-- CreateEnum
CREATE TYPE "TipoReaccion" AS ENUM ('me_gusta', 'me_encanta');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'lector',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publicaciones" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT,
    "id_autor" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_update" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publicaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagenes" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "descripcion" TEXT,
    "id_publicacion" INTEGER NOT NULL,

    CONSTRAINT "imagenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comentarios" (
    "id" SERIAL NOT NULL,
    "contenido" TEXT NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_publicacion" INTEGER NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comentarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reacciones" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoReaccion" NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_publicacion" INTEGER NOT NULL,

    CONSTRAINT "reacciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE INDEX "publicaciones_id_autor_idx" ON "publicaciones"("id_autor");

-- CreateIndex
CREATE INDEX "imagenes_id_publicacion_idx" ON "imagenes"("id_publicacion");

-- CreateIndex
CREATE INDEX "comentarios_id_usuario_idx" ON "comentarios"("id_usuario");

-- CreateIndex
CREATE INDEX "comentarios_id_publicacion_idx" ON "comentarios"("id_publicacion");

-- CreateIndex
CREATE INDEX "reacciones_id_usuario_idx" ON "reacciones"("id_usuario");

-- CreateIndex
CREATE INDEX "reacciones_id_publicacion_idx" ON "reacciones"("id_publicacion");

-- CreateIndex
CREATE UNIQUE INDEX "reacciones_id_usuario_id_publicacion_key" ON "reacciones"("id_usuario", "id_publicacion");

-- AddForeignKey
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_id_autor_fkey" FOREIGN KEY ("id_autor") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagenes" ADD CONSTRAINT "imagenes_id_publicacion_fkey" FOREIGN KEY ("id_publicacion") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_id_publicacion_fkey" FOREIGN KEY ("id_publicacion") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reacciones" ADD CONSTRAINT "reacciones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reacciones" ADD CONSTRAINT "reacciones_id_publicacion_fkey" FOREIGN KEY ("id_publicacion") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
