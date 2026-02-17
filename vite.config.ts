import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '0.0.0.0',
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/reniec": {
        target: "https://api.decolecta.com/v1/reniec",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/reniec/, ""),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
