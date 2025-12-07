// src/hooks/useProfile.ts
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

export type AppProfile = {
  id: string;
  nombre: string | null;
  apellido: string | null;
  email: string | null;
  phone: string | null;
  id_perfil: number | null;
  avatar_url?: string | null;
  updated_at?: string | null;
  dni?: string | null;
  phone_verified?: boolean | null;
};

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(!!userId);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<boolean>(false);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    setNotFound(false);

    // 👇 Loguea sesión para confirmar hidratación
    const sessionSnap = await supabase.auth.getSession();

    const { data, error, status } = await supabase
      .from("tbl_usuarios")
      .select("id, nombre, apellido, email, phone, id_perfil, updated_at,dni, phone_verified")
      .eq("id", userId)
      .maybeSingle(); // 👈 NO lanza error si no hay fila; data = null


    if (error) {
      setError(error.message);
      setProfile(null);
    } else {
      if (!data) {
        // no hay fila -> probablemente aún no se insertó el perfil
        setNotFound(true);
        setProfile(null);
      } else {
        setProfile(data as AppProfile);
      }
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("realtime:tbl_usuarios:me")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tbl_usuarios", filter: `id=eq.${userId}` },
        () => fetchProfile()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchProfile]);

  return { profile, loading, error, notFound, refetch: fetchProfile };
}
