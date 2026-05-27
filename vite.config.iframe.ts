import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: "./", // Use relative paths for iframe embedding
  build: {
    outDir: "dist-iframe",
    rollupOptions: {
      input: {
        main: "./index.iframe.html",
      },
    },
    cssCodeSplit: false,
  },
});
