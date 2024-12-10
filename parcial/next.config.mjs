/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**", // Aceptar cualquier ruta bajo este dominio
      },
    ],
  },
};

export default nextConfig;
