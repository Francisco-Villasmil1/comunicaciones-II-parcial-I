import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/appError";

type ListPublicacionesInput = {
  page: number;
  limit: number;
  titulo?: string;
};

type ImagenInput = {
  url: string;
  descripcion?: string;
};

type UpsertPublicacionInput = {
  titulo: string;
  contenido?: string;
  idAutor: number;
  imagenes?: ImagenInput[];
};

const autorSelect = {
  id: true,
  nombre: true,
  apellido: true,
} as const;

const mapPublicacionToClient = (publicacion: {
  id: number;
  titulo: string;
  contenido: string | null;
  fechaCreacion: Date;
  fechaUpdate: Date;
  autor: { id: number; nombre: string; apellido: string };
  _count?: { comentarios: number };
  imagenes?: {
    id: number;
    url: string;
    descripcion: string | null;
  }[];
}) => ({
  id: publicacion.id,
  titulo: publicacion.titulo,
  contenido: publicacion.contenido,
  fechaCreacion: publicacion.fechaCreacion,
  fechaUpdate: publicacion.fechaUpdate,
  autor: publicacion.autor,
  autorNombre: `${publicacion.autor.nombre} ${publicacion.autor.apellido}`.trim(),
  totalComentarios: publicacion._count?.comentarios ?? 0,
  imagenes: publicacion.imagenes ?? [],
});

export const publicacionesService = {
  async list({ page, limit, titulo }: ListPublicacionesInput) {
    const skip = (page - 1) * limit;

    const where = titulo
      ? {
          titulo: {
            contains: titulo,
            mode: "insensitive" as const,
          },
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.publicacion.findMany({
        where,
        orderBy: { id: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          titulo: true,
          contenido: true,
          fechaCreacion: true,
          fechaUpdate: true,
          autor: { select: autorSelect },
          _count: {
            select: {
              comentarios: true,
            },
          },
        },
      }),
      prisma.publicacion.count({ where }),
    ]);

    return {
      items: items.map(mapPublicacionToClient),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },

  async getById(id: number) {
    const publicacion = await prisma.publicacion.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        contenido: true,
        fechaCreacion: true,
        fechaUpdate: true,
        autor: { select: autorSelect },
        imagenes: {
          select: {
            id: true,
            url: true,
            descripcion: true,
          },
          orderBy: { id: "asc" },
        },
        _count: {
          select: {
            comentarios: true,
          },
        },
      },
    });

    if (!publicacion) {
      throw new AppError("Publicacion no encontrada.", 404);
    }

    return mapPublicacionToClient(publicacion);
  },

  async create(input: UpsertPublicacionInput) {
    const publicacion = await prisma.publicacion.create({
      data: {
        titulo: input.titulo.trim(),
        contenido: input.contenido?.trim() || null,
        idAutor: input.idAutor,
        imagenes: input.imagenes?.length
          ? {
              create: input.imagenes.map((imagen) => ({
                url: imagen.url.trim(),
                descripcion: imagen.descripcion?.trim() || null,
              })),
            }
          : undefined,
      },
      select: {
        id: true,
        titulo: true,
        contenido: true,
        fechaCreacion: true,
        fechaUpdate: true,
        autor: { select: autorSelect },
        imagenes: {
          select: {
            id: true,
            url: true,
            descripcion: true,
          },
        },
        _count: {
          select: {
            comentarios: true,
          },
        },
      },
    });

    return mapPublicacionToClient(publicacion);
  },

  async update(id: number, input: Omit<UpsertPublicacionInput, "idAutor">) {
    const existingPublicacion = await prisma.publicacion.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingPublicacion) {
      throw new AppError("Publicacion no encontrada.", 404);
    }

    const publicacion = await prisma.publicacion.update({
      where: { id },
      data: {
        titulo: input.titulo.trim(),
        contenido: input.contenido?.trim() || null,
        imagenes: input.imagenes
          ? {
              deleteMany: {},
              create: input.imagenes.map((imagen) => ({
                url: imagen.url.trim(),
                descripcion: imagen.descripcion?.trim() || null,
              })),
            }
          : undefined,
      },
      select: {
        id: true,
        titulo: true,
        contenido: true,
        fechaCreacion: true,
        fechaUpdate: true,
        autor: { select: autorSelect },
        imagenes: {
          select: {
            id: true,
            url: true,
            descripcion: true,
          },
        },
        _count: {
          select: {
            comentarios: true,
          },
        },
      },
    });

    return mapPublicacionToClient(publicacion);
  },

  async addImagen(
    publicacionId: number,
    imagen: ImagenInput,
  ) {
    const publicacion = await prisma.publicacion.findUnique({
      where: { id: publicacionId },
      select: { id: true },
    });

    if (!publicacion) {
      throw new AppError("Publicacion no encontrada.", 404);
    }

    return prisma.imagen.create({
      data: {
        url: imagen.url.trim(),
        descripcion: imagen.descripcion?.trim() || null,
        idPublicacion: publicacionId,
      },
      select: {
        id: true,
        url: true,
        descripcion: true,
      },
    });
  },

  async removeImagen(publicacionId: number, imagenId: number) {
    const imagen = await prisma.imagen.findFirst({
      where: {
        id: imagenId,
        idPublicacion: publicacionId,
      },
      select: { id: true },
    });

    if (!imagen) {
      throw new AppError("Imagen no encontrada.", 404);
    }

    await prisma.imagen.delete({
      where: { id: imagenId },
    });

    return { ok: true };
  },
};
