"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import '../../styles/navbar.css'; // Importa el archivo CSS

export default function MyNavbar() {

  return (
    <nav className="navbar">
      <Link href="/" className="logo">MiApp</Link>
      <Link href="/listar">Listar</Link>
      <Link href="/formulario">Crear</Link>
      <Link href="/prueba">Mi Cuenta</Link>
      <button  className="ml-auto">
      </button>
    </nav>
  );
}
