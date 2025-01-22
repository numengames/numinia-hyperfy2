import { isNumber } from 'lodash-es'

import { Node } from './Node'
import { Display } from '../extras/yoga'

const defaults = {
  display: 'flex',
  value: '',
  fontSize: 16,
  color: '#000000',
  lineHeight: 1.2,
  textAlign: 'left',
  fontFamily: 'Rubik',
  fontWeight: 'normal',
}

let offscreenContext
const getOffscreenContext = () => {
  if (!offscreenContext) {
    const offscreenCanvas = document.createElement('canvas')
    offscreenContext = offscreenCanvas.getContext('2d')
  }
  return offscreenContext
}

export class UIText extends Node {
  constructor(data = {}) {
    super(data)
    this.name = 'uitext'

    this.display = data.display || defaults.display
    this.value = data.value || defaults.value
    this.fontSize = isNumber(data.fontSize) ? data.fontSize : defaults.fontSize
    this.color = data.color || defaults.color
    this.lineHeight = isNumber(data.lineHeight) ? data.lineHeight : defaults.lineHeight
    this.textAlign = data.textAlign || defaults.textAlign
    this.fontFamily = data.fontFamily || defaults.fontFamily
    this.fontWeight = data.fontWeight || defaults.fontWeight
  }

  measureTextFunc() {
    const ctx = getOffscreenContext()
    return (width, widthMode, height, heightMode) => {
      ctx.font = `${this.fontWeight} ${this.fontSize * this.ui.res}px ${this.fontFamily}`
      ctx.textBaseline = 'alphabetic'
      // ctx.textBaseline = 'top'
      // We'll use a dummy string to measure ascenders+descenders.
      // ("Mg" has both tall ascender & long descender in many fonts)
      const metrics = ctx.measureText('Mg')
      const ascent = metrics.actualBoundingBoxAscent
      const descent = metrics.actualBoundingBoxDescent
      const naturalLineHeight = ascent + descent
      // The distance from one line's baseline to the next line's baseline
      // can be bigger or smaller than the natural lineHeight if desired.
      const baselineGap = naturalLineHeight * this.lineHeight
      // Figure out how many lines we need, based on the available width.
      let lines
      if (widthMode === Yoga.MEASURE_MODE_EXACTLY || widthMode === Yoga.MEASURE_MODE_AT_MOST) {
        lines = wrapText(ctx, this.value, width)
      } else {
        lines = [this.value]
      }
      // For the measured width, find the longest line.
      let measuredWidth = 0
      for (const line of lines) {
        const w = ctx.measureText(line).width
        if (w > measuredWidth) {
          measuredWidth = w
        }
      }
      if (widthMode === Yoga.MEASURE_MODE_AT_MOST) {
        measuredWidth = Math.min(measuredWidth, width)
      }
      // Height logic:
      //  - If we have at least one line, the first line's full bounding box is: (ascent+descent).
      //  - For each additional line, add the "baselineGap."
      //    i.e. totalHeight = naturalLineHeight + (lines.length - 1)* baselineGap
      let measuredHeight = 0
      if (lines.length > 0) {
        measuredHeight = naturalLineHeight + (lines.length - 1) * baselineGap
      }

      return { width: measuredWidth, height: measuredHeight }
    }
  }

  draw(ctx, offsetLeft, offsetTop) {
    if (this.display === 'none') return
    const left = offsetLeft + this.yogaNode.getComputedLeft()
    const top = offsetTop + this.yogaNode.getComputedTop()
    const width = this.yogaNode.getComputedWidth()
    // const height = this.yogaNode.getComputedHeight()
    ctx.font = `${this.fontWeight} ${this.fontSize * this.ui.res}px ${this.fontFamily}`
    ctx.textBaseline = 'alphabetic'
    // ctx.textBaseline = 'top'
    ctx.textAlign = this.textAlign
    ctx.fillStyle = this.color
    ctx.fillStyle = this.color
    const paddingLeft = this.yogaNode.getComputedPadding(Yoga.EDGE_LEFT)
    const paddingTop = this.yogaNode.getComputedPadding(Yoga.EDGE_TOP)
    const paddingRight = this.yogaNode.getComputedPadding(Yoga.EDGE_RIGHT)
    const innerWidth = width - paddingLeft - paddingRight
    let innerX = left + paddingLeft
    if (this.textAlign === 'center') {
      innerX = left + width / 2
    } else if (this.textAlign === 'right') {
      innerX = left + width - paddingRight
    }
    const innerY = top + paddingTop
    const lines = wrapText(ctx, this.value, innerWidth)
    const metrics = ctx.measureText('Mg')
    const ascent = metrics.actualBoundingBoxAscent
    const descent = metrics.actualBoundingBoxDescent
    const naturalLineHeight = ascent + descent
    const baselineGap = naturalLineHeight * this.lineHeight
    let currentBaselineY = innerY + ascent // first line's baseline
    lines.forEach((line, i) => {
      ctx.fillText(line, innerX, currentBaselineY)
      currentBaselineY += baselineGap
    })
  }

  mount() {
    if (this.ctx.world.network.isServer) return
    this.ui = this.parent?.ui
    if (!this.ui) return console.error('uiview: must be child of ui node')
    this.yogaNode = Yoga.Node.create()
    this.yogaNode.setMeasureFunc(this.measureTextFunc())
    this.yogaNode.setDisplay(Display[this.display])
    this.parent.yogaNode.insertChild(this.yogaNode, this.parent.yogaNode.getChildCount())
  }

  commit(didMove) {
    // ...
  }

  unmount() {
    if (this.ctx.world.network.isServer) return
    this.parent.yogaNode.removeChild(this.yogaNode)
    this.yogaNode.free()
    this.yogaNode = null
  }

  copy(source, recursive) {
    super.copy(source, recursive)
    this.display = source.display
    this.value = source.value
    this.fontSize = source.fontSize
    this.color = source.color
    this.lineHeight = source.lineHeight
    return this
  }

  getProxy() {
    var self = this
    if (!this.proxy) {
      let proxy = {
        get display() {
          return self.display
        },
        set display(value) {
          self.display = value
          self.yogaNode?.setDisplay(Display[self.display])
          self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
        get value() {
          return self.value
        },
        set value(value) {
          self.value = value
          self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
        get fontSize() {
          return self.fontSize
        },
        set fontSize(value) {
          self.fontSize = value
          self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
        get color() {
          return self.color
        },
        set color(value) {
          self.color = value
          self.ui?.redraw()
        },
        get lineHeight() {
          return self.lineHeight
        },
        set lineHeight(value) {
          self.lineHeight = value
          self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
        get textAlign() {
          return self.textAlign
        },
        set textAlign(value) {
          self.textAlign = value
          self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
        get fontFamily() {
          return self.fontFamily
        },
        set fontFamily(value) {
          self.fontFamily = value
          self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
        get fontWeight() {
          return self.fontWeight
        },
        set fontWeight(value) {
          self.fontWeight = value
          self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
      }
      proxy = Object.defineProperties(proxy, Object.getOwnPropertyDescriptors(super.getProxy())) // inherit Node properties
      this.proxy = proxy
    }
    return this.proxy
  }
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let currentLine = words[0]

  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const width = ctx.measureText(currentLine + ' ' + word).width
    if (width <= maxWidth) {
      currentLine += ' ' + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  lines.push(currentLine)

  return lines
}
