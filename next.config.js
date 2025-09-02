/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Ensure environment variables are loaded
  experimental: {
    esmExternals: 'loose',
  },
}

module.exports = nextConfig