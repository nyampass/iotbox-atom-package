'use babel'

import WebSocket from 'ws'
import { readFile } from 'fs'
import net from 'net'

export default class {
  constructor(ip, port, logger) {
    this.ip = ip
    this.port = port
    this.logger = logger
    this.url = `ws://${ip}:${port}/ws`

    logger.message("Connecting..." + ip)

    this.createClient()
  }

  tryConnect(host, port) {
    console.log(host, port)
    return new Promise((resolve, rejected) => {
      const con = net.connect({host: host, port: port}, () => {
        con.end();
        console.log("try connect: success")
        resolve()
      }).on("error", (e) => {
        console.log("try connect: failed")
        rejected(e)
      })
    })
  }

  createClient(callWhenOpened = null) {
    this.tryConnect(this.ip, this.port)
      .then(() => {
        console.log("ok")
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
      }).catch((e) => {
        console.log(e)
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

  npmUpdate() {
    this.send(
      this.messageBuffer("npm-update", {})
    )
  }
}
