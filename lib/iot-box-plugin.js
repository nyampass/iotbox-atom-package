'use babel'

import { CompositeDisposable, TextEditor } from 'atom'
import path from 'path'
import url from 'url'

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
        this.view = new IotBoxPluginView(pathname.substring(1))
        const ip = atom.config.get('iot-box-plugin.ip') || '192.168.1.10'
        this.client = new Client(ip, 3030, this.view.logger)
        return this.view
      }
    })
  },

  deactivate() {
    this.view.destroy();
    this.subscriptions.dispose();
  },

  uriForEditor(editor) {
    return `iot-box-plugin://editor/${editor.id}`
  },

  toggle() {
    if (atom.workspace.getActivePaneItem() instanceof IotBoxPluginView) {
      atom.workspace.destroyActivePaneItem()
      return
    }

    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) {
      return
    }
    const uri = this.uriForEditor(editor)
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
    

  },

  run() {

  }
};
