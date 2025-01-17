import 'dotenv-flow/config'
import fs from 'fs-extra'
import path from 'path'
import { fork } from 'child_process'
import * as esbuild from 'esbuild'
import { fileURLToPath } from 'url'

const dev = process.argv.includes('--dev')
const dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(dirname, './')
const buildDir = path.join(rootDir, 'build')

await fs.emptyDir(buildDir)

/**
 * Build Client
 */

const clientPublicDir = path.join(rootDir, 'src/client/public')
const clientBuildDir = path.join(rootDir, 'build/public')
const clientHtmlSrc = path.join(rootDir, 'src/client/public/index.html')
const clientHtmlDest = path.join(rootDir, 'build/public/index.html')

console.log(process.env);
console.log(dirname);
console.log(rootDir);
console.log(buildDir);
console.log(clientPublicDir);
console.log(clientBuildDir);
console.log(clientHtmlSrc);
console.log(clientHtmlDest);


{
  // get all public app env variables
  const publicEnvs = {}
  for (const key in process.env) {
    if (key.startsWith('PUBLIC_')) {
      const value = process.env[key]
      publicEnvs[`process.env.${key}`] = JSON.stringify(value)
    }
  }
  const clientCtx = await esbuild.context({
    entryPoints: ['src/client/index.js'],
    entryNames: '/[name]-[hash]',
    outdir: clientBuildDir,
    platform: 'browser',
    format: 'esm',
    bundle: true,
    treeShaking: true,
    minify: false,
    sourcemap: true,
    metafile: true,
    jsx: 'automatic',
    jsxImportSource: '@firebolt-dev/jsx',
    define: {
      // 'process.env.NODE_ENV': '"development"',
      'process.env.CLIENT': 'true',
      'process.env.SERVER': 'false',
      ...publicEnvs,
    },
    loader: {
      '.js': 'jsx',
    },
    alias: {
      react: 'react', // always use our own local react (jsx)
    },
    plugins: [
      {
        name: 'client-finalize-plugin',
        setup(build) {
          build.onEnd(async result => {
            // copy over public files
            await fs.copy(clientPublicDir, clientBuildDir)
            // find js output file
            const metafile = result.metafile
            const outputFiles = Object.keys(metafile.outputs)
            const jsFile = outputFiles.find(file => file.endsWith('.js')).split('build/public')[1]
            // inject into html and copy over
            let htmlContent = await fs.readFile(clientHtmlSrc, 'utf-8')
            htmlContent = htmlContent.replace('{jsFile}', jsFile)
            htmlContent = htmlContent.replace('{timestamp}', Date.now())
            await fs.writeFile(clientHtmlDest, htmlContent)
          })
        },
      },
    ],
  })
  if (dev) {
    await clientCtx.watch()
  } else {
    await clientCtx.rebuild()
  }
}

/**
 * Build Server
 */

let spawn

{
  const serverCtx = await esbuild.context({
    entryPoints: ['src/server/index.js'],
    outfile: 'build/index.js',
    platform: 'node',
    format: 'esm',
    bundle: true,
    treeShaking: true,
    minify: false,
    sourcemap: true,
    packages: 'external',
    define: {
      'process.env.CLIENT': 'false',
      'process.env.SERVER': 'true',
    },
    plugins: [
      {
        name: 'server-finalize-plugin',
        setup(build) {
          build.onEnd(async result => {
            // copy over physx wasm
            const physxWasmSrc = path.join(rootDir, 'src/server/physx/physx-js-webidl.wasm')
            const physxWasmDest = path.join(rootDir, 'build/physx-js-webidl.wasm')
            await fs.copy(physxWasmSrc, physxWasmDest)
            // start the server or stop here
            if (dev) {
              // (re)start server
              spawn?.kill('SIGTERM')
              spawn = fork(path.join(rootDir, 'build/index.js'))
            } else {
              // Create production wrapper that loads AWS secrets first
              const wrapperContent = `
                import { loadSecrets } from './scripts/load-aws-secrets.js';

                // Main async function
                async function main() {
                  try {
                    // Wait for secrets to load
                    await loadSecrets();
                    
                    // Once secrets are loaded, import and execute index
                    await import('./index.js');
                  } catch (error) {
                    console.error('Error in wrapper:', error);
                    process.exit(1);
                  }
                }

                // Execute main function
                main();
              `.trim()

              // Copy load-aws-secrets.js to build/scripts/
              await fs.ensureDir(path.join(rootDir, 'build/scripts'))
              await fs.copy(
                path.join(rootDir, 'src/scripts/load-aws-secrets.js'),
                path.join(rootDir, 'build/scripts/load-aws-secrets.js')
              )

              // Create the wrapper file
              await fs.writeFile(path.join(rootDir, 'build/wrapper.js'), wrapperContent)

              process.exit(1)
            }
          })
        },
      },
    ],
    loader: {},
  })
  if (dev) {
    await serverCtx.watch()
  } else {
    await serverCtx.rebuild()
  }
}
