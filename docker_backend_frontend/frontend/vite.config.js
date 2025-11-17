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
                // eslint-disable-next-line no-undef
                target: process.env.NODE_ENV == "production" ? 80 : 3000,
                changeOrigin: true,
                secure: false,
            },
        },
    },
    strictPort: true, // ← Не меняет порт если занят
    watch: {
        usePolling: true, // ← Обязательно для Docker
        interval: 1000, // ← Частота проверки
        useFsEvents: false, // ← Отключаем fs events
    },
    hmr: {
        clientPort: 3000, // ← Порт для HMR
        overlay: true, // ← Показывать ошибки поверх страницы
    },
    define: {
        "process.env": {},
    },
    build: {
        outDir: "dist",
        sourcemap: false,
    },
    // Для правильных путей в production
    base: "",
});
