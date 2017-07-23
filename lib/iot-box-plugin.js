'use babel'

import { CompositeDisposable } from 'atom'
import path from 'path'
import url from 'url'
import fs from 'fs'

import IotBoxPluginView from './iot-box-plugin-view'
import Client from './client'

export default {
  subscriptions: null,
  view: null,

  config: {
    "ip": {
      "title": "Rasyberry Pi IP",
      "description": "Target Raspberry Pi IP for deploy",
      "type": "string",
      "default": "192.168.1.10"
    }
  },

  activate(state) {
    this.view = new IotBoxPluginView({});

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'iot-box-plugin:toggle': () => this.toggle(),
      'iot-box-plugin:put-file': () => this.putFile(),
      'iot-box-plugin:run': () => this.run(),
    }));

    atom.workspace.addOpener((uriToOpen) => {
      const {protocol, host, pathname}  = url.parse(uriToOpen)
      if (protocol == 'iot-box-plugin:') {
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
    const ip = atom.config.get('iot-box-plugin.ip') || '192.168.1.10'
    return this.client = new Client(ip, 3030, this.view.logger)
  },

  deactivate() {
    this.view.destroy();
    this.subscriptions.dispose();
  },

  uriForEditor(path) {
    return `iot-box-plugin://view${path}`
  },

  toggle() {
    console.log(atom.project.getPaths())
    if (atom.project.getPaths().length <= 0) {
      atom.confirm({message: "プロジェクトのディレクトリ内で実行してください"})
      return
    }

    const projectPath =atom.project.getPaths()[0]

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
  }
};
