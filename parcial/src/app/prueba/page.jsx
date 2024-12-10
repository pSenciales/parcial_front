// Ejemplo en una vista diferente (ej. /dashboard)
"use client"
import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Cargando...</div>;
  }

  if (!session) {
    return <div>No estás autenticado</div>;
  }

  return (
    <div>
      <h1>Bienvenido, {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
      {/* Otros detalles de la sesión */}
    </div>
  );
}
