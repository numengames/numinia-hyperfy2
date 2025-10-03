import { readPacket, writePacket } from './packets'

export class Socket {
  constructor({ id, ws, network, player }) {
    this.id = id
    this.ws = ws
    this.network = network

    this.player = player

    this.alive = true
    this.closed = false
    this.disconnected = false
    this.missedPongs = 0 // Track consecutive missed pongs
    this.maxMissedPongs = parseInt(process.env.MAX_MISSED_PONGS || '3') // Configurable tolerance

    this.ws.on('message', this.onMessage)
    this.ws.on('pong', this.onPong)
    this.ws.on('close', this.onClose)
  }

  send(name, data) {
    // console.log('->', name, data)
    const packet = writePacket(name, data)
    this.ws.send(packet)
  }

  sendPacket(packet) {
    this.ws.send(packet)
  }

  ping() {
    if (!this.alive) {
      this.missedPongs++
      if (this.missedPongs >= this.maxMissedPongs) {
        // Too many missed pongs, mark as dead
        console.log(`Socket ${this.id} marked as dead after ${this.missedPongs} missed pongs`)
        return false
      } else {
        // Log missed pongs for monitoring (but don't spam)
        if (this.missedPongs === 1) {
          console.log(`Socket ${this.id} missed pong (${this.missedPongs}/${this.maxMissedPongs})`)
        }
      }
    }
    this.alive = false
    this.ws.ping()
    return true
  }

  // end(code) {
  //   this.send('end', code)
  //   this.disconnect()
  // }

  onPong = () => {
    this.alive = true
    this.missedPongs = 0 // Reset missed pongs counter
  }

  onMessage = packet => {
    const [method, data] = readPacket(packet)
    this.network.enqueue(this, method, data)
    // console.log('<-', method, data)
  }

  onClose = e => {
    this.closed = true
    this.disconnect(e?.code)
  }

  disconnect(code) {
    if (!this.closed) return this.ws.terminate()
    if (this.disconnected) return
    this.disconnected = true
    this.network.onDisconnect(this, code)
  }
}
