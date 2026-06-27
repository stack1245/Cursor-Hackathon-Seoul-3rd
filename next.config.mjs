/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Prevent flaky filesystem cache artifacts on interrupted dev sessions.
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
