import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: "0.0.0.0", // Важно для Docker
        port: 3000,
        proxy: {
            "/api": {
                target: 'http://backend:5000',
                changeOrigin: true,
                secure: false,
                
            },
            "/llm": {
                target: 'http://api:8000',
                changeOrigin: true,
                secure: false,
            }
        },
    },
    watch: {
        usePolling: true,
        interval: 1000,
        useFsEvents: false,
    },
    hmr: {
        clientPort: 3000,
        overlay: true,
    },
    define: {
        "process.env": {},
    },
    build: {
        outDir: "dist",
        sourcemap: false,
    },
    base: "",
});
