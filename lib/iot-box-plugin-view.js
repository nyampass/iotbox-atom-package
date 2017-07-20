'use babel';
import {ScrollView, $} from 'atom-space-pen-views'
import moment from 'moment'

atom.themes.requireStylesheet(require.resolve('../styles/iot-box-plugin.less'))

export default class IotBoxPluginView extends ScrollView {
  static content() {
    this.div({class: "iot-box-plugin"})
  }

  appendLog(log) {
    const LOG_LIMIT = 200
    this.logs.push(`${moment().format("HH:mm:ss")}: ${log}`)

    if (this.logs.length > LOG_LIMIT) {
      this.logs.splice(0, 1)
    }
    this.html(this.logs.join("<br>"))

    const div = $(".iot-box-plugin")
    if (div && div.length > 0) {
      div.scrollTop(div[0].scrollHeight)
    }
  }

  constructor(id) {
    super()

    this.logs = []
    this.text("")
    this.id = id

    this.logger = {
      info: (message) => {
        this.appendLog(message)
      },
      error: (message) => {
        this.appendLog(message)
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
    return "IoT Box"
  }

  getURI() {
    return `iot-box-plugin://editor/${this.id}`
  }
}
