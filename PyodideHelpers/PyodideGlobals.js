import { Canvas } from "./graphics.js";
import { Karel } from "./karelapi.js";



// Declare interfaces that pyodide interacts with
// Convention: js{interaction theme}
self.jsgraphics = {
  create_canvas: (width, height) => {
    self.canvasInfo.client = new Canvas(width, height, self.canvasInfo.getImage);
    self.canvasInfo.active = true;
    return self.canvasInfo.client
  },
  // retrieved in python trace function
  _getGraphicsState: () => {
    return { ...self.canvasInfo.state}
  },
  canvasactive : () => {
    return self.canvasInfo.active
  },
  getCreateCanvasCount: () => {
    self.canvasInfo.initCount += 1
    return self.canvasInfo.initCount
  }
};

self.jskarel = {
  setup_karel : () => {
    self.karelInfo.client = new Karel(self.karelInfo.setState, self.karelInfo.startState)
    self.karelInfo.active = true
    return self.karelInfo.client
  },
  // retrieved in python trace function
  _getKarelState : () => {
    if(!self.karelInfo.client || !self.karelInfo.client.currentState){
      return null
    }
    return { ...self.karelInfo.client.currentState}
  },
  karelactive: () => {
    return self.karelInfo.active;
  },
  setKarelActive: () => {
    self.karelInfo.active = true
  },
  getUserModName: () => {
    return self.currentFile.substring(0, self.currentFile.lastIndexOf('.')).replace(/\//g, ".");
  },
  getRkp: () => {
    return self.karelInfo.initCount
  },
  incRkp: () => {
    self.karelInfo.initCount += 1
    return self.karelInfo.initCount
  },
  getSleepTime() {
    return self.karelInfo.sleepTime;
  }
}

self.jsPyQuery = {
  getFileName : () => {
    return `/home/pyodide/${self.currentFile}`
  },
  setStep(lineno, codenm, locals) {
    const frame = {
      lineno: lineno,
      codenm: codenm,
      locals: locals.toJs(),
      logptr: self.stepInfo.currlp
    }
    if(self.karelInfo.active && self.karelInfo.client) {
      frame["karel"] = {...self.karelInfo.client.currentState}
    }
    if(self.canvasInfo.active && self.canvasInfo.client) {
      frame["graphics"] = {...self.canvasInfo.client.canvasObjects}
    }
    self.stepInfo.frames.push(frame)
    if(self.stepInfo.frames.length > 2000) {
      self.stepInfo.frames.shift()
    }
  },

  getStep() {
    if (self.karelInfo.active) {
      return ["karel", {
        state: {...self.karelInfo.client.currentState}
      }, self.stepInfo.currlp]
    } else if (self.canvasInfo.active) {
      return ["graphics", {...self.canvasInfo.client.canvasObjects}, self.stepInfo.currlp]
    }

    return ["", {}, self.stepInfo.currlp]

  }
}

export {}
