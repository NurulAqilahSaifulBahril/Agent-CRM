/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify sets NEXT_EXPORT for a static preview. Railway and local production
  // use a standalone server so dynamic lead routes keep working.
  output: process.env.NEXT_EXPORT === "true" ? "export" : "standalone",
  // The data folder holds customer details; never copy it into the build.
  outputFileTracingExcludes: { "*": ["./data/**"] },
};

export default nextConfig;
