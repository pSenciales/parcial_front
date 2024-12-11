"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function Landing() {
  const { data: session } = useSession(); // Maneja la sesión actual

  return (
    <div className="landing flex h-screen p-4 bg-gray-100">
      {/* Sección izquierda */}
      <div className="left-section flex-1 bg-gradient-to-r from-green-200 to-blue-200 rounded-3xl flex flex-col justify-center items-center text-center p-8 shadow-lg">
        <h1 className="text-5xl font-bold text-blue-800 mb-4 font-poppins">
          LaWiki
        </h1>
        <p className="text-xl text-gray-700 italic font-poppins">
          El saber de todos, para todos.
        </p>
        <div className="mt-8 flex space-x-4 text-2xl">
          <span>📖</span>
          <span>🖋️</span>
          <span>🌐</span>
        </div>

        <div className="mt-8">
          <Image
            src="/images/lawiki-character.png"
            alt="Ilustración de LaWiki"
            width={400}
            height={300}
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Sección derecha */}
      <div className="right-section flex-1 flex flex-col justify-center items-center p-8 bg-white rounded-3xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 font-poppins">
          Inicia Sesión
        </h2>
        <div className="form w-full max-w-sm space-y-4">
          {session ? (
            
            <div className="text-center">
              <p className="text-lg mb-4">
                Bienvenido, <strong>{session.user.name}</strong>!
              </p>
              <Image
                src={session.user.image}
                alt="Avatar del usuario"
                width={80}
                height={80}
                className="rounded-full mb-4"
              />
              <button
                onClick={() => signOut()}
                className="w-full bg-red-500 text-white hover:bg-red-600 hover:scale-105 transform transition-all duration-200 rounded-full py-2 shadow-md"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="w-full bg-gray-900 text-white hover:bg-gray-700 flex items-center justify-center space-x-2 rounded-md py-2 px-4 shadow-md transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 16 16"
                className="w-5 h-5"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.2 1.87.85 2.33.65.07-.52.28-.85.51-1.05-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.1 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.09.16 1.9.08 2.1.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <span>Iniciar sesión con GitHub</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
