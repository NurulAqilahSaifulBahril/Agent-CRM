/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export is only for the Netlify preview build (see netlify.toml).
  // Local dev and the Electron/Postgres app need dynamic lead routes.
  ...(process.env.NEXT_EXPORT === "true" ? { output: "export" } : {}),
};

export default nextConfig;
