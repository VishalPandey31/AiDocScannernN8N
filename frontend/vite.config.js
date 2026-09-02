import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/n8n-proxy': {
                target: 'https://student2355.app.n8n.cloud',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/n8n-proxy/, '')
            }
        }
    }
})
