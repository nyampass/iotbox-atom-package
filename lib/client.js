'use babel'

import WebSocket from 'ws'
import { readFile } from 'fs'

export default class {
  constructor(ip, port, logger) {
    this.ip = ip
    this.logger = logger

    logger.info("Connecting..." + ip)

    this.client = new WebSocket(`ws://${ip}:${port}/ws`)

    this.client.on('open', () => {
      logger.info("Connected!")
    })

    this.client.on('message', (data) => {
      this.logger.info("rpi> " + data)
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
    this.client.send(buffer)
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
