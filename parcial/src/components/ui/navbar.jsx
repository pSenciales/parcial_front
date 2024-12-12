"use client";

import React from 'react';
import { signIn, signOut, useSession, SessionProvider } from "next-auth/react";
import Link from 'next/link';
import '../../styles/navbar.css';

function NavbarContent() {
  const { data: session } = useSession();

  return (
    <nav className="navbar">
      <Link href="/" className="logo">MiApp</Link>
      <Link href="/listar">Listar</Link>
      <Link href="/formulario">Crear</Link>
      <Link href="/registro">Logs</Link>
      {session ? (
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white font-medium hover:bg-red-600 hover:scale-105 transform transition-transform duration-200 ease-in-out rounded-full py-3 shadow-md focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Cerrar Sesión
        </button>
      ) : (
        <button
          onClick={() => signIn("github")}
          className="ml-auto bg-gray-900 text-white hover:bg-gray-700 flex items-center justify-center space-x-2 rounded-md py-2 px-4 shadow-md transition-all duration-200"
        >
           <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 16"
            className="w-5 h-5"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.2 1.87.85 2.33.65.07-.52.28-.85.51-1.05-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.1 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.09.16 1.9.08 2.1.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span>Iniciar sesión</span>
        </button>
      )}
    </nav>
  );
}

export default function MyNavbar() {
  return (
    <SessionProvider>
      <NavbarContent />
    </SessionProvider>
  );
}
