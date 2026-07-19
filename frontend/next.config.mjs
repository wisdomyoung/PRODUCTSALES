/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backendBase = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8080';

    return [
      {
        source: '/api/:path*',
        destination: `${backendBase}/api/:path*`
      }
    ];
  }
};

export default nextConfig;
