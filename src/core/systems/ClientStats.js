import { System } from './System'

import StatsGL from '../libs/stats-gl'

/**
 * Stats System
 *
 * - runs on the client
 * - attaches stats to the ui to see fps/cpu/gpu
 *
 */
export class ClientStats extends System {
  constructor(world) {
    super(world)
    this.stats = null
    this.ui = null
    this.active = false
  }

  init({ ui }) {
    this.ui = ui
  }

  enable() {
    if (!this.stats) {
      this.stats = new StatsGL({
        logsPerSecond: 20,
        samplesLog: 100,
        samplesGraph: 10,
        precision: 2,
        horizontal: true,
        minimal: false,
        mode: 0,
      })
      this.stats.init(this.world.graphics.renderer, false)
      this.stats.dom.style.position = 'absolute'
    }
    this.ui.appendChild(this.stats.dom)
    this.active = true
  }

  disable() {
    if (!this.active) return
    this.ui.removeChild(this.stats.dom)
    this.active = false
  }

  toggle() {
    if (this.active) {
      this.disable()
    } else {
      this.enable()
    }
  }

  preTick() {
    if (this.active) {
      this.stats.begin()
    }
  }

  postTick() {
    if (this.active) {
      this.stats.end()
      this.stats.update()
    }
  }
}
