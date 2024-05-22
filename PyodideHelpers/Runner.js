import { PYODIDE_BUILD, INIT_SYSTEM_CODE, RUN_MAINAPP, RESET_MODULES, SET_STEPPING_LISTS, SETUP_SCRIPT,REPL_SETUP, REPL_TRACE, RESET_REPL } from "./Utils.js";
import {} from './PyodideGlobals.js'
import { Karel } from "./karelapi.js";

// Inits global variables
// See PyodideGlobals.ts for info

self.karelInfo = {
  client: undefined,
  active: false,
  initCount: 0,
  startState: null,
  setState: null,
  sleepTime: 0.2
}

self.canvasInfo = {
  client: undefined,
  active: false,
  initCount: 0,
  state: {},
  getImage: null,
  id: "canvas",
  mouseDownPromise: undefined
}

self.stepInfo = {
  frames: [],
  stdout: [],
  offset: 5,
  active: true,
  currlp: -1,
  error: [],
  error_message: [],
}

self.testState = {
  isTesting: false,
  testLock: undefined,
}

self.replInput = (message) => {
  handleOutput(message)
  const data = prompt(message)
  handleOutput(data, false)
  return data
}

// Step tracking
let runningPromise = null;
let initialGlobals = null;
// Output functions:
let handleOutput = (stdout, nl = true) => console.log(stdout)
let handleError = (stderr) => console.log(stderr)
let code = ""

let pyodide;


export async function setPyodide() {
  // check if pyodide already exists
  if (pyodide) {
    return "Pyodide Already Initialized";
  }

  // Load pyodide and packages
  try {
    pyodide = await loadPyodide({
      indexURL: PYODIDE_BUILD,
      stderr: (stderr) => handleError(stderr),
      stdout: (stdout) => handleOutput(stdout)
    });
    await pyodide.loadPackage(`${PYODIDE_BUILD}numpy.js`);
    await pyodide.loadPackage(`${PYODIDE_BUILD}unthrow.js`);
    await pyodide.loadPackage(`${PYODIDE_BUILD}pyparsing.js`);
    await pyodide.loadPackage(`${PYODIDE_BUILD}packaging.js`);
    await pyodide.loadPackage(`${PYODIDE_BUILD}micropip.js`);
  } catch(e) {
      // statements to handle TypeError exceptions
  }

  // Run Initialization code
  await pyodide.runPythonAsync(INIT_SYSTEM_CODE);

  initialGlobals = new Set(pyodide.globals.toJs().keys());
  return "Pyodide Initialization Complete";
}




// Class handles pyodide logic
export class PyodideApi {
  // private isPythonRunning: boolean
  // private userDefStdoutHandler;
  // private userDefStdinHandler;
  // private userDefStderrHandler;
  // private userDefEndHandler;
  // private userDefStepHandler;
  // private userDefImgHandler;
  // private errorPromQueue: any[] = [];

  constructor() {
    this.isPythonRunning = false;
    this.userDefStdoutHandler = () => {};
    this.userDefStdinHandler = () => {};
    this.userDefStderrHandler = () => {};
    this.userDefEndHandler = () => {};
    this.userDefStepHandler = () => {};
    this.userDefImgHandler = () => {};
    this.errorPromQueue = [];

  }


  handleStdout(stdout, nl = true) {
    this.userDefStdoutHandler(stdout, nl)
  }

  async handleStderr(stderr) {
    // Returns object with promise member and resolve member
    let resolveFunc;
    const errprom = {
      promise: new Promise(function (resolve) {
        resolveFunc = resolve;
      }),
      resolve: resolveFunc,
    };
    this.errorPromQueue.push(errprom)
    if(self.stepInfo.active) {
      self.stepInfo.error.push(stderr)
    }

    // Grab the error message given to the student
    const errorMessage = await this.userDefStderrHandler(stderr, code);
    self.stepInfo.error_message.push(errorMessage)

    errprom.resolve()
    this.setRunningFlag();
  }

  async handleStdin(opt="") {
    return await this.userDefStdinHandler(opt)
  }

