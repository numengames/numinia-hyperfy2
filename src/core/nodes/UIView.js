import * as THREE from '../extras/three'
import { isNumber } from 'lodash-es'

import { Node } from './Node'
import { fillRoundRect } from '../extras/fillRoundRect'
import { AlignItems, AlignContent, FlexDirection, JustifyContent, Display, FlexWrap } from '../extras/yoga'

const defaults = {
  display: 'flex',
  width: null,
  height: null,
  backgroundColor: null,
  borderRadius: 0,
  margin: 0,
  padding: 0,
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  alignContent: 'flex-start',
  flexBasis: null,
  flexGrow: 0,
  flexShrink: 1,
  flexWrap: 'no-wrap',
  gap: 0,
}

export class UIView extends Node {
  constructor(data = {}) {
    super(data)
    this.name = 'uiview'

    this.display = data.display || defaults.display
    this.width = isNumber(data.width) ? data.width : defaults.width
    this.height = isNumber(data.height) ? data.height : defaults.height
    this.backgroundColor = data.backgroundColor || defaults.backgroundColor
    this.borderRadius = data.borderRadius || defaults.borderRadius
    this.margin = isNumber(data.margin) ? data.margin : defaults.margin
    this.padding = isNumber(data.padding) ? data.padding : defaults.padding
    this.flexDirection = data.flexDirection || defaults.flexDirection
    this.justifyContent = data.justifyContent || defaults.justifyContent
    this.alignItems = data.alignItems || defaults.alignItems
    this.alignContent = data.alignContent || defaults.alignContent
    this.flexBasis = isNumber(data.flexBasis) ? data.flexBasis : defaults.flexBasis
    this.flexGrow = isNumber(data.flexGrow) ? data.flexGrow : defaults.flexGrow
    this.flexShrink = isNumber(data.flexShrink) ? data.flexShrink : defaults.flexShrink
    this.flexWrap = data.flexWrap || defaults.flexWrap
    this.gap = isNumber(data.gap) ? data.gap : defaults.gap
  }

  draw(ctx, offsetLeft, offsetTop) {
    if (this.display === 'none') return
    const left = offsetLeft + this.yogaNode.getComputedLeft()
    const top = offsetTop + this.yogaNode.getComputedTop()
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
  }

  mount() {
    if (this.ctx.world.network.isServer) return
    this.ui = this.parent?.ui
    if (!this.ui) return console.error('uiview: must be child of ui node')
    this.yogaNode = Yoga.Node.create()
    this.yogaNode.setDisplay(Display[this.display])
    this.yogaNode.setWidth(this.width === null ? undefined : this.width * this.ui.res)
    this.yogaNode.setHeight(this.height === null ? undefined : this.height * this.ui.res)
    this.yogaNode.setMargin(Yoga.EDGE_ALL, this.margin * this.ui.res)
    this.yogaNode.setPadding(Yoga.EDGE_ALL, this.padding * this.ui.res)
    this.yogaNode.setFlexDirection(FlexDirection[this.flexDirection])
    this.yogaNode.setJustifyContent(JustifyContent[this.justifyContent])
    this.yogaNode.setAlignItems(AlignItems[this.alignItems])
    this.yogaNode.setAlignContent(AlignContent[this.alignContent])
    this.yogaNode.setFlexBasis(this.flexBasis === null ? 'auto' : this.flexBasis)
    this.yogaNode.setFlexGrow(this.flexGrow)
    this.yogaNode.setFlexShrink(this.flexShrink)
    this.yogaNode.setFlexWrap(FlexWrap[this.flexWrap])
    this.yogaNode.setGap(Yoga.GUTTER_ALL, this.gap)
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
    this.width = source.width
    this.height = source.height
    this.backgroundColor = source.backgroundColor
    this.borderRadius = source.borderRadius
    this.margin = source.margin
    this.padding = source.padding
    this.flexDirection = source.flexDirection
    this.justifyContent = source.justifyContent
    this.alignItems = source.alignItems
    this.alignContent = source.alignContent
    this.flexBasis = source.flexBasis
    this.flexGrow = source.flexGrow
    this.flexShrink = source.flexShrink
    this.flexWrap = source.flexWrap
    this.gap = source.gap
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
          // self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
        get width() {
          return self.width
        },
        set width(value) {
          self.width = value
          self.yogaNode?.setWidth(self.width === null ? undefined : self.width * self.ui.res)
          // self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
        get height() {
          return self.height
        },
        set height(value) {
          self.height = value
          self.yogaNode?.setHeight(self.height === null ? undefined : self.height * self.ui.res)
          // self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
        get backgroundColor() {
          return self.backgroundColor
        },
        set backgroundColor(value) {
          self.backgroundColor = value
          self.ui?.redraw()
        },
        get borderRadius() {
          return self.borderRadius
        },
        set borderRadius(value) {
          self.borderRadius = value
          self.ui?.redraw()
        },
        get margin() {
          return self.margin
        },
        set margin(value) {
          self.margin = value
          self.yogaNode.setMargin(Yoga.EDGE_ALL, self.margin * self.ui.res)
          // self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
        get padding() {
          return self.padding
        },
        set padding(value) {
          self.padding = value
          self.yogaNode?.setPadding(Yoga.EDGE_ALL, self.padding * self.ui.res)
          // self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
        get flexDirection() {
          return self.flexDirection
        },
        set flexDirection(value) {
          self.flexDirection = value
          self.yogaNode?.setFlexDirection(FlexDirection[self.flexDirection])
          // self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
        get justifyContent() {
          return self.justifyContent
        },
        set justifyContent(value) {
          self.justifyContent = value
          self.yogaNode?.setJustifyContent(JustifyContent[self.justifyContent])
          // self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
        get alignItems() {
          return self.alignItems
        },
        set alignItems(value) {
          self.alignItems = value
          self.yogaNode?.setAlignItems(AlignItems[self.alignItems])
          // self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
        get alignContent() {
          return self.alignContent
        },
        set alignContent(value) {
          self.alignContent = value
          self.yogaNode?.setAlignContent(AlignContent[self.alignContent])
          // self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
        get flexBasis() {
          return self.flexBasis
        },
        set flexBasis(value) {
          self.flexBasis = value
          self.yogaNode?.setFlexBasis(self.flexBasis === null ? 'auto' : self.flexBasis)
          // self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
        get flexGrow() {
          return self.flexGrow
        },
        set flexGrow(value) {
          self.flexGrow = value
          self.yogaNode?.setFlexGrow(self.flexGrow)
          // self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
        get flexShrink() {
          return self.flexShrink
        },
        set flexShrink(value) {
          self.flexShrink = value
          self.yogaNode?.setFlexShrink(self.flexShrink)
          // self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
        get flexWrap() {
          return self.flexWrap
        },
        set flexWrap(value) {
          self.flexWrap = value
          self.yogaNode?.setFlexWrap(FlexWrap[self.flexWrap])
          // self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
        get gap() {
          return self.gap
        },
        set gap(value) {
          self.gap = value
          self.yogaNode?.setGap(Yoga.GUTTER_ALL, self.gap)
          // self.yogaNode?.markDirty()
          self.ui?.redraw()
        },
      }
      proxy = Object.defineProperties(proxy, Object.getOwnPropertyDescriptors(super.getProxy())) // inherit Node properties
      this.proxy = proxy
    }
    return this.proxy
  }
}
