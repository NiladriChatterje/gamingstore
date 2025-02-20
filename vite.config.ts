import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@component": path.resolve(__dirname, "src/component"),
      "@declarations": path.resolve(__dirname, "src/declarations"),
    },
  },
  plugins: [react(),svgr()],
}
)
