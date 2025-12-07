import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export default function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // 👈 nuevo estado
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user);
      setLoading(false);
    });

    // Escuchar cambios de sesión
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user);
      setLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  return { session, user, loading }; // 👈 ahora sí devolvemos loading
}
