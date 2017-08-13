'use babel';
import {ScrollView, $} from 'atom-space-pen-views'
import moment from 'moment'
import path from 'path'

atom.themes.requireStylesheet(require.resolve('../styles/iotbox.less'))

export default class IotBoxPluginView extends ScrollView {
  static content() {
    this.div({class: "iotbox"})
  }

  appendLog(type, log) {
    const LOG_LIMIT = 200
    this.logs.push({
      type: type,
      text: `${moment().format("HH:mm:ss")}: ${log}`
    })

    if (this.logs.length > LOG_LIMIT) {
      this.logs.splice(0, 1)
    }

    let logs = []
    for (log of this.logs) {
      logs.push(
        `<span class=\"${log.type}\">` +
        log.text +
        "</span>"
      )
    }
    this.html(logs.join("<br>"))

    const div = $(".iotbox")
    if (div && div.length > 0) {
      div.scrollTop(div[0].scrollHeight)
    }
  }

  constructor(path) {
    super()

    this.logs = []
    this.text("")
    this.path = path

    this.logger = {
      message: (text) => {
        this.appendLog("message", text)
      },
      info: (text) => {
        this.appendLog("info", text)
      },
      error: (text) => {
        this.appendLog("error", text)
      }
    }
  }

  serialize() {}

  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  renderContainer() {

  }

  getTitle() {
    return "IoT Box #" + path.parse(this.path).name
  }

  getURI() {
    return `iotbox:/view${this.path}`
  }
}
