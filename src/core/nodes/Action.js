import * as THREE from '../extras/three'
import { isNumber } from 'lodash-es'

import { Node } from './Node'

const defaults = {
  label: 'Interact',
  distance: 3,
  duration: 0.5,
  onStart: () => {},
  onTrigger: () => {},
  onCancel: () => {},
}

export class Action extends Node {
  constructor(data = {}) {
    super(data)
    this.name = 'action'

    this.label = data.label || defaults.label
    this.distance = isNumber(data.distance) ? data.distance : defaults.distance
    this.duration = isNumber(data.duration) ? data.duration : defaults.duration
    this.onStart = data.onStart || defaults.onStart
    this.onTrigger = data.onTrigger || defaults.onTrigger
    this.onCancel = data.onCancel || defaults.onCancel

    this.worldPos = new THREE.Vector3()
    this.progress = 0
  }

  mount() {
    this.ctx.world.actions?.register(this)
    this.worldPos.setFromMatrixPosition(this.matrixWorld)
  }

  commit(didMove) {
    if (didMove) {
      this.worldPos.setFromMatrixPosition(this.matrixWorld)
    }
  }

  unmount() {
    this.ctx.world.actions?.unregister(this)
  }

  copy(source, recursive) {
    super.copy(source, recursive)
    this.label = source.label
    this.distance = source.distance
    this.duration = source.duration
    this.onStart = source.onStart
    this.onTrigger = source.onTrigger
    this.onCancel = source.onCancel
    return this
  }

  getProxy() {
    var self = this
    if (!this.proxy) {
      let proxy = {
        get label() {
          return self.label
        },
        set label(value) {
          self.label = value
        },
        get distance() {
          return self.distance
        },
        set distance(value) {
          self.distance = value
        },
        get duration() {
          return self.duration
        },
        set duration(value) {
          self.duration = value
        },
        get onStart() {
          return self.onStart
        },
        set onStart(value) {
          self.onStart = value
        },
        get onTrigger() {
          return self.onTrigger
        },
        set onTrigger(value) {
          self.onTrigger = value
        },
        get onCancel() {
          return self.onCancel
        },
        set onCancel(value) {
          self.onCancel = value
        },
      }
      proxy = Object.defineProperties(proxy, Object.getOwnPropertyDescriptors(super.getProxy())) // inherit Node properties
      this.proxy = proxy
    }
    return this.proxy
  }
}
