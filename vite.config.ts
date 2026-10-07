import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Same SVG handling as the NGEN website repo: every .svg import is a React component.
    svgr({ include: ['**/*.svg', '**/.svg?react'], svgrOptions: { icon: true } }),
  ],
  resolve: {
    // Same aliases as the NGEN website repo, so mirrored components import unchanged.
    alias: [
      { find: '@', replacement: path.resolve(import.meta.dirname, 'src') },
      { find: '~frontend-font', replacement: path.resolve(import.meta.dirname, 'resources/assets/fonts/frontend') },
    ],
  },
})
