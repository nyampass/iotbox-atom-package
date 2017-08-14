'use babel'

import { Client } from 'ssh2'
import request from 'request'
import fs from 'fs'

export default class {
  constructor(logger, host, ssid, password) {
    this.config = {
      logger: logger,
      host: host,
      username: 'pi',
      password: 'raspberry',
      wifiSsid: ssid,
      wifiPassword: password
    }
    this.conn = new Client()
  }

  run() {
    console.log("start run")
    const conn = this.conn,
      config = this.config,
      logger = this.config.logger,
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
          logger.message(`${config.host} / ${config.username} ${config.password}`)
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
        logger.message("Setup wifi setting")
          let cmd = `sudo sh -c '/usr/bin/wpa_passphrase ${config.wifiSsid} ${config.wifiPassword} >> /etc/wpa_supplicant/wpa_supplicant.conf'`
          console.log(cmd)

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
        }).then(() => {
          console.log(tmpStartupContents)
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
