/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true, domains: ["images.pexels.com"] },
};

module.exports = nextConfig;
