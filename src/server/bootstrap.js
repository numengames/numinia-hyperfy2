import sourceMapSupport from 'source-map-support'
import path from 'path'
import { fileURLToPath } from 'url'

// if not in server mode, read .env files, otherwise skip (env variables are being defined in runtime)
if (process.env.NODE_ENV !== 'server') {
    await import('dotenv-flow/config')
}

// support node source maps
sourceMapSupport.install()

// support `__dirname` in ESM
globalThis.__dirname = path.dirname(fileURLToPath(import.meta.url))
