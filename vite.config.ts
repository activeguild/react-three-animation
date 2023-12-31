import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build:{
    lib: {
      entry: resolve(__dirname, 'src/useAnimationTexture.ts'),
      name: 'index',
      fileName: 'index',
    },
    cssCodeSplit: true,
    emptyOutDir: false,
    rollupOptions: {
      external: ['react', 'three'],
      output: {
        globals: {
          react: 'React',
        },
      }
    }
  }
})
