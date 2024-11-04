import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },

  // match Next.js locations
  root: path.resolve(__dirname, "./app"),
  publicDir: path.resolve(__dirname, "./public"),
});
