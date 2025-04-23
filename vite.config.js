import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import vue from '@vitejs/plugin-vue'
import VueSetupExtend from 'vite-plugin-vue-setup-extend'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueSetupExtend(),
    {
      name: 'jquery',
      config() {
        return {
          define: {
            $: 'window.$',
            jQuery: 'window.jQuery',
            'window.jQuery': 'window.jQuery'
          }
        }
      }
    },
    createHtmlPlugin({
      minify: true,
      inject: {
        injectData: {
          title: 'My App'
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  define: {
    global: {},
    jQuery: 'window.jQuery',
    $: 'window.$'
  }
})
