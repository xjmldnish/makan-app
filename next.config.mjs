/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // food photos are sent to the recognise Server Action as base64
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
