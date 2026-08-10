import { AppError } from "./appError";

export const parsePositiveInt = (
  value: unknown,
  fieldName: string,
  fallback?: number,
) => {
  if (value == null || value === "") {
    if (typeof fallback === "number") {
      return fallback;
    }

    throw new AppError(`${fieldName} es requerido.`, 400);
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(`${fieldName} debe ser un entero positivo.`, 400);
  }

  return parsed;
};
