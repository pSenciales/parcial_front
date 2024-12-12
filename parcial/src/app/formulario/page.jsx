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


const ARTICULO_BASE_API = process.env.NEXT_PUBLIC_ARTICULO_BASE_API;
const IMAGENES_BASE_API = process.env.NEXT_PUBLIC_IMAGE_BASE_API;
const MAPA_BASE_API = process.env.NEXT_PUBLIC_MAPA_BASE_API;


async function crearVersion(autor, nombre, coordenadas) {
  try {
    console.log(ARTICULO_BASE_API + "\t" + IMAGENES_BASE_API + "\n");
    const res = await axios.post(`${ARTICULO_BASE_API}/nuevo`, {
      autor: autor,
      nombre: nombre,
      coordenadas: coordenadas
    });
    if (res.status === 200 || res.status === 201) {
      return res.data;
    } else {
      throw new Error(`Error al crear la versión: ${res.statusText}`);
    }
  } catch (error) {
    console.error("Error en crearVersion:", error.message);
    return null;
  }
}

export default function VersionCreatePage() {
  const { data: session } = useSession(); // Maneja la sesión actual
  //console.log("Session data:", session);

  const [nombre, setNombre] = useState("");
  const [descripciones, setDescripciones] = useState([]);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [isError, setIsError] = useState(false);
  const [ubicacion, setUbicacion] = useState("");
  const router = useRouter();

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (images.length + imageFiles.length > 5) {
      setError("*Solo se pueden subir hasta 5 imágenes*");
      setIsError(true);
    } else {
      const newImages = imageFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...newImages]);
      setDescripciones((prev) => [...prev, ...newImages.map(() => "")]);
      setError("");
      setIsError(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (images.length + imageFiles.length > 5) {
      setError("*Solo se pueden subir hasta 5 imágenes*");
      setIsError(true);
    } else {
      const newImages = imageFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...newImages]);
      setDescripciones((prev) => [...prev, ...newImages.map(() => "")]); // Añade descripciones vacías
      setError("");
      setIsError(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleRemoveImage = (indexToRemove) => {
    setError("");
    setIsError(false);
    setImages((prev) => {
      const imageToRemove = prev[indexToRemove];
      URL.revokeObjectURL(imageToRemove.preview);
      return prev.filter((_, index) => index !== indexToRemove);
    });
    setDescripciones((prev) => prev.filter((_, index) => index !== indexToRemove)); // Elimina la descripción correspondiente
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    const autor = session.user.name;

    let coordenadas = null;
    if (ubicacion?.trim()) {
      try {
        const response = await axios.get(`${MAPA_BASE_API}/${encodeURIComponent(ubicacion)}`);
        if (response.status === 200 && response.data) {
          coordenadas = [{
            latitud: response.data.lat,
            longitud: response.data.lon,
          }];
        } else {
          console.error("No se encontraron coordenadas para la dirección proporcionada.");
          alert("No se pudieron obtener coordenadas para la dirección. Verifica la ubicación ingresada.");
          return;
        }
      } catch (error) {
        console.error("Error al obtener las coordenadas:", error);
        alert("Hubo un problema al procesar la ubicación ingresada.");
        return;
      }
    }
    if (coordenadas) {
      coordenadas = JSON.stringify(coordenadas);
      console.log("Coordenadas adjuntas: ", coordenadas);
    }
    try {

      const nuevaVersion = await crearVersion(autor, nombre, coordenadas);

      if (nuevaVersion) {
        try {
          // Subir imágenes
          const uploadPromises = images.map((img, index) => {
            const imageFormData = new FormData();
            imageFormData.append("id", nuevaVersion._id);
            imageFormData.append("descripcion", descripciones[index] || ""); // Añade la descripción
            imageFormData.append("image", img.file);

            return axios.post("https://parcial-back-seven.vercel.app/imagenes", imageFormData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });
          });

          // Esperar a que todas las imágenes se suban
          await Promise.all(uploadPromises);
          console.log("Todas las imágenes se han subido con éxito");

          // Revocar las URLs de previsualización
          images.forEach((img) => URL.revokeObjectURL(img.preview));
          router.push("/listar");

          // Redirigir al usuario
        } catch (error) {
          console.error("Error al subir las imágenes:", error);
          alert("Hubo un error al subir las imágenes.");
        }
      }
    } catch (error) {
      console.error("Error al crear la versión:", error);
      alert("Hubo un problema al crear la versión.");
    }
  }

  const handleMoveL = (index) => {
    if (index !== 0) {
      const newImages = [...images];

      const temp = newImages[index - 1];
      newImages[index - 1] = newImages[index];
      newImages[index] = temp;

      setImages(newImages);
    }
  }

  const handleBack = () => {
    router.back();
  };


  const handleMoveR = (index) => {
    if (index !== images.length - 1) {
      const newImages = [...images];

      const temp = newImages[index + 1];
      newImages[index + 1] = newImages[index];
      newImages[index] = temp;

      setImages(newImages);
    }
  }

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
        maxWidth: 500, // Ancho máximo del cuadro
        width: '90%', // Ancho relativo para adaptarse a pantallas pequeñas
      }}>
        <h1 className="text-2xl font-bold mb-3">Crear Nueva Versión</h1>
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            width: '100%',
            maxWidth: '400px',
          }}
        >
          <TextField label="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          <TextField
            label="Ubicación (opcional)"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            helperText="Ejemplo: Calle Mayor, 1, Madrid"
            multiline
          />
          <div className="grid grid-cols-1 gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button className={"px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 bg-blue-500 text-white hover:bg-blue-600"}>Añadir imágenes</Button>
              </SheetTrigger>
              <SheetContent
                side={"bottom"}
                className="h-1/4 transition-all duration-300 hover:h-2/6"
              >
                <SheetHeader>
                  <SheetTitle>Suelta las imágenes aquí</SheetTitle>
                  <SheetDescription>
                    Las imágenes se subirán al artículo
                  </SheetDescription>
                </SheetHeader>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-gray-400 rounded-md p-4 text-center cursor-pointer bg-gray-50 hover:bg-gray-100"
                  style={{ minHeight: "150px" }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    id="fileInput"
                    style={{ display: "none" }}
                    onChange={handleFileInputChange}
                  />
                  <Button
                    onClick={isError ? () => { } : () => document.getElementById("fileInput").click()}
                    className={`px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 ${isError
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                  >
                    {isError ? error : "Seleccionar imágenes"}
                  </Button>

                  <p className="text-gray-600 mt-2">O arrastra y suelta tus imágenes aquí</p>
                  {images.length > 0 && (
                    <div className="mt-4 flex gap-4 overflow-x-auto">
                      {images.map((img, index) => (
                        <div key={index} className="relative w-24 h-24 flex-shrink-0">
                          <img
                            src={img.preview}
                            alt={`uploaded-${index}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-200"
                            aria-label="Eliminar imagen"
                          >
                            <FaTrash className="text-red-600" />
                          </button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="absolute top-1 left-1 bg-white rounded-full p-1 shadow hover:bg-gray-200 ml-1">
                                <FaCog className="text-gray-600" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Añadir descripción</DialogTitle>
                                <DialogDescription>
                                  Asigna una descripción a la imagen
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor={`descripcion-${index}`} className="text-right">
                                    Descripción
                                  </Label>
                                  <Input
                                    id={`descripcion-${index}`}
                                    value={descripciones[index] || ""}
                                    onChange={(e) => {
                                      const nuevaDescripcion = e.target.value;
                                      setDescripciones((prev) => {
                                        const copia = [...prev];
                                        copia[index] = nuevaDescripcion; // Actualiza la descripción correspondiente
                                        return copia;
                                      });
                                    }}
                                    className="col-span-3"
                                  />
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <button
                            onClick={() => handleMoveR(index)}
                            className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-200"
                            aria-label="Intercambiar la imagen con la de la derecha"
                          >
                            <FaArrowRight className="text-black-600" />
                          </button>
                          <button
                            onClick={() => handleMoveL(index)}
                            className="absolute bottom-1 left-1 bg-white rounded-full p-1 shadow hover:bg-gray-200 ml-1"
                            aria-label="Intercambiar la imagen con la de la izquierda"
                          >
                            <FaArrowLeft className="text-black-600" />
                          </button>
                        </div>
                      ))}

                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            <Button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 bg-green-500 text-white hover:bg-green-600 text-center">
              Crear
            </Button>
            <Button
              type="button"
              onClick={handleBack}
              className="flex-1 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 bg-red-500 text-white hover:bg-red-600 text-center">
              Cancelar
            </Button>
          </div>

        </form>
      </Box>
    </Box>

  );
}
