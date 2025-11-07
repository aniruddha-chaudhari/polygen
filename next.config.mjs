/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Empty turbopack config to silence the warning and allow webpack config
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Don't run workers on the server
    if (!isServer) {
      config.output.globalObject = 'self';
    }
    return config;
  },
}

export default nextConfig
