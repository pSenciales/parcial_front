"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Box, TextField } from '@mui/material';
import { FaTrash, FaCog, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
]

const ARTICULO_BASE_API = process.env.NEXT_PUBLIC_ARTICULO_BASE_API;
const IMAGENES_BASE_API = process.env.NEXT_PUBLIC_IMAGE_BASE_API;
const MAPA_BASE_API = process.env.NEXT_PUBLIC_MAPA_BASE_API;
const LOGS_BASE_API = process.env.NEXT_PUBLIC_LOGS_BASE_API;



export default function VersionCreatePage() {
  const { data: session } = useSession(); // Maneja la sesión actual
  const [logs, setLogs] = useState([]);

  const parseFecha = (fecha) => {
    const fechaParse =  new Date(fecha);
    const opciones = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return fechaParse.toLocaleDateString('es-ES', opciones);
  } 

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
    <Box className="bg-gradient-to-r from-green-200 to-blue-200"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Asegura que el contenido esté centrado horizontalmente
        justifyContent: 'top', // Centra el contenido verticalmente
        height: '100vh', // Altura completa de la ventana
        p: 4, // Padding general
      }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'white', // Fondo blanco para el cuadro
        boxShadow: 3, // Sombra para darle un efecto "elevado"
        p: 4, // Espaciado interno
        borderRadius: 2, // Bordes redondeados
        maxWidth: 900, // Ancho máximo del cuadro
        width: '100%', // Ancho relativo para adaptarse a pantallas pequeñas
      }}>
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
                <>
                  <TableRow>
                    <TableCell className="font-medium">{parseFecha(log.timestamp)}</TableCell>
                    <TableCell>{log.usuario}</TableCell>
                    <TableCell>{log.token}</TableCell>
                    <TableCell className="text-right">{parseFecha(log.caducidad)}</TableCell>
                  </TableRow>
                </>
              ))}
              <Separator></Separator>
            </TableBody>
          </Table>
        </ScrollArea>
      </Box>
    </Box>
  );
}
