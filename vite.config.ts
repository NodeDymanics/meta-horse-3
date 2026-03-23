import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import os from 'os'

// Use a temp directory outside Dropbox for the dep cache to avoid file locking
const cacheDir = path.join(os.tmpdir(), 'vite-meta-horse-2')

export default defineConfig({
  plugins: [react()],
  cacheDir,
})
