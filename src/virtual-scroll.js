import { Emitter } from './emitter'
import { clamp } from './maths'

export class VirtualScroll {
  constructor(
    element,
    { wheelMultiplier = 1, touchMultiplier = 2, normalizeWheel = false }
  ) {
    this.element = element
    this.wheelMultiplier = wheelMultiplier
    this.touchMultiplier = touchMultiplier
    this.normalizeWheel = normalizeWheel

    this.touchStart = {
      x: null,
      y: null,
    }

    this.emitter = new Emitter()

    // this.element.addEventListener('wheel', this.onWheel, { passive: false })
    // this.element.addEventListener('touchstart', this.onTouchStart, {
    //   passive: false,
    // })
    // this.element.addEventListener('touchmove', this.onTouchMove, {
    //   passive: false,
    // })
    // this.element.addEventListener('touchend', this.onTouchEnd, {
    //   passive: false,
    // })
  }

  // Add an event listener for the given event and callback
  on(event, callback) {
    return this.emitter.on(event, callback)
  }

  // Remove all event listeners and clean up
  destroy() {
    this.emitter.destroy()

    this.element.removeEventListener('wheel', this.onWheel, {
      passive: false,
    })
    this.element.removeEventListener('touchstart', this.onTouchStart, {
      passive: false,
    })
    this.element.removeEventListener('touchmove', this.onTouchMove, {
      passive: false,
    })
    this.element.removeEventListener('touchend', this.onTouchEnd, {
      passive: false,
    })
  }

  // Event handler for 'touchstart' event
  onTouchStart = (event) => {
    const { clientX, clientY } = event.targetTouches
      ? event.targetTouches[0]
      : event

    this.touchStart.x = clientX
    this.touchStart.y = clientY

    this.lastDelta = {
      x: 0,
      y: 0,
    }
  }

  // Event handler for 'touchmove' event
  onTouchMove = (event) => {
    const { clientX, clientY } = event.targetTouches
      ? event.targetTouches[0]
      : event

    const deltaX = -(clientX - this.touchStart.x) * this.touchMultiplier
    const deltaY = -(clientY - this.touchStart.y) * this.touchMultiplier

    this.touchStart.x = clientX
    this.touchStart.y = clientY

    this.lastDelta = {
      x: deltaX,
      y: deltaY,
    }

    this.emitter.emit('scroll', {
      deltaX,
      deltaY,
      event,
    })
  }

  onTouchEnd = (event) => {
    this.emitter.emit('scroll', {
      deltaX: this.lastDelta.x,
      deltaY: this.lastDelta.y,
      event,
    })
  }

  // Event handler for 'wheel' event
  onWheel = (event) => {
    let { deltaX, deltaY } = event

    if (this.normalizeWheel) {
      deltaX = clamp(-100, deltaX, 100)
      deltaY = clamp(-100, deltaY, 100)
    }

    deltaX *= this.wheelMultiplier
    deltaY *= this.wheelMultiplier

    this.emitter.emit('scroll', { deltaX, deltaY, event })
  }

  ////////////////////////////////////
  // Custom getters/setters/methods //
  ////////////////////////////////////

  get element() {
    return this._element
  }

  set element(ELEMENT) {
    // Setup...
    const oldElement = this._element
    const newElement = ELEMENT
    const elConfig = { passive: false }
    console.log('Updt. virtual scroll element')

    // Clean up old element (remove event listeners, etc.)...
    if (oldElement) {
      oldElement.removeEventListener('wheel', this.onWheel, elConfig)
      oldElement.removeEventListener('touchstart', this.onTouchStart, elConfig)
      oldElement.removeEventListener('touchmove', this.onTouchMove, elConfig)
      oldElement.removeEventListener('touchend', this.onTouchEnd, elConfig)
    }

    // Updt. element...
    this._element = newElement

    // Add event listeners to new element...
    newElement.addEventListener('wheel', this.onWheel, elConfig)
    newElement.addEventListener('touchstart', this.onTouchStart, elConfig)
    newElement.addEventListener('touchmove', this.onTouchMove, elConfig)
    newElement.addEventListener('touchend', this.onTouchEnd, elConfig)
  }
}
