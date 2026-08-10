import { RolUsuario } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";

import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/appError";
import { AUTH_CONFIG } from "./auth.constants";

type RegisterInput = {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
};

type LoginInput = {
  correo: string;
  password: string;
};

const usuarioSelect = {
  id: true,
  nombre: true,
  apellido: true,
  correo: true,
  rol: true,
  isActive: true,
} as const;

const serializeUsuario = (usuario: {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: RolUsuario;
  isActive: boolean;
}) => {
  return usuario;
};

const createToken = (userId: number) => {
  const options: SignOptions = {
    expiresIn: AUTH_CONFIG.jwtExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign({ sub: String(userId) }, AUTH_CONFIG.jwtSecret, options);
};

export const authService = {
  async canRegister() {
    const existingDueno = await prisma.usuario.findFirst({
      where: { rol: RolUsuario.DUENO },
      select: { id: true },
    });

    return { canRegister: !existingDueno };
  },

  async register(input: RegisterInput) {
    const existingDueno = await prisma.usuario.findFirst({
      where: { rol: RolUsuario.DUENO },
      select: { id: true },
    });

    if (existingDueno) {
      throw new AppError(
        "Ya existe un dueño registrado. No se permiten más registros.",
        403,
      );
    }

    const correo = input.correo.toLowerCase().trim();

    const existingUsuario = await prisma.usuario.findUnique({
      where: { correo },
      select: { id: true },
    });

    if (existingUsuario) {
      throw new AppError("Ya existe un usuario con ese correo.", 409);
    }

    const hashedPassword = await bcrypt.hash(
      input.password,
      AUTH_CONFIG.passwordSaltRounds,
    );

    const usuario = await prisma.usuario.create({
      data: {
        nombre: input.nombre.trim(),
        apellido: input.apellido.trim(),
        correo,
        password: hashedPassword,
        rol: RolUsuario.DUENO,
        isActive: true,
      },
      select: usuarioSelect,
    });

    return {
      token: createToken(usuario.id),
      user: serializeUsuario(usuario),
    };
  },

  async login(input: LoginInput) {
    const correo = input.correo.toLowerCase().trim();

    const usuario = await prisma.usuario.findUnique({
      where: { correo },
      select: {
        ...usuarioSelect,
        password: true,
      },
    });

    if (!usuario) {
      throw new AppError("Credenciales invalidas.", 401);
    }

    const isPasswordValid = await bcrypt.compare(
      input.password,
      usuario.password,
    );

    if (!isPasswordValid) {
      throw new AppError("Credenciales invalidas.", 401);
    }

    if (!usuario.isActive) {
      throw new AppError("Usuario inactivo.", 403);
    }

    if (usuario.rol !== RolUsuario.DUENO) {
      throw new AppError("Solo el dueño del blog puede iniciar sesión.", 403);
    }

    const { password: _password, ...safeUsuario } = usuario;

    return {
      token: createToken(safeUsuario.id),
      user: serializeUsuario(safeUsuario),
    };
  },

  async me(userId: number) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: usuarioSelect,
    });

    if (!usuario) {
      throw new AppError("Usuario autenticado no encontrado.", 401);
    }

    if (usuario.rol !== RolUsuario.DUENO) {
      throw new AppError("Acceso no autorizado.", 403);
    }

    return serializeUsuario(usuario);
  },
};
