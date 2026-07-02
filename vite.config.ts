import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.warn("⚠ OPENROUTER_API_KEY não encontrada no .env");
}

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/chat": {
        target: "https://openrouter.ai",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/chat/, "/api/v1/chat/completions"),
        configure(proxy) {
          proxy.on("proxyReq", (proxyReq) => {
            if (apiKey) {
              proxyReq.setHeader("Authorization", `Bearer ${apiKey}`);
            }
            proxyReq.setHeader("HTTP-Referer", "http://localhost:5173");
            proxyReq.setHeader("X-OpenRouter-Title", "mini-chat");
          });
        },
      },
    },
  },
});
