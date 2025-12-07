// utils/validation.ts

/**
 * Valida un correo electrónico con las siguientes reglas:
 * - Debe contener "@" y un dominio válido (por ejemplo .com, .net, .org, etc.)
 * - No debe contener la palabra "prueba" en ninguna parte
 * - No debe tener espacios
 */
export function validateEmail(email: string): { valid: boolean; message?: string } {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) {
    return { valid: false, message: "El correo no puede estar vacío." };
  }

  if (trimmed.includes("prueba")) {
    return { valid: false, message: "No se permiten correos que contengan la palabra 'prueba'." };
  }

  // Expresión regular para validar el formato del correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  if (!emailRegex.test(trimmed)) {
    return { valid: false, message: "Por favor, ingresa un correo electrónico válido." };
  }

  return { valid: true };
}
