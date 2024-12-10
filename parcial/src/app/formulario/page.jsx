"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Box, TextField} from '@mui/material';
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

async function crearVersion(formData) {
  try {
    const res = await axios.post(`${ARTICULO_BASE_API}/nuevo`, formData);
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
  const [nombre, setNombre] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [isError, setIsError] = useState(false);
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
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("nombre", nombre);
    

    try {
      const nuevaVersion = await crearVersion(formData);

      if (nuevaVersion) {
        try {
          // Subir imágenes
            const uploadPromises = images.map((img, index) => {
            const imageFormData = new FormData();
            imageFormData.append("id", nuevaVersion.version);
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

          // Redirigir al usuario
          router.push(`/articulo/${id}`);
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
          <div className="grid grid-cols-1 gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="blue">Añadir imágenes</Button>
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
                                    onChange={(e) => {
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
          <Button type="submit" variant="greenAceptar">
            Crear
          </Button>
          <Button type="button" onClick={handleBack} variant="redCancelar">
            Cancelar
          </Button>
        </form>
      </Box>
    </Box>

  );
}
