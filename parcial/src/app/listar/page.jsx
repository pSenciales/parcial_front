"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import axios from "axios";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaEye, FaTrashAlt, FaEdit } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const ARTICULO_BASE_API = process.env.NEXT_PUBLIC_ARTICULO_BASE_API;
const IMAGENES_BASE_API = process.env.NEXT_PUBLIC_IMAGE_BASE_API;
const MAPA_BASE_API = process.env.NEXT_PUBLIC_MAPA_BASE_API;

export default function Landing() {
  const { data: session } = useSession();
  const [articulos, setArticulos] = useState([]);
  const [articuloSelected, setArticuloSelected] = useState();
  const [mapaSelected, setMapaSelected] = useState([]);

  const parseFecha = (fecha) => {
    const fechaParse = new Date(fecha);
    const opciones = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return fechaParse.toLocaleDateString('es-ES', opciones);
  };

  const fetcharticulos = async () => {
    try {
      const res = await axios.get(`${ARTICULO_BASE_API}`);
      if (res.status === 200) {
        setArticulos(res.data);
      } else {
        console.error("Error fetching articulos:", res.status);
      }
    } catch (error) {
      console.error("Error in fetcharticulos:", error.message);
    }
  };

  useEffect(() => {
    fetcharticulos();
  }, []);

  const handleBorrar = async (id) => {
    try {
      if (session) {
        const res = await axios.delete(`${ARTICULO_BASE_API}/articulo/${id}`);
        if (res.status === 200) {
          await fetcharticulos();
          setArticuloSelected(null);
          setMapaSelected(null);
        } else {
          console.error("Error deleting articulo:", res.status);
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Debe iniciar sesión para borrar",
          footer: '<a href="/">Quiero iniciar sesión</a>'
        });
      }
    } catch (error) {
      console.error("Error in handleBorrar:", error.message);
    }
  };

  const handleVisualizar = async (index) => {
    try {
      const articulo = articulos[index];
      setArticuloSelected(articulo);

      const mapas = await Promise.all(
        articulo.coordenadas.map(async (coordenada) => {
          const res = await axios.get(`${MAPA_BASE_API}/${coordenada.latitud}/${coordenada.longitud}`);
          return res.data.iframeUrl;
        })
      );

      setMapaSelected(mapas);
    } catch (error) {
      console.error("Error al visualizar:", error);
    }
  };

  return (
    <div className="landing flex h-screen p-4 bg-gray-100">
      {/* Sección izquierda */}
      <div className="left-section flex-1 bg-gradient-to-r from-green-200 to-blue-200 rounded-3xl flex flex-col justify-center items-center text-center p-8 shadow-lg">
        <h1 className="text-5xl font-bold text-blue-800 mb-4 font-poppins">Artículos</h1>
        <ScrollArea className="bg-white h-72 w-9/12 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Autor</TableHead>
                <TableHead className="text-center">Fecha</TableHead>
                <TableHead className="text-center">Visualizar</TableHead>
                <TableHead className="text-center">Editar</TableHead>
                <TableHead className="text-center">Borrar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articulos.length > 0 ? (
                articulos.map((articulo, index) => (
                  <TableRow key={articulo._id}>
                    <TableCell className="text-center">{articulo.autor}</TableCell>
                    <TableCell className="text-center">{parseFecha(articulo.fecha)}</TableCell>
                    <TableCell className="text-center">
                      <button onClick={() => handleVisualizar(index)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        <FaEye />
                      </button>
                    </TableCell>
                    <TableCell className="text-center">
                      <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                        <FaEdit />
                      </button>
                    </TableCell>
                    <TableCell className="text-center">
                      <button onClick={() => handleBorrar(articulo._id)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                        <FaTrashAlt />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No hay artículos disponibles</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Sección derecha */}
      <div className="right-section flex-1 flex flex-col justify-center items-center p-8 bg-white rounded-3xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 font-poppins">Mapa seleccionado</h1>
        <div className="form w-full max-w-sm space-y-4">
          {articuloSelected ? (
            <Tabs defaultValue="mapas" className="w-full flex flex-col items-center">
              <TabsList>
                <TabsTrigger value="mapas">Mapas</TabsTrigger>
                <TabsTrigger value="imagenes">Imágenes</TabsTrigger>
              </TabsList>

              {/* Mapas */}
              <TabsContent value="mapas">
                {mapaSelected.length > 0 ? (
                  <Carousel className="w-full max-w-xs">
                    <CarouselContent>
                      {mapaSelected.map((mapa, index) => (
                        <CarouselItem key={index}>
                          <Card>
                            <CardContent className="flex items-center justify-center">
                              <iframe
                                src={mapa}
                                className="w-full h-64 rounded-md"
                                title={`Mapa ${index}`}
                              />
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                ) : (
                  <p>No hay mapas disponibles</p>
                )}
              </TabsContent>

              {/* Imágenes */}
              <TabsContent value="imagenes">
                {articuloSelected.coordenadas.some(coord => coord.fotos?.length > 0) ? (
                  <Carousel className="w-full max-w-xs">
                    <CarouselContent>
                      {articuloSelected.coordenadas.flatMap(coord => coord.fotos).map((foto, index) => (
                        <CarouselItem key={index}>
                          <Card>
                            <CardContent className="flex items-center justify-center">
                              <Image
                                src={foto.url}
                                alt={`Imagen ${index}`}
                                width={400}
                                height={300}
                                className="rounded-lg"
                              />
                            </CardContent>
                            <CardFooter>
                              <span className="text-sm">{foto.descripcion}</span>
                            </CardFooter>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                ) : (
                  <p>No hay imágenes disponibles</p>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <p className="text-center">Todavía no se ha seleccionado el artículo</p>
          )}
        </div>
      </div>
    </div>
  );
}
