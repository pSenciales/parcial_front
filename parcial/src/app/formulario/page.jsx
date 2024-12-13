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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


const ARTICULO_BASE_API = process.env.NEXT_PUBLIC_ARTICULO_BASE_API;
const IMAGENES_BASE_API = process.env.NEXT_PUBLIC_IMAGE_BASE_API;
const MAPA_BASE_API = process.env.NEXT_PUBLIC_MAPA_BASE_API;


async function crearVersion(autor, coordenadas) {
  try {
    console.log(ARTICULO_BASE_API + "\t" + IMAGENES_BASE_API + "\n");
    const res = await axios.post(`${ARTICULO_BASE_API}/nuevo`, {
      autor: autor,
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
  const [ubicacionesParse, setUbicacionesParse] = useState([]);
  const [ubicacionesNumber, setUbicacionesNumber] = useState(0);
  const [imageNumber, setImageNumber] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState([]);



  const router = useRouter();

  useEffect(() => {
    const parsedUbicaciones = ubicacion.split(";").map((u) => u.trim()).filter(Boolean);
    setUbicacionesParse(parsedUbicaciones);
    setUbicacionesNumber(parsedUbicaciones.length);
    setSelectedIndex(Array.from({ length: parsedUbicaciones.length }, (_, i) => i));

    if (parsedUbicaciones.length < images.length) {
      setImages((prevImages) => prevImages.slice(0, parsedUbicaciones.length));
      setDescripciones((prevDescripciones) => prevDescripciones.slice(0, parsedUbicaciones.length));
    } else {
      setError("");
      setIsError(false);
    }
  }, [ubicacion, images]);


  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (images.length + imageFiles.length > ubicacionesNumber) {
      setError("*Solo se pueden subir una imagen por ubicación*");
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
      setImageNumber(images.length + imageFiles.length);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (images.length + imageFiles.length > ubicacionesNumber) {
      setError("*Solo se pueden subir una imagen por ubicación*");
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
      setImageNumber(images.length + imageFiles.length);
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

    let coordenadas = [];

    if (ubicacion?.trim()) {
      // Divide las ubicaciones por ';' y elimina espacios extra
      const ubicaciones = ubicacion.split(";").map((u) => u.trim());

      try {
        // Procesar cada ubicación y obtener sus coordenadas
        for (const lugar of ubicaciones) {
          if (lugar) {
            const response = await axios.get(`${MAPA_BASE_API}/${encodeURIComponent(lugar)}`);
            if (response.status === 200 && response.data) {
              coordenadas.push({
                latitud: response.data.lat,
                longitud: response.data.lon,
                lugar, // Guarda el nombre del lugar para referencia
              });
            } else {
              console.error(`No se encontraron coordenadas para la dirección: ${lugar}`);
              alert(`No se pudieron obtener coordenadas para la dirección: ${lugar}. Verifica la ubicación ingresada.`);
            }
          }
        }
      } catch (error) {
        console.error("Error al obtener las coordenadas:", error);
        alert("Hubo un problema al procesar las ubicaciones ingresadas.");
        return;
      }
    }

    if (coordenadas.length > 0) {
      const coordenadasJson = JSON.stringify(coordenadas);
      console.log("Coordenadas adjuntas: ", coordenadasJson);
    } else {
      console.log("No se obtuvieron coordenadas para las ubicaciones ingresadas.");
    }

    try {

      const nuevaVersion = await crearVersion(autor, coordenadas);

      if (nuevaVersion) {
        try {
          // Subir imágenes
          const uploadPromises = images.map((img, index) => {
            const imageFormData = new FormData();
            imageFormData.append("id", nuevaVersion._id);
            imageFormData.append("descripcion", descripciones[index] || ""); // Añade la descripción
            imageFormData.append("image", img.file);

            return axios.post(IMAGENES_BASE_API, imageFormData, {
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
              Debes iniciar sesión para crear un artículo.
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
        <h1 className="text-2xl font-bold mb-3">Crear Nuevo Mapa</h1>
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
          <TextField
            label="Ubicaciones"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            helperText="Separa las ubicaciones con ';'"
            multiline
            required
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
                    Las imágenes se subirán al mapa, ten en cuenta que puedes cambiar a qué ubicación pertenece la imagen
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
                                <DialogTitle>Asigna la ubicación</DialogTitle>
                                <DialogDescription>
                                  Cambia la ubicación de la imagen
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor={`ubicacion-${index}`} className="text-right">
                                    Ubicación
                                  </Label>
                                  <Select
                                    value={descripciones[index]}
                                      onValueChange={(value) => {
                                      const newDescripciones = [...descripciones];
                                      newDescripciones[index] = value; 
                                      setDescripciones(newDescripciones);
                                    }}
                                  >
                                    <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Selecciona una ubicación" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {ubicacionesParse.map((ubicacion, ubicacionIndex) => (
                                        <SelectItem select key={ubicacionIndex} value={ubicacion}>
                                          {ubicacion}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
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
