/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
    basePath: '/crowdvibe-frontend',
};

module.exports = nextConfig; 