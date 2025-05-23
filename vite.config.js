import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
const ReactCompilerConfig = { /* ... */ };
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),["babel-plugin-react-compiler", ReactCompilerConfig]],
})
