"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import axios from "axios";
import Image from "next/image";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FaEye, FaTrashAlt, FaEdit } from "react-icons/fa";
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const ARTICULO_BASE_API = process.env.NEXT_PUBLIC_ARTICULO_BASE_API;
const IMAGENES_BASE_API = process.env.NEXT_PUBLIC_IMAGE_BASE_API;
const MAPA_BASE_API = process.env.NEXT_PUBLIC_MAPA_BASE_API;
const LOGS_BASE_API = process.env.NEXT_PUBLIC_LOGS_BASE_API;


export default function Landing() {
  const { data: session } = useSession(); // Maneja la sesión actual
  const [articulos, setArticulos] = useState([]);
  const [articuloSelected, setArticuloSelected] = useState();
  const [mapaSelected, setMapaSelected] = useState([]);
  const [editar, setEditar] = useState(false);



  const parseFecha = (fecha) => {
    const fechaParse = new Date(fecha);
    const opciones = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return fechaParse.toLocaleDateString('es-ES', opciones);
  }

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
  }, [articulos]);

  const handleBorrar = async (id) => {
    try {
      if (session) {
        const res = await axios.delete(`${ARTICULO_BASE_API}/articulo/${id}`);
        if (res.status === 200) {
          await fetcharticulos();
          setArticuloSelected(null);
          setMapaSelected(null);
        } else {
          console.error("Error fetching articulos:", res.status);
        }
      }
      else {
        Swal.fire({
          icon: "error",
          title: "Debe iniciar sesión para borrar",
          footer: '<a href="/">Quiero iniciar sesión</a>'
        });
      }
    } catch (error) {
      console.error("Error in fetcharticulos:", error.message);
    }

  };


  const handleVisualizar = async (index) => {
    try {
      const articulo = articulos[index];
      setEditar(false);
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

  const handleEditar = async (index) => {
    try {
      const articulo = articulos[index];
      setEditar(true);
      setArticuloSelected(articulo);
      console.log(JSON.stringify(articulo));
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


  useEffect(() => {

  }, [articuloSelected, mapaSelected, editar]);


  return (
    <div className="landing flex h-screen p-4 bg-gray-100">
      {/* Sección izquierda */}
      <div className="left-section flex-1 bg-gradient-to-r from-green-200 to-blue-200 rounded-3xl flex flex-col justify-center items-center text-center p-8 shadow-lg">
        <h1 className="text-5xl font-bold text-blue-800 mb-4 font-poppins">
          Articulos</h1>
        <ScrollArea className="bg-white h-72 w-9/12 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Autor</TableHead>
                <TableHead className="text-center">Nombre</TableHead>
                <TableHead className="text-center">Fecha</TableHead>
                <TableHead className="text-center">Visualizar</TableHead>
                <TableHead className="text-center">Editar</TableHead>
                <TableHead className="text-center">Borrar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articulos && articulos.length > 0 ? (
                articulos.map((articulo, index) => (
                  <TableRow key={articulo._id}>
                    <TableCell className="text-center">{articulo.autor}</TableCell>
                    <TableCell className="text-center">{articulo.nombre}</TableCell>
                    <TableCell className="text-center">{parseFecha(articulo.fecha)}</TableCell>
                    <TableCell className="text-center">
                      <button onClick={() => { handleVisualizar(index) }} className="flex-1 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 bg-blue-500 text-white hover:bg-blue-600">
                        <FaEye />
                      </button>
                    </TableCell>
                    <TableCell className="text-center">
                      <button onClick={() => { handleEditar(index) }} className="flex-1 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 bg-yellow-500 text-white hover:bg-yellow-600">
                        <FaEdit />
                      </button>
                    </TableCell>
                    <TableCell className="text-center">
                      <button onClick={() => { handleBorrar(articulo._id) }} className="flex-1 px-4 py-2 ml-2 rounded-lg font-semibold shadow-md transition-all duration-300 bg-red-500 text-white hover:bg-red-600">
                        <FaTrashAlt />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No hay artículos disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Sección derecha */}
      <div className="right-section flex-1 flex flex-col justify-center items-center p-8 bg-white rounded-3xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 font-poppins">
          Articulo seleccionado
        </h1>
        <div className="form w-full max-w-sm space-y-4">
          {articuloSelected ? (!editar ? (
            <div className="text-center">
              <Tabs defaultValue="account" className="w-full flex flex-col items-center">
                <TabsList>
                  <TabsTrigger value="account">Mapas</TabsTrigger>
                  <TabsTrigger value="password">Imágenes</TabsTrigger>
                  <TabsTrigger value="details">Detalles</TabsTrigger>
                </TabsList>

                <TabsContent
                  value="account"
                  className="transition-all duration-300 transform scale-100 opacity-100"
                >
                  <div className="flex justify-center items-center w-full">
                    {articuloSelected && articuloSelected.coordenadas.length > 0 ? (<Carousel className="w-full max-w-xs">
                      <CarouselContent>
                        {mapaSelected.map((mapa, index) => (
                          <CarouselItem key={index}>
                            <div className="p-1">
                              <Card>
                                <CardContent className="flex aspect-square items-center justify-center p-6">
                                  <iframe
                                    src={mapa}
                                    className="w-full h-64 rounded-md border"
                                    title="Mapa del Artículo"
                                  />
                                </CardContent>
                              </Card>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                    ) :
                      <Card className="w-full max-w-md mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-xl font-bold">
                            No se pudieron cargar mapas
                          </CardTitle>
                        </CardHeader>
                      </Card>}
                  </div>
                </TabsContent>

                <TabsContent
                  value="password"
                  className="transition-all duration-300 transform scale-100 opacity-100"
                >
                  <div className="flex justify-center items-center w-full">
                    {articuloSelected && articuloSelected.fotos.length > 0 ? (<Carousel className="w-full max-w-xs">
                      <CarouselContent>
                        {articuloSelected.fotos.map((foto, index) => (
                          <CarouselItem key={index}>
                            <div className="p-1">
                              <Card>
                                <CardContent className="flex aspect-square items-center justify-center p-6">
                                  <img
                                    src={foto.url}
                                    alt={`Foto ${index}`}
                                    className="rounded-lg"
                                  />
                                </CardContent>
                                <span>
                                  {foto.descripcion}
                                </span>
                              </Card>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                    ) :
                      <Card className="w-full max-w-md mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-xl font-bold">
                            Aun no hay fotos disponibles
                          </CardTitle>
                        </CardHeader>
                      </Card>}
                  </div>
                </TabsContent>

                <TabsContent
                  value="details"
                  className="transition-all duration-300 transform scale-100 opacity-100"
                >
                  <Card className="w-full max-w-md mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">
                        {articuloSelected.nombre}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        <strong>Autor:</strong> {articuloSelected.autor}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Fecha:</strong> {parseFecha(articuloSelected.fecha)}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

            </div>
          ) : (
            <div className="text-center">
            <form className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" type="text" defaultValue={articuloSelected.nombre} />
              </div>
              <div>
                <Label htmlFor="ubicaciones">Ubicaciones</Label>
                <Input id="ubicaciones" type="text" defaultValue={articuloSelected.coordenadas.map(coord => `${coord.latitud}, ${coord.longitud}`).join('; ')} />
              </div>
              <div>
                <Label htmlFor="descripciones">Descripciones de las imágenes</Label>
                <Input id="descripciones" type="text" defaultValue={articuloSelected.fotos.map(foto => foto.descripcion).join('; ')} />
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={handleGuardar} className="px-4 py-2 bg-green-500 text-white rounded-lg">Guardar</button>
                <button type="button" onClick={handleCancelar} className="px-4 py-2 bg-red-500 text-white rounded-lg">Cancelar</button>
              </div>
            </form>
          </div>
          )) : (
            <p className="text-center">Todavía no se ha seleccionado el articulo</p>
          )}
        </div>
      </div>
    </div>
  );
}
