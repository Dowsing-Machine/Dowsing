import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path';
import copy from 'rollup-plugin-copy'

import WindiCSS from 'vite-plugin-windicss'

const commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim();

function pathResolve(dir) {
  return resolve(process.cwd(), '.', dir);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    WindiCSS(),
    copy({
      targets: [
        {
          src: 'node_modules/onnxruntime-web/dist/*.wasm',
          dest: 'public',
        },
      ],
      hook: 'buildStart'
    })

  ],
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  resolve:{
    alias:[
      {
        find: '@',
        replacement: pathResolve('src') + '/',
      },
      {
        find:"compassql",
        replacement: resolve("node_modules/compassql/build/compassql.js")
      }
    ]
  },
  build:{
    // sourcemap:true,
    // minify:false
  },
  server:{
    proxy:{
      '/api':{
        target:'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    cors:true,
  }
})
