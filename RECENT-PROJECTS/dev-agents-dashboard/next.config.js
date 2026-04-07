/** @type {import('next').NextConfig} */
const basePath = '/projects/dev-agents-dashboard'
const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