  async handleRunEnd() {
    // If in step mode, set step list
    while(this.errorPromQueue.length > 0) {
      await this.errorPromQueue[this.errorPromQueue.length - 1].promise;
      this.errorPromQueue.pop()
    }
    if(self.stepInfo.active && !self.testState.isTesting) {
      await this._setStepList()
      self.stepInfo.frames = self.stepInfo.frames.map((frame) => Object.fromEntries(frame))
      const stdoutOffset = self.stepInfo.currlp - 1000;
      if(stdoutOffset > 0) {

        for(let i of self.stepInfo.frames)  {
          i["logptr"] = i["logptr"] - stdoutOffset
          i["locals"] = Object.fromEntries(i["locals"])
        }
      }
      if(self.stepInfo.error) {
        self.stepInfo.stdout.push(...self.stepInfo.error)
      }
      const newInfo = {
        lineno: -1,
        logptr: self.stepInfo.currlp + 1,
        codenm: "Program Ended",
        locals: {}
      }

      if(self.karelInfo.active) {
        newInfo["karel"] = {
          state: {...self.karelInfo.client.currentState}
        }
      } else if(self.canvasInfo.active) {
        newInfo["graphics"] = { ...self.canvasInfo.state }
      }

      self.stepInfo.frames.push(newInfo)
    }
    // Reset globals/Remove prior imports
    try {
      await pyodide.runPython(RESET_MODULES);
    } catch(e) {}
    this.setRunningFlag();
    try {
      // Remove files
      this._resetPyodideFS()
    } catch (e) {
      await this.handleStderr(e.message);
    }
    if (runningPromise) {

      runningPromise.resolve()
    }
    this.userDefEndHandler();
  }

  async runPython(codeToRun, activeFile, stepmode = true, uninterrupted=3000, inputSize=0, canvasId="canvas") {
    this.setCanvasId(canvasId)
    code = codeToRun
    self.stepInfo.active = stepmode
    self.currentFile = activeFile.name
    if(runningPromise) {
      await runningPromise.promise;
    }
    let resolveFunc;
    runningPromise = {
      promise: new Promise(function (resolve) {
        resolveFunc = resolve;
      }),
      resolve: resolveFunc,
    };
    if(pyodide) {
      // If libraries were used in last run, set as unused
      this._resetLibraries()
      this._resetStep()
      // load imports
      await pyodide.loadPackagesFromImports(codeToRun)
      // formate and exec scripts
      const mainApp = this._formatUserCodeFunction(codeToRun)
      const setupScript = this._formatSetupScript(self.stepInfo.active, self.testState.isTesting, uninterrupted, inputSize)
      await this._executeScripts(mainApp, setupScript)
      await runningPromise.promise
      const endStates = {
        karel: self.karelInfo.client ? {...self.karelInfo.client.currentState} : {},
        graphics: {...self.canvasInfo.state},
        error: [...self.stepInfo.error],
        output: [...self.stepInfo.stdout],
        error_message: [...self.stepInfo.error_message],
      }

      return endStates;
    }
    else {
      // Indicate that Python is still Loading
      console.warn("Python Is Still Loading")
    }
    return {}
  }



  async loadFiles(fileStructure, filesCode) {
    try {
      for (let i = 0; i < fileStructure.length; i++) {
        await this.loadFile(
          fileStructure[i].name,
          filesCode[fileStructure[i].id]?.content ?? ``
        );
      }
    } catch (error) {
      await this.handleStderr(error.message);

      return false;
    }
    return true
  }

  async loadFile(path, contents) {
    if(!pyodide) { return false; }
    const formattedContents = `
${contents}
`
    const mkdir = await this._mkdir(path);
    if(!mkdir) {return false;}
    try {
      await pyodide.FS.writeFile(path, formattedContents);
    } catch (error) {
      await this.handleStderr(error.message)
      return false;
    }

    return true;
  }


  setInitialGlobals(ig) {
    initialGlobals = ig;
  }

