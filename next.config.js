/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
    basePath: '/crowdvibe-frontend',
};

module.exports = nextConfig; 