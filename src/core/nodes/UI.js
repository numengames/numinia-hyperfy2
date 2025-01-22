import * as THREE from '../extras/three'
import { isBoolean, isNumber } from 'lodash-es'

import { Node } from './Node'
import { fillRoundRect } from '../extras/fillRoundRect'
import { AlignContent, AlignItems, FlexDirection, JustifyContent } from '../extras/yoga'

const v1 = new THREE.Vector3()
const v2 = new THREE.Vector3()
const v3 = new THREE.Vector3()
const q1 = new THREE.Quaternion()
const q2 = new THREE.Quaternion()

const defaults = {
  width: 100,
  height: 100,
  size: 0.01,
  res: 2,

  lit: false,
  doubleside: true,
  billboard: null,
  pivot: 'center',

  backgroundColor: null,
  borderRadius: 0,
  padding: 0,
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  alignContent: 'flex-start',
}

export class UI extends Node {
  constructor(data = {}) {
    super(data)
    this.name = 'ui'

    this.width = isNumber(data.width) ? data.width : defaults.width
    this.height = isNumber(data.height) ? data.height : defaults.height
    this.size = isNumber(data.size) ? data.size : defaults.size
    this.res = isNumber(data.res) ? data.res : defaults.res

    this.lit = isBoolean(data.lit) ? data.lit : defaults.lit
    this.doubleside = isBoolean(data.doubleside) ? data.doubleside : defaults.doubleside
    this.billboard = data.billboard || defaults.billboard
    this.pivot = data.pivot || defaults.pivot

    this.backgroundColor = data.backgroundColor || defaults.backgroundColor
    this.borderRadius = data.borderRadius || defaults.borderRadius
    this.padding = isNumber(data.padding) ? data.padding : defaults.padding
    this.flexDirection = data.flexDirection || defaults.flexDirection
    this.justifyContent = data.justifyContent || defaults.justifyContent
    this.alignItems = data.alignItems || defaults.alignItems
    this.alignContent = data.alignContent || defaults.alignContent

    this.ui = this
  }

  build() {
    this.unbuild()
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.width * this.res
    this.canvas.height = this.height * this.res
    this.canvasCtx = this.canvas.getContext('2d')
    this.texture = new THREE.CanvasTexture(this.canvas)
    this.texture.anisotropy = this.ctx.world.graphics.maxAnisotropy
    // this.texture.minFilter = THREE.LinearFilter // or THREE.NearestFilter for pixel-perfect but potentially aliased text
    // this.texture.magFilter = THREE.LinearFilter
    // this.texture.generateMipmaps = true
    this.geometry = new THREE.PlaneGeometry(this.width, this.height)
    this.geometry.scale(this.size, this.size, this.size)
    applyPivot(this.pivot, this.geometry, this.width * this.size, this.height * this.size)
    this.material = this.lit
      ? new THREE.MeshStandardMaterial({ color: 'white', roughness: 1, metalness: 0 })
      : new THREE.MeshBasicMaterial({ color: 'white' })
    this.ctx.world.setupMaterial(this.material)
    this.material.transparent = true
    this.material.map = this.texture
    this.material.side = THREE.DoubleSide
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.matrixAutoUpdate = false
    this.mesh.matrixWorldAutoUpdate = false
    this.mesh.matrixWorld.copy(this.matrixWorld)
    this.ctx.world.stage.scene.add(this.mesh)
    if (this.billboard) {
      this.ctx.world.setHot(this, true)
    }

    this.needsRebuild = false
  }

  unbuild() {
    if (this.mesh) {
      this.ctx.world.stage.scene.remove(this.mesh)
      this.mesh.material.dispose()
      this.mesh.geometry.dispose()
      this.mesh = null
      this.ctx.world.setHot(this, false)
    }
  }

  draw() {
    this.yogaNode.calculateLayout(this.width * this.res, this.height * this.res, Yoga.DIRECTION_LTR)
    const ctx = this.canvasCtx
    ctx.clearRect(0, 0, this.width * this.res, this.height * this.res)
    const left = this.yogaNode.getComputedLeft()
    const top = this.yogaNode.getComputedTop()
    const width = this.yogaNode.getComputedWidth()
    const height = this.yogaNode.getComputedHeight()
    if (this.backgroundColor) {
      ctx.fillStyle = this.backgroundColor
      if (this.borderRadius) {
        fillRoundRect(ctx, left, top, width, height, this.borderRadius * this.ui.res)
      } else {
        ctx.fillRect(left, top, width, height)
      }
    }
    this.children.forEach(child => child.draw(ctx, left, top))
    this.texture.needsUpdate = true
    this.needsRedraw = false
  }

  mount() {
    if (this.ctx.world.network.isServer) return
    this.yogaNode = Yoga.Node.create()
    this.yogaNode.setWidth(this.width * this.res)
    this.yogaNode.setHeight(this.height * this.res)
    this.yogaNode.setPadding(Yoga.EDGE_ALL, this.padding * this.ui.res)
    this.yogaNode.setFlexDirection(FlexDirection[this.flexDirection])
    this.yogaNode.setJustifyContent(JustifyContent[this.justifyContent])
    this.yogaNode.setAlignItems(AlignItems[this.alignItems])
    this.yogaNode.setAlignContent(AlignContent[this.alignContent])
    this.build()
    this.needsRedraw = true
    this.setDirty()
  }

  commit(didMove) {
    if (this.ctx.world.network.isServer) return
    if (this.needsRebuild) {
      this.build()
    }
    if (this.needsRedraw) {
      this.draw()
    }
    if (didMove) {
      this.mesh.matrixWorld.copy(this.matrixWorld)
    }
  }