  setRunningFlag(flagValue = false) {
    if(self.canvasInfo && self.canvasInfo.mouseDownPromise) {
      self.canvasInfo.mouseDownPromise.resolve()
    }
    this.isPythonRunning = flagValue
  }

  setUserDefinedFuncs(onRunEnd , onOutput, onError, onInput, onStep, onImage) {
    this.userDefEndHandler = onRunEnd;
    this.userDefStdoutHandler = onOutput;
    this.userDefStderrHandler = onError;
    this.userDefStdinHandler = onInput;
    this.userDefStepHandler = onStep;
    this.userDefImgHandler = onImage;

    self.canvasInfo.getImage = (file) => this.userDefImgHandler(file)
    handleOutput = (stdout, nl = true) => {
      if(self.stepInfo.active) {
        self.stepInfo.currlp +=1
        self.stepInfo.stdout.push(stdout)
        if(self.stepInfo.stdout.length > 1000) {
          self.stepInfo.stdout.shift()
        }
      }
      this.handleStdout(stdout, nl)
    }
    handleError = async (stderr) => {
      await this.handleStderr(stderr)
    }
  }

  setKarelInfo(startState, setWorldState, sleepTime) {
    if(self.karelInfo.client) {
      self.karelInfo.client.resetKarel(startState, setWorldState)
    } else {
      self.karelInfo.client = new Karel(setWorldState, startState);
      self.karelInfo.startState = startState
      self.karelInfo.setState = setWorldState
    }
    self.karelInfo.sleepTime = sleepTime
  }

  setCanvasId(id) {
    self.canvasInfo.id = id;
  }

  getRunningFlag() {
    return this.isPythonRunning;
  }



  getStepListLength() {
    if(self.stepInfo.active) {
      return self.stepInfo.frames.length
    }
    else {
      return 0
    }
  }

  getStepOutput(ptr) {
    if(self.stepInfo.active) {
      return self.stepInfo.stdout.slice(0, self.stepInfo.frames[ptr]["logptr"])
    } else {
      return []
    }
  }




  _formatUserCodeFunction(code) {
    const mainDef = `
def mainApp(___arg):
    pass`;
    const codeSplit = code.split("\n");
    let indentedCode = ``;
    let imports = ``;
    let lineNo = 0
    for (let line of codeSplit) {
      if ((line.substring(0, 4) !== "from" && line.substring(line.length - 1) !== "*")) {
        indentedCode = indentedCode + `    ${line}\n`;
      }
      else if(line !== "") {
        imports = imports + `${line}\n`;
      }
      lineNo += 1
    }

      const formattedUserCodeFunction = `
${imports}
${mainDef}
${indentedCode}
`;

    return formattedUserCodeFunction
  }

   _formatSetupScript(stepOn, testOn, uninterrupted = 2000, inputSize = 0) {
    return SETUP_SCRIPT(stepOn && ! testOn, testOn, uninterrupted, inputSize);
  }

  async _executeScripts(mainAppScript, setupScript) {
    try {
      this.setRunningFlag(true);
      await pyodide.runPython(setupScript);
      await pyodide.runPython(mainAppScript);

      await this._runResumerCallback();
    } catch (e) {
      await this.handleStderr(e.message);
      await this.handleRunEnd()
      this.setRunningFlag();
    }
  }

   async _runResumerCallback() {
    try {
      await pyodide.runPython(RUN_MAINAPP)
    } catch (e) {
      await this.handleStderr(e.message)
      await this.handleRunEnd()
      this.setRunningFlag();
      return;
    }
    
    const userCmd = pyodide.globals.get("__unthrowActiveCommand__").toJs();
    const runFinished = pyodide.globals.get("finished");
    if(runFinished) {
      await this.handleRunEnd()
    } else if(! this.isPythonRunning) {
      this.handleStdout("KeyboardInterrupt")
      await this.handleRunEnd()
    } else {
      await this._handleUnthrow(userCmd);
    }
  }

