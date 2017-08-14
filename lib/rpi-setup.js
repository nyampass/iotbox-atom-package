'use babel'

import { Client } from 'ssh2'
import request from 'request'
import fs from 'fs'

export default class {
  constructor(logger, host, setupConfig) {
    this.logger = logger
    this.config = {
      host: host,
      username: 'pi',
      password: 'raspberry',
      setupHostName: setupConfig.hostname,
      wifiSsid: setupConfig.ssid,
      wifiPassword: setupConfig.password
    }
    this.conn = new Client()
  }

  sendCommand(conn, cmd) {
    this.logger.message("Send command: " + cmd)
    return new Promise((resolve) => {
      conn.exec(cmd, (err, stream) => {
        if (err) throw err
        stream.on('close', function(code, signal) {
          console.log('close')
          resolve()
        }).on('data', function(data) {
          console.log('STDOUT: ' + data)
        }).stderr.on('data', function(data) {
          console.log('STDERR: ' + data)
        })
      })
    })
  }

  run() {
    console.log("start run")
    const conn = this.conn,
      config = this.config,
      logger = this.logger,
      tmpStartupPath = "/tmp/project.clj"

    let tmpStartupContents = null

    new Promise((resolve, rejected) => {
      const tmpStartup = fs.createWriteStream(tmpStartupPath)

      request("https://raw.githubusercontent.com/nyampass/iotbox-rpi/master/project.clj")
        .pipe(tmpStartup)
      tmpStartup.on('close', () => {
        resolve(tmpStartupPath)
      })
    }).then((path) => {
      return new Promise((resolve) => {
        fs.readFile(path, function (err, data) {
          if (err) throw err
          tmpStartupContents = data
          resolve()
        })
      })
    }).then(() => {
        return new Promise((resolve) => {
          conn.on('ready', function() {
            logger.message("Connected RPi")
            resolve()
          })
          conn.connect({
            host: config.host,
            username: config.username,
            password: config.password
          })
        })
      }).then(() => {
        if (config.wifiSsid && config.wifiPassword) {
          logger.message("Setup wifi setting")
            let cmd = `sudo sh -c '/usr/bin/wpa_passphrase ${config.wifiSsid} ${config.wifiPassword} >> /etc/wpa_supplicant/wpa_supplicant.conf'`
            return this.sendCommand(conn, cmd)
        }
        return null

      }).then(() => {
          logger.message("Set hostname")
          const host = config.setupHostName
          let cmd = `sudo sh -c 'hostname ${host} && echo ${host} > /etc/hostname && echo 127.0.0.1 ${host} >> /etc/hosts'`
          return this.sendCommand(conn, cmd)

      }).then(() => {
          logger.message("Setup start script")
          conn.sftp(function(err, sftp) {
            if (err) throw err
            var file = sftp.createWriteStream('/home/pi/startup.sh')
            file.write(tmpStartupContents, () => {
              conn.end()
              logger.message("Done setup")
            })
          })
        }).catch((err) => {
          logger.error("Failed setup Raspberry Pi")
          logger.error(err)
        })
  }
}
