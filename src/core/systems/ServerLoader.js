import fs from 'fs-extra'
import path from 'path'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin } from '@pixiv/three-vrm'

import { System } from './System'
import { createVRMFactory } from '../extras/createVRMFactory'
import { glbToNodes } from '../extras/glbToNodes'
import { createNode } from '../extras/createNode'
import { createEmoteFactory } from '../extras/createEmoteFactory'

/**
 * Server Loader System
 *
 * - Runs on the server
 * - Basic file loader for many different formats, cached.
 *
 */
export class ServerLoader extends System {
  constructor(world) {
    super(world)
    const rootDir = process.env.STORAGE_PATH || path.join(__dirname, '../')
    const dataVolumeName = process.env.STORAGE_DIRNAME || 'world'
    this.assetsDir = path.join(rootDir, `${dataVolumeName}/assets`)
    this.promises = new Map()
    this.results = new Map()
    this.rgbeLoader = new RGBELoader()
    this.gltfLoader = new GLTFLoader()
    this.gltfLoader.register(parser => new VRMLoaderPlugin(parser))

    // mock globals to allow gltf loader to work in nodejs
    globalThis.self = { URL }
    globalThis.window = {}
    globalThis.document = {
      createElementNS: () => ({ style: {} }),
    }
  }

  start() {
    // ...
  }

  has(type, url) {
    const key = `${type}/${url}`
    return this.promises.has(key)
  }

  get(type, url) {
    const key = `${type}/${url}`
    return this.results.get(key)
  }

  load(type, url) {
    const key = `${type}/${url}`
    if (this.promises.has(key)) {
      return this.promises.get(key)
    }
    url = this.resolveURL(url)
    let promise
    if (type === 'hdr') {
      // promise = this.rgbeLoader.loadAsync(url).then(texture => {
      //   return texture
      // })
    }
    if (type === 'glb') {
      promise = new Promise(async (resolve, reject) => {
        const buffer = await fs.readFile(url)
        const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
        try {
          this.gltfLoader.parse(arrayBuffer, '', glb => {
            let node
            glb.toNodes = () => {
              if (!node) {
                node = glbToNodes(glb, this.world)
              }
              return node.clone(true)
            }
            this.results.set(key, glb)
            resolve(glb)
          })
        } catch (err) {
          reject(err)
        }
      })
    }
    if (type === 'vrm') {
      promise = new Promise(async (resolve, reject) => {
        const buffer = await fs.readFile(url)
        const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
        try {
          this.gltfLoader.parse(arrayBuffer, '', glb => {
            const factory = createVRMFactory(glb, this.world)
            glb.toNodes = () => {
              return createNode({
                name: 'vrm',
                factory,
              })
            }
            this.results.set(key, glb)
            resolve(glb)
          })
        } catch (err) {
          reject(err)
        }
      })
    }
    if (type === 'emote') {
      promise = new Promise(async (resolve, reject) => {
        const buffer = await fs.readFile(url)
        const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
        try {
          this.gltfLoader.parse(arrayBuffer, '', glb => {
            const factory = createEmoteFactory(glb, url)
            glb.toClip = factory.toClip
            this.results.set(key, glb)
            resolve(glb)
          })
        } catch (err) {
          reject(err)
        }
      })
    }
    if (type === 'script') {
      promise = new Promise(async (resolve, reject) => {
        const code = await fs.readFile(url, { encoding: 'utf8' })
        const script = this.world.scripts.evaluate(code)
        this.results.set(key, script)
        resolve(script)
      })
    }
    this.promises.set(key, promise)
    return promise
  }

  resolveURL(url) {
    if (url.startsWith('asset://')) {
      return url.replace('asset:/', this.assetsDir)
    }
    return url
  }
}
