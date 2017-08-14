'use babel'

import { CompositeDisposable } from 'atom'
import path from 'path'
import url from 'url'
import fs from 'fs'

import IotBoxPluginView from './iotbox-view'
import Client from './client'
import RpiSetup from './rpi-setup'

export default {
  subscriptions: null,
  view: null,

  config: {
    "ip": {
      "title": "Rasyberry Pi IP",
      "description": "Target Raspberry Pi IP for deploy",
      "type": "string",
      "default": "raspberrypi.local"
    },
    "setup": {
      "title": "Setup",
      "description": "Use when setting up Raspberry Pi",
      "type": "object",
      "properties": {
        "hostname": {
          "title": "Hostname",
          "type": "string",
          "default": "raspberrypi",
          "order": 1
        },
        "ssid": {
          "title": "Wifi SSID",
          "type": "string",
          "default": "",
          "order": 2
        },
        "password": {
          "title": "Wifi Password",
          "type": "string",
          "default": "",
          "order": 3
        }
      }
    }
  },

  activate(state) {
    this.view = new IotBoxPluginView({});

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'iotbox:toggle': () => this.toggle(),
      'iotbox:put-file': () => this.putFile(),
      'iotbox:run': () => this.run(),
      'iotbox:npm-update': () => this.npmUpdate(),
      'iotbox:rpi-setup': () => this.rpiSetup(),
    }));

    atom.workspace.addOpener((uriToOpen) => {
      const {protocol, host, pathname}  = url.parse(uriToOpen)
      if (protocol == 'iotbox:') {
        this.view = new IotBoxPluginView(pathname)
        this.getClient()
        return this.view
      }
    })
  },

  getClient() {
    if (this.client) {
      return this.client
    }
    const ip = atom.config.get('iotbox.ip') || this.config.ip.default
    return this.client = new Client(ip, 3030, this.view.logger)
  },

  deactivate() {
    this.view.destroy();
    this.subscriptions.dispose();
  },

  uriForEditor(path) {
    return `iotbox://view${path}`
  },

  toggle() {
    console.log(atom.project.getPaths())
    if (atom.project.getPaths().length <= 0) {
      atom.confirm({message: "プロジェクトのディレクトリ内で実行してください"})
      return
    }

    const projectPath = atom.project.getPaths()[0]

    if (atom.workspace.getActivePaneItem() instanceof IotBoxPluginView) {
      atom.workspace.destroyActivePaneItem()
      return
    }

    const uri = this.uriForEditor(projectPath)
    const previewPane = atom.workspace.paneForURI(uri)
    if (previewPane != null) {
      previewPane.destroyItem(previewPane.itemForURI(uri))
    } else {
      const previousActivePane = atom.workspace.getActivePane()
      atom.workspace.open(uri, {
        split: 'right',
        searchAllPanes: true
      }).then((view) => {
        if (view instanceof IotBoxPluginView) {
          previousActivePane.activate()
        }
      })
    }
  },

  putFile() {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor || !editor.getPath()) {
      return
    }
    const {name, ext} = path.parse(editor.getPath())
    this.getClient().putFile(
      `${name}${ext}`,
      fs.readFileSync(editor.getPath()))
  },

  run() {
    this.getClient().run()
  },

  npmUpdate() {
    this.getClient().npmUpdate()
  },

  rpiSetup() {
    const ip = atom.config.get('iotbox.ip') || this.config.ip.default
    const setupConfig = atom.config.get('iotbox.setup')

    this.view.logger.message("Start Raspbery Pi setup...")
    this.view.logger.message("Connecting..." + ip)

    new RpiSetup(this.view.logger, ip, setupConfig).run()
  }
};
