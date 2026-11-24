import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// Librerías grandes en archivos propios: cambian poco, así el navegador las
// mantiene en caché aunque cambie el código de la aplicación.
const GRUPOS_VENDOR = [
  ['vendor-react', ['/react/', '/react-dom/', '/react-router/', '/react-router-dom/', '/scheduler/']],
  ['vendor-mui', ['/@mui/', '/@emotion/']],
  ['vendor-calendario', ['/@fullcalendar/', '/temporal-polyfill/']],
  ['vendor-alertas', ['/sweetalert2/']],
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          const ruta = id.replace(/\\/g, '/')
          for (const [nombre, paquetes] of GRUPOS_VENDOR) {
            if (paquetes.some((p) => ruta.includes(`/node_modules${p}`))) return nombre
          }
          return undefined
        },
      },
    },
  },
})
