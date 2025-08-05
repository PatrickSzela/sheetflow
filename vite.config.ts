import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cloudflare({
      // WORKAROUND: the Cloudflare vite plugin looks for `wrangler.jsonc` file under `root` directory that's set to `./app` lower
      configPath: path.resolve(__dirname, "./wrangler.jsonc"),
    }),
  ],

  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./") },
      /* Special cases for extracting internal parts of HyperFormula */
      {
        find: /^hyperformula\/(es|typings)/,
        replacement: path.resolve(__dirname, "./node_modules/hyperformula/es"),
      },
    ],
  },

  // match Next.js locations
  root: path.resolve(__dirname, "./app"),
  publicDir: path.resolve(__dirname, "./public"),
});
