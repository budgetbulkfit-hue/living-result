/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'living-result-backend.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin.html',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        // Cache static images in the public folder for 1 year
        source: '/images/:all*(svg|jpg|png|webp|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
