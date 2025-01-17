import 'ses'
import '../core/lockdown'
import './bootstrap'

import fs from 'fs-extra'
import path from 'path'
import { pipeline } from 'stream/promises'
import Fastify from 'fastify'
import ws from '@fastify/websocket'
import cors from '@fastify/cors'
import compress from '@fastify/compress'
import statics from '@fastify/static'
import multipart from '@fastify/multipart'

import { loadPhysX } from './physx/loadPhysX'

import { createServerWorld } from '../core/createServerWorld'
import { hashFile } from '../core/utils-server'
import { getDB } from './db'

const dataVolumeName = process.env.DATA_VOLUME_NAME || 'world';

const rootDir = path.join(__dirname, '../')
const dataDir = process.env.DATA_PATH || rootDir;
const worldDir = path.join(dataDir, dataVolumeName)
const assetsDir = path.join(rootDir, `${dataVolumeName}/assets`)
const port = process.env.PORT

console.log(rootDir);
console.log(dataDir);
console.log(worldDir);
console.log(assetsDir);
console.log(port);

await fs.ensureDir(worldDir)
await fs.ensureDir(assetsDir)

// copy core assets
await fs.copy(path.join(rootDir, 'src/core/assets'), path.join(assetsDir))

const db = await getDB(path.join(worldDir, '/db.sqlite'))

const world = createServerWorld()
world.init({ db, loadPhysX })

const fastify = Fastify({ logger: { level: 'error' } })

fastify.register(cors)
fastify.register(compress)
fastify.register(statics, {
  root: path.join(__dirname, 'public'),
  prefix: '/',
  decorateReply: false,
  setHeaders: res => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
  },
})
fastify.register(statics, {
  root: assetsDir,
  prefix: '/assets/',
  decorateReply: false,
  setHeaders: res => {
    // all assets are hashed & immutable so we can use aggressive caching
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable') // 1 year
    res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString()) // older browsers
  },
})
fastify.register(multipart, {
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
})
fastify.register(ws)
fastify.register(worldNetwork)

fastify.post('/api/upload', async (req, reply) => {
  // console.log('DEBUG: slow uploads')
  // await new Promise(resolve => setTimeout(resolve, 2000))

  const file = await req.file()
  const ext = file.filename.split('.').pop().toLowerCase()
  // create temp buffer to store contents
  const chunks = []
  for await (const chunk of file.file) {
    chunks.push(chunk)
  }
  const buffer = Buffer.concat(chunks)
  // hash from buffer
  const hash = await hashFile(buffer)
  const filename = `${hash}.${ext}`
  // save to fs
  const filePath = path.join(assetsDir, filename)
  const exists = await fs.exists(filePath)
  if (!exists) {
    await fs.writeFile(filePath, buffer)
  }
})

fastify.get('/health', async (request, reply) => {
  try {
    // Basic health check
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }

    return reply.code(200).send(health)
  } catch (error) {
    console.error('Health check failed:', error)
    return reply.code(503).send({
      status: 'error',
      timestamp: new Date().toISOString()
    })
  }
})

fastify.setErrorHandler((err, req, reply) => {
  console.error(err)
  reply.status(500).send()
})

try {
  await fastify.listen({ port, host: '0.0.0.0' })
} catch (err) {
  console.error(err)
  console.error(`failed to launch on port ${port}`)
  process.exit(1)
}

async function worldNetwork(fastify) {
  fastify.get('/ws', { websocket: true }, (ws, req) => {
    world.network.onConnection(ws, req.query.authToken)
  })
}

console.log(`running on port ${port}`)
