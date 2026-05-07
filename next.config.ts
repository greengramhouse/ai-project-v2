import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // เพิ่มส่วนนี้เพื่ออนุญาตให้ ngrok เข้าถึงระบบนักพัฒนาได้
  allowedDevOrigins: ["monorail-example-zesty.ngrok-free.dev"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
