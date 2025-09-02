/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  // Optimized for Vercel deployment
  experimental: {
    esmExternals: 'loose',
  },
}

module.exports = nextConfig