   async _handleUnthrow(userCmdMap) {
    switch (userCmdMap.get("cmd")) {
      case "sleep":
        const s = userCmdMap.get("data");
        if(! self.testState.isTesting) {
          setTimeout(this._runResumerCallback.bind(this), 1000 * s);
        } else {
          setTimeout(this._runResumerCallback.bind(this), 0);
        }
        break;
      case "input":
        const printMsg = userCmdMap.get("data")
        const result = await this.handleStdin(printMsg);
        self.stepInfo.stdout[self.stepInfo.stdout.length - 1] = self.stepInfo.stdout[self.stepInfo.stdout.length - 1] + result
        pyodide.globals.set("____unthrowActiveInput", result);
        setTimeout(this._runResumerCallback.bind(this));
        break;
      case "awaitclick":
        await self.canvasInfo.client.wait_for_click();
        setTimeout(this._runResumerCallback.bind(this));
        break;
      default:
        setTimeout(this._runResumerCallback.bind(this));
        break;
    }
  }

 async _setStepList() {
     pyodide.runPython(SET_STEPPING_LISTS)
    self.stepInfo.frames = pyodide.globals.get("step_list").toJs()
  }


  async _mkdir(filePath) {
    const slashIndex = filePath.lastIndexOf("/");
    const dir = filePath.substring(0, slashIndex);
    if (filePath.indexOf("/") !== -1) {
      this._mkdir(dir);
    }
    if (dir.length > 0) {
      try {
        await pyodide.FS.mkdir(dir);
      } catch (error) {
        await this.handleStderr(error.message)
        return false;
      }
    }

    return true;
  }


  _resetPyodideFS() {
    for (const globalKey of pyodide.globals.toJs().keys()) {
      if (!initialGlobals.has(globalKey)) {
        pyodide.globals.delete(globalKey);
      }
    }
  }

  _resetLibraries() {
    self.karelInfo.initCount = 0;
    self.canvasInfo.initCount = 0
    if(self.karelInfo.active) {
      self.karelInfo.active = false;
      self.karelInfo.client.resetKarel();
    }
    if(self.canvasInfo.active) {
      self.canvasInfo.client = undefined;
      self.canvasInfo.active = false;
      self.canvasInfo.state = {};
    }
  }


  _resetStep() {
    self.stepInfo = {
      frames: [],
      stdout: [],
      offset: 5,
      active: self.stepInfo.active,
      currlp: 0,
      error: [],
      error_message: [],
    }
  }

  async test(code, input, file) {
    if(runningPromise) {
      await runningPromise.promise
    }
    self.testState.isTesting = true;
    // Init testing lock to await
    // Possibly lock run code functionality. Need to add infinite loop detection
    // Init return vals
    const output = []
    const error = []
    const inputObjs = {}
    let inputPtr = -1
    // Save user funcs
    const preFuncs = this._getUserDefFuncs()

    // Set handlers

    this.setUserDefinedFuncs(
      () => {},
      (stdout) => { output.push(stdout); },
      (stderr) => { error.push(stderr); },
      () => {
        inputPtr++;
        inputObjs[output.length - 1] = input[inputPtr]
        return input[inputPtr];
      },
      null,
      null)

    // Run code
    try {
      await this.runPython(code, file, false, 2000, input.length)
    }catch(e) {
      error.push(e.message)
    }


    // Await lock
    // Reset funcs
    this.setUserDefinedFuncs(preFuncs.end, preFuncs.out, preFuncs.err, preFuncs.inp, preFuncs.stp, preFuncs.img)

    // Turn off testing mode

    self.testState.isTesting = false;
    // Return end states
    const endStates = {
      karel: self.karelInfo.client ? {...self.karelInfo.client.currentState} : {},
      graphics: {...self.canvasInfo.state},
      error: [...error],
      output: [...output],
      input: inputObjs
    }

    return endStates;
  }


