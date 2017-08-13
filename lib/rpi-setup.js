'use babel'

import { Client } from 'ssh2'
import request from 'request'
import fs from 'fs'

export default class {
  constructor(host, ssid, password) {
    this.config = {
      host: host,
      username: 'pi',
      password: 'raspberry',
      wifiSsid: ssid,
      wifiPassword: password
    }
    this.conn = new Client()
  }

  setupReady(conn, config) {
    conn.on('ready', function() {
      let cmd = `sudo sh -c '/usr/bin/wpa_passphrase ${config.wifiSsid} ${config.wifiPassword} >> /etc/wpa_supplicant/wpa_supplicant.conf'`
      console.log(cmd)
      conn.exec(cmd, (err, stream) => {
        if (err) throw err
        stream.on('close', function(code, signal) {
          conn.end()
        }).on('data', function(data) {
          console.log('STDOUT: ' + data)
        }).stderr.on('data', function(data) {
          console.log('STDERR: ' + data)
        })
      })

      conn.sftp(function(err, sftp) {
        if (err) throw err
        var file = sftp.createWriteStream('/home/pi/hoge')
        file.write("hoge\n", () => {
          conn.end()
          // callback()
        })
      })
    })
  }

  run(logger) {
    this.logger = logger
    let config = this.config,
      conn = this.conn

    request("https://raw.githubusercontent.com/nyampass/iotbox-rpi/master/project.clj")
      .pipe(fs.createWriteStream("/tmp/hoge"))
      .then(() => {
        return this.setupReady(conn, config, resolve, rejected)
       })
      .then((conn) => {
              conn.connect({
                    host: config.host,
                    username: config.username,
                    password: config.password
                  });
            })
  }
}
