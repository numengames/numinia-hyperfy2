import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin } from '@pixiv/three-vrm'

import { System } from './System'
import { createNode } from '../extras/createNode'
import { createVRMFactory } from '../extras/createVRMFactory'
import { glbToNodes } from '../extras/glbToNodes'
import { createEmoteFactory } from '../extras/createEmoteFactory'
import { TextureLoader } from 'three'

/**
 * Client Loader System
 *
 * - Runs on the client
 * - Basic file loader for many different formats, cached.
 *
 */
export class ClientLoader extends System {
  constructor(world) {
    super(world)
    this.promises = new Map()
    this.results = new Map()
    this.rgbeLoader = new RGBELoader()
    this.texLoader = new TextureLoader()
    this.gltfLoader = new GLTFLoader()
    this.gltfLoader.register(parser => new VRMLoaderPlugin(parser))
  }

  start() {
    this.vrmAPI = {
      camera: this.world.camera,
      scene: this.world.stage.scene,
      octree: this.world.stage.octree,
      setupMaterial: this.world.setupMaterial,
      loader: this.world.loader,
    }
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
      promise = this.rgbeLoader.loadAsync(url).then(texture => {
        this.results.set(key, texture)
        return texture
      })
    }
    if (type === 'tex') {
      promise = this.texLoader.loadAsync(url).then(texture => {
        this.results.set(key, texture)
        return texture
      })
    }
    if (type === 'glb') {
      promise = this.gltfLoader.loadAsync(url).then(glb => {
        let node
        let emote
        glb.toNodes = () => {
          if (!node) {
            node = glbToNodes(glb, this.world)
          }
          return node.clone(true)
        }
        glb.toClip = options => {
          if (!emote) emote = createEmoteFactory(glb, url)
          return emote.toClip(options)
        }
        this.results.set(key, glb)
        return glb
      })
    }
    if (type === 'vrm') {
      promise = this.gltfLoader.loadAsync(url).then(glb => {
        const factory = createVRMFactory(glb, this.vrmAPI)
        let node
        glb.factory = factory
        glb.toNodes = () => {
          if (!node) {
            node = createNode({ name: 'group' })
            const vrm = createNode({ id: 'vrm', name: 'vrm', factory })
            node.add(vrm)
          }
          return node.clone(true)
        }
        this.results.set(key, glb)
        return glb
      })
    }
    if (type === 'script') {
      promise = new Promise(async (resolve, reject) => {
        try {
          const resp = await fetch(url)
          const code = await resp.text()
          const script = this.world.scripts.evaluate(code)
          this.results.set(key, script)
          resolve(script)
        } catch (err) {
          reject(err)
        }
      })
    }
    this.promises.set(key, promise)
    return promise
  }

  insert(type, url, file) {
    const key = `${type}/${url}`
    const localUrl = URL.createObjectURL(file)
    let promise
    if (type === 'glb') {
      promise = this.gltfLoader.loadAsync(localUrl).then(glb => {
        let node
        let emote
        glb.toNodes = () => {
          if (!node) {
            node = glbToNodes(glb, this.world)
          }
          return node.clone(true)
        }
        glb.toClip = options => {
          if (!emote) emote = createEmoteFactory(glb, url)
          return emote.toClip(options)
        }
        this.results.set(key, glb)
        return glb
      })
    }
    if (type === 'vrm') {
      promise = this.gltfLoader.loadAsync(localUrl).then(glb => {
        const factory = createVRMFactory(glb, this.vrmAPI)
        let node
        glb.factory = factory
        glb.toNodes = () => {
          if (!node) {
            node = createNode({ name: 'group' })
            const vrm = createNode({ id: 'vrm', name: 'vrm', factory })
            node.add(vrm)
          }
          return node.clone(true)
        }
        this.results.set(key, glb)
        return glb
      })
    }
    if (type === 'script') {
      promise = new Promise(async (resolve, reject) => {
        try {
          const code = await file.text()
          const script = this.world.scripts.evaluate(code)
          this.results.set(key, script)
          resolve(script)
        } catch (err) {
          reject(err)
        }
      })
    }
    this.promises.set(key, promise)
  }

  resolveURL(url) {
    if (url.startsWith('asset://')) {
      return url.replace('asset:/', process.env.PUBLIC_ASSETS_URL)
    }
    return url
  }
}
