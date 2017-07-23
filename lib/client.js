'use babel'

import WebSocket from 'ws'
import { readFile } from 'fs'

export default class {
  constructor(ip, port, logger) {
    this.ip = ip
    this.logger = logger
    this.url = `ws://${ip}:${port}/ws`

    logger.message("Connecting..." + ip)

    this.createClient()
  }

  createClient(callWhenOpened = null) {
    this.client = new WebSocket(this.url)

    this.client.on('open', () => {
      this.logger.message("Connected!")
      if (callWhenOpened) {
        callWhenOpened()
      }
    })

    this.client.on('message', (data) => {
      const message = JSON.parse(data)
      console.log(message)
      if (message.type && message.type == "message") {
        this.logger.message(message.text)
      } else if (message.type && message.type == "error") {
        this.logger.error("rpi> " + message.text)
      } else {
        this.logger.info("rpi> " + message.text)
      }
    })

    this.client.on('close', () => {
      console.log('retry connect')
      setTimeout(() => {
        this.createClient()

      }, 100)
    })
  }

  sizeBuffer(size) {
    const sizeBuffer = Buffer.allocUnsafe(2)
    sizeBuffer.writeUInt16BE(size)
    return sizeBuffer
  }

  messageBuffer(command, args) {
    const message = {cmd: command, args: args}
    return new Buffer(JSON.stringify(message))
  }

  send(messageBuffer, file = null) {
    let buffer = Buffer.concat([
      this.sizeBuffer(messageBuffer.length),
      messageBuffer
    ])
    if (file) {
      buffer = Buffer.concat([
        buffer,
        file
      ])
    }
    const send = () => {
      this.client.send(buffer)
    }
    if (!this.client || this.client.readyState != WebSocket.OPEN) {
      this.createClient(send)
    } else {
      send()
    }
  }

  putFile(filename, file) {
    this.send(
      this.messageBuffer("put", {filename: filename}),
      file)
  }

  run() {
    this.send(
      this.messageBuffer("run", {})
    )
  }
}
