"use client";
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Box } from '@mui/material';
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableHeader,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

const LOGS_BASE_API = process.env.NEXT_PUBLIC_LOGS_BASE_API;

export default function VersionCreatePage() {
  const { data: session } = useSession(); // Maneja la sesión actual
  const [logs, setLogs] = useState([]);

  const parseFecha = (fecha) => {
    const fechaParse = new Date(fecha);
    const opciones = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return fechaParse.toLocaleDateString('es-ES', opciones);
  };

  useEffect(() => {
    const fetchlogs = async () => {
      try {
        const res = await axios.get(LOGS_BASE_API);
        if (res.status === 200) {
          setLogs((res.data).reverse());
        } else {
          console.error("Error fetching logs:", res.status);
        }
      } catch (error) {
        console.error("Error in fetchLogs:", error.message);
      }
    };

    fetchlogs();
  }, []);

  return (
    <Box
      className="bg-gradient-to-r from-green-200 to-blue-200"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'top',
        height: '100vh',
        p: 4,
      }}
    >
      {/* Superposición borrosa si no hay sesión */}
      {!session && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <Box
            sx={{
              textAlign: 'center',
              bgcolor: 'white',
              p: 4,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <p className="text-lg font-medium text-gray-700 mb-4">
              Debes iniciar sesión para ver los datos.
            </p>
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
          </Box>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'white',
          boxShadow: 3,
          p: 4,
          borderRadius: 2,
          maxWidth: 900,
          width: '100%',
        }}
      >
        <ScrollArea className="h-72 w-100 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Timestamp</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Token</TableHead>
                <TableHead className="text-right">Caducidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{parseFecha(log.timestamp)}</TableCell>
                  <TableCell>{log.usuario}</TableCell>
                  <TableCell>{log.token}</TableCell>
                  <TableCell className="text-right">{parseFecha(log.caducidad)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Box>
    </Box>
  );
}
