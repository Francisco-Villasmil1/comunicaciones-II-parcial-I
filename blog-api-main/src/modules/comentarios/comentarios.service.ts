import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/appError";

type ListComentariosInput = {
  page: number;
  limit: number;
  publicacionId?: number;
};

type CreateComentarioInput = {
  contenido: string;
  idUsuario: number;
  idPublicacion: number;
};

const mapComentarioToClient = (comentario: {
  id: number;
  contenido: string;
  fechaRegistro: Date;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
  };
  publicacion: {
    id: number;
    titulo: string;
  };
}) => ({
  id: comentario.id,
  contenido: comentario.contenido,
  fechaRegistro: comentario.fechaRegistro,
  usuario: comentario.usuario,
  usuarioNombre: `${comentario.usuario.nombre} ${comentario.usuario.apellido}`.trim(),
  publicacion: comentario.publicacion,
});

export const comentariosService = {
  async list({ page, limit, publicacionId }: ListComentariosInput) {
    const skip = (page - 1) * limit;

    const where = publicacionId ? { idPublicacion: publicacionId } : {};

    const [items, total] = await Promise.all([
      prisma.comentario.findMany({
        where,
        orderBy: { id: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          contenido: true,
          fechaRegistro: true,
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          publicacion: {
            select: {
              id: true,
              titulo: true,
            },
          },
        },
      }),
      prisma.comentario.count({ where }),
    ]);

    return {
      items: items.map(mapComentarioToClient),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },

  async create(input: CreateComentarioInput) {
    const publicacion = await prisma.publicacion.findUnique({
      where: { id: input.idPublicacion },
      select: { id: true },
    });

    if (!publicacion) {
      throw new AppError("Publicacion no encontrada.", 404);
    }

    const comentario = await prisma.comentario.create({
      data: {
        contenido: input.contenido.trim(),
        idUsuario: input.idUsuario,
        idPublicacion: input.idPublicacion,
      },
      select: {
        id: true,
        contenido: true,
        fechaRegistro: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        publicacion: {
          select: {
            id: true,
            titulo: true,
          },
        },
      },
    });

    return mapComentarioToClient(comentario);
  },

  async remove(id: number, userId: number, isDueno: boolean) {
    const comentario = await prisma.comentario.findUnique({
      where: { id },
      select: {
        id: true,
        idUsuario: true,
      },
    });

    if (!comentario) {
      throw new AppError("Comentario no encontrado.", 404);
    }

    if (!isDueno && comentario.idUsuario !== userId) {
      throw new AppError("No puedes eliminar este comentario.", 403);
    }

    await prisma.comentario.delete({
      where: { id },
    });

    return { ok: true };
  },
};
