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
      this.logger.info("> " + data)
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

  putFile(filename, file) {
    const messageBuff = this.messageBuffer("put", {filename: filename})
    this.client.send(Buffer.concat([
      this.sizeBuffer(messageBuff.length),
      messageBuff,
      file
    ]))
  }

  run() {
    const runBuffer = this.messageBuffer("run", {})
    this.client.send(runBuffer)
  }
}
