// src/store/useSignupDraft.ts
import { create } from "zustand";

export type Draft = {
  nombre: string;
  apellido: string;
  telefono: string;   // tel RAW (8 dígitos)
  correo: string;     // email en minúsculas
  password: string;

  // 👇 Nuevos (opcionales) para reusar OTP activo
  otpEventId?: string;
  otpExpiresAt?: string; // ISO string
};

type State = {
  draft: Draft | null;

  /**
   * Fusiona con el draft actual.
   * - Si antes llamabas setDraft(draftCompleto), sigue funcionando.
   * - Ahora también puedes pasar setDraft({ otpEventId, otpExpiresAt }) para actualizar parcialmente.
   */
  setDraft: (d: Partial<Draft> | Draft) => void;

  /** Reemplaza TODO el draft (equivalente al comportamiento viejo si quieres mantenerlo explícito) */
  replaceDraft: (d: Draft) => void;

  clearDraft: () => void;
};

export const useSignupDraft = create<State>((set) => ({
  draft: null,

  setDraft: (d) =>
    set((state) => {
      // Si no hay draft previo y te pasan parcial, evitamos dejar un objeto inválido:
      // En ese caso simplemente guardamos lo que venga; el front terminará de completarlo.
      if (!state.draft) {
        return { draft: { ...(d as Draft) } };
      }
      // Si hay draft previo, fusiona campos (mantiene lo existente y actualiza lo nuevo)
      return { draft: { ...state.draft, ...d } as Draft };
    }),

  replaceDraft: (d) => set({ draft: d }),

  clearDraft: () => set({ draft: null }),
}));
