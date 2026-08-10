-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('admin', 'profesor');

-- CreateEnum
CREATE TYPE "GeneroJuguete" AS ENUM ('niño', 'niña', 'unisex');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periodos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,

    CONSTRAINT "periodos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaturas" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "asignaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secciones" (
    "id" SERIAL NOT NULL,
    "id_asignatura" INTEGER NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "id_periodo" INTEGER NOT NULL,
    "numero_seccion" TEXT NOT NULL,

    CONSTRAINT "secciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_juguetes" (
    "id" SERIAL NOT NULL,
    "rango_edad" TEXT NOT NULL,
    "genero" "GeneroJuguete" NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "categorias_juguetes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donaciones" (
    "id" SERIAL NOT NULL,
    "cedula_estudiante" TEXT NOT NULL,
    "nombre_estudiante" TEXT NOT NULL,
    "id_seccion" INTEGER NOT NULL,
    "id_categoria" INTEGER NOT NULL,
    "descripcion_juguete" TEXT NOT NULL,
    "puntos_asignados" INTEGER NOT NULL,
    "id_registrado_por" INTEGER NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE INDEX "secciones_id_asignatura_idx" ON "secciones"("id_asignatura");

-- CreateIndex
CREATE INDEX "secciones_id_docente_idx" ON "secciones"("id_docente");

-- CreateIndex
CREATE INDEX "secciones_id_periodo_idx" ON "secciones"("id_periodo");

-- CreateIndex
CREATE INDEX "donaciones_id_seccion_idx" ON "donaciones"("id_seccion");

-- CreateIndex
CREATE INDEX "donaciones_id_categoria_idx" ON "donaciones"("id_categoria");

-- CreateIndex
CREATE INDEX "donaciones_id_registrado_por_idx" ON "donaciones"("id_registrado_por");

-- AddForeignKey
ALTER TABLE "secciones" ADD CONSTRAINT "secciones_id_asignatura_fkey" FOREIGN KEY ("id_asignatura") REFERENCES "asignaturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secciones" ADD CONSTRAINT "secciones_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secciones" ADD CONSTRAINT "secciones_id_periodo_fkey" FOREIGN KEY ("id_periodo") REFERENCES "periodos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donaciones" ADD CONSTRAINT "donaciones_id_seccion_fkey" FOREIGN KEY ("id_seccion") REFERENCES "secciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donaciones" ADD CONSTRAINT "donaciones_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categorias_juguetes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donaciones" ADD CONSTRAINT "donaciones_id_registrado_por_fkey" FOREIGN KEY ("id_registrado_por") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