  unmount() {
    if (this.ctx.world.network.isServer) return
    this.unbuild()
    this.needRebuild = false
    this.needsRedraw = false
    this.yogaNode?.free()
    this.yogaNode = null
  }

  rebuild() {
    this.needsRebuild = true
    this.needsRedraw = true
    this.setDirty()
  }

  redraw() {
    this.needsRedraw = true
    this.setDirty()
  }

  postLateUpdate(delta) {
    if (this.billboard === 'full') {
      this.mesh.matrixWorld.decompose(v1, q1, v2)
      this.ctx.world.camera.getWorldQuaternion(q1)
      this.mesh.matrixWorld.compose(v1, q1, v2)
    } else if (this.billboard === 'y-axis') {
      this.mesh.matrixWorld.decompose(this.mesh.position, this.mesh.quaternion, this.mesh.scale)
      this.ctx.world.camera.getWorldQuaternion(this.mesh.quaternion)
      this.ctx.world.camera.getWorldPosition(v1)
      v1.y = this.mesh.position.y // keep same Y level
      this.mesh.lookAt(v1)
      this.mesh.matrixWorld.compose(this.mesh.position, this.mesh.quaternion, this.mesh.scale)
    }
  }

  copy(source, recursive) {
    super.copy(source, recursive)
    this.width = source.width
    this.height = source.height
    this.size = source.size
    this.res = source.res
    this.backgroundColor = source.backgroundColor
    this.borderRadius = source.borderRadius
    this.padding = source.padding
    this.flexDirection = source.flexDirection
    this.justifyContent = source.justifyContent
    this.alignItems = source.alignItems
    this.alignContent = source.alignContent
    return this
  }

  getProxy() {
    var self = this
    if (!this.proxy) {
      let proxy = {
        get width() {
          return self.width
        },
        set width(value) {
          self.width = value
          self.yogaNode?.setWidth(self.width * self.res)
          // self.yogaNode?.markDirty()
          self.rebuild()
        },
        get height() {
          return self.height
        },
        set height(value) {
          self.height = value
          self.yogaNode?.setHeight(self.height * self.res)
          // self.yogaNode?.markDirty()
          self.rebuild()
        },
        get size() {
          return self.size
        },
        set size(value) {
          self.size = value
          self.rebuild()
        },
        get res() {
          return self.res
        },
        set res(value) {
          self.res = value
          self.rebuild()
        },
        get lit() {
          return self.lit
        },
        set lit(value) {
          self.lit = value
          self.rebuild()
        },
        get doubleside() {
          return self.doubleside
        },
        set doubleside(value) {
          self.doubleside = value
          self.rebuild()
        },
        get billboard() {
          return self.billboard
        },
        set billboard(value) {
          self.billboard = value
          self.rebuild()
        },
        get pivot() {
          return self.pivot
        },
        set pivot(value) {
          self.pivot = value
          self.rebuild()
        },
        get backgroundColor() {
          return self.backgroundColor
        },
        set backgroundColor(value) {
          self.backgroundColor = value
          self.redraw()
        },
        get borderRadius() {
          return self.borderRadius
        },
        set borderRadius(value) {
          self.borderRadius = value
          self.redraw()
        },
        get padding() {
          return self.padding
        },
        set padding(value) {
          self.padding = value
          self.yogaNode?.setPadding(Yoga.EDGE_ALL, self.padding * self.ui.res)
          // self.yogaNode?.markDirty()
          self.redraw()
        },
        get flexDirection() {
          return self.flexDirection
        },
        set flexDirection(value) {
          self.flexDirection = value
          self.yogaNode?.setFlexDirection(FlexDirection[self.flexDirection])
          // self.yogaNode?.markDirty()
          self.redraw()
        },
        get justifyContent() {
          return self.justifyContent
        },
        set justifyContent(value) {
          self.justifyContent = value
          self.yogaNode?.setJustifyContent(JustifyContent[self.justifyContent])
          // self.yogaNode?.markDirty()
          self.redraw()
        },
        get alignItems() {
          return self.alignItems
        },
        set alignItems(value) {
          self.alignItems = value
          self.yogaNode?.setAlignItems(AlignItems[self.alignItems])
          // self.yogaNode?.markDirty()
          self.redraw()
        },
        get alignContent() {
          return self.alignContent
        },
        set alignContent(value) {
          self.alignContent = value
          self.yogaNode?.setAlignContent(AlignContent[self.alignContent])
          // self.yogaNode?.markDirty()
          self.redraw()
        },
      }
      proxy = Object.defineProperties(proxy, Object.getOwnPropertyDescriptors(super.getProxy())) // inherit Node properties
      this.proxy = proxy
    }
    return this.proxy
  }
}

function applyPivot(pivot, geometry, width, height) {
  const halfWidth = width / 2
  const halfHeight = height / 2
  switch (pivot) {
    case 'top-left':
      geometry.translate(halfWidth, -halfHeight, 0)
      break
    case 'top-center':
      geometry.translate(0, -halfHeight, 0)
      break
    case 'top-right':
      geometry.translate(-halfWidth, -halfHeight, 0)
      break
    case 'center-left':
      geometry.translate(halfWidth, 0, 0)
      break
    case 'center-right':
      geometry.translate(-halfWidth, 0, 0)
      break
    case 'bottom-left':
      geometry.translate(halfWidth, halfHeight, 0)
      break
    case 'bottom-center':
      geometry.translate(0, halfHeight, 0)
      break
    case 'bottom-right':
      geometry.translate(-halfWidth, halfHeight, 0)
      break
    case 'center':
    default:
      break
  }
}