  async crackedTest(code, input, file) {
    // if(runningPromise) {
    //   await runningPromise.promise
    // }
    self.testState.isTesting = true;
    // Init testing lock to await
    // Possibly lock run code functionality. Need to add infinite loop detection
    // Init return vals
    const output = []
    const error = []
    const inputObjs = {}
    let inputPtr = -1
    // Save user funcs
    this.setUserDefinedFuncs(
      () => {},
      (stdout) => { 
        console.log(stdout, "STDOUT")
        output.push(stdout); },
      (stderr) => { error.push(stderr); },
      () => {
        inputPtr++;
        inputObjs[output.length - 1] = input[inputPtr]
        return input[inputPtr];
      },
      null,
      null)


    // Run code
    try {
      await this.runPython(code, file, false, 20000, input.length)
    }catch(e) {
      error.push(e.message)
    }


    // Turn off testing mode

    // self.testState.isTesting = false;
    // Return end states
    const endStates = {
      karel: self.karelInfo.client ? {...self.karelInfo.client.currentState} : {},
      graphics: {...self.canvasInfo.state},
      error: [...error],
      output: [...output],
      input: inputObjs
    }

    return endStates;
  }


  _getUserDefFuncs() {
    return {
      end: this.userDefEndHandler,
      out: this.userDefStdoutHandler,
      err: this.userDefStderrHandler,
      inp: this.userDefStdinHandler,
      stp: this.userDefStepHandler,
      img: this.userDefImgHandler
    }
  }



  async enterReplMode(stopRepl) {
    this.exitRepl = stopRepl;
    if(! pyodide) { return; }
    this.namespace = pyodide.globals.get("dict")();
    let resolveFunc;
    runningPromise = {
      promise: new Promise(function (resolve) {
        resolveFunc = resolve;
      }),
      resolve: resolveFunc,
    };
    pyodide.runPython(
      REPL_SETUP,
    this.namespace
    );

    this.repr_shorten = this.namespace.get("repr_shorten");
    this.await_fut = this.namespace.get("await_fut");
    this.pyconsole = this.namespace.get("pyconsole");
    this.clear_console = this.namespace.get("clear_console");
    this.promptType = true;
    this.namespace.destroy();

    runningPromise.resolve();

  }

  async interpreter(command) {
    await pyodide.runPython(REPL_TRACE)
    if(runningPromise && runningPromise.promise) {
      await runningPromise.promise
    }
    let resolveFunc;
    runningPromise = {
      promise: new Promise(function (resolve) {
        resolveFunc = resolve;
      }),
      resolve: resolveFunc,
    };
    // multiline should be splitted (useful when pasting)
    for (const c of command.split("\n")) {
      let fut = this.pyconsole.push(c);
      fut.syntax_check === "incomplete" ? this.promptType = false : this.promptType = true;
      switch (fut.syntax_check) {
        case "syntax-error":
          this.handleStderr(fut.formatted_error.trimEnd());
          continue;
        case "incomplete":
          continue;
        case "complete":
          break;
        default:
          throw new Error(`Unexpected type ${fut.syntax_check}`);
      }
      // In JavaScript, await automatically also awaits any results of
      // awaits, so if an async function returns a future, it will await
      // the inner future too. This is not what we want so we
      // temporarily put it into a list to protect it.
      let wrapped = this.await_fut(fut);
      // complete case, get result / error and print it.
      try {
        let [value] = await wrapped;
        if (value !== undefined) {
          this.handleStdout(
            this.repr_shorten.callKwargs(value, {
              separator: "\n[[;orange;]<long output truncated>]\n",
            })
          );
        }
        if (pyodide.isPyProxy(value)) {
          value.destroy();
        }
      } catch (e) {
        if (e.constructor.name === "PythonError") {
          const message = fut.formatted_error || e.message;
          const lines = message.split('\n')
          if(lines.length > 1 && lines[lines.length - 2].includes("SystemExit")) {
            this.exitRepl()
          } else {
            this.handleStderr(message.trimEnd());
          }
        } else {
          throw e;
        }
      } finally {
        fut.destroy();
        wrapped.destroy();
      }
    }

    while(this.errorPromQueue.length > 0) {
      await this.errorPromQueue[this.errorPromQueue.length - 1].promise;
      this.errorPromQueue.pop()
    }
    runningPromise.resolve();
    return this.promptType;
  }

  async endRepl() {
    await pyodide.runPython(RESET_REPL);
  }







}




