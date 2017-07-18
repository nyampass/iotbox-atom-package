'use babel';
import {ScrollView} from 'atom-space-pen-views'

atom.themes.requireStylesheet(require.resolve('../styles/iot-box-plugin.less'))

export default class IotBoxPluginView extends ScrollView {
  static content() {
    this.div({class: "iot-box-plugin"})
  }

  logger
  appendLog(log) {
    this.log += "\n" + log
    this.text(this.log)
  }

  constructor(id) {
    super()

    this.log = ""
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
