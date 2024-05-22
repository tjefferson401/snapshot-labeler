const PYODIDE_BUILD = "/PyodideBuild/build/";


const SETUP_SCRIPT = (stepMode, testMode, uninterrupted, inputSize = 0) => {
  return `
from __future__ import print_function
try:
    import __builtin__
except ImportError:
    # Python 3
    import builtins as __builtin__
import time
import sys
finished = False
import unthrow
____step_freq = 10000000
unthrow.step_mode = "False"
unthrow.test_mode = "True"
unthrow.term_log = []
unthrow.max_lines = 100000
unthrow.step_list = []
unthrow.max_sl_size = 1000
unthrow.rec_depth = 800
time.sleep=lambda seconds: cip___throwSleep(seconds)
input=lambda printMessage="" : cip___throwInput(printMessage=printMessage)

__input_ctr_test__ = 0
__input_sze_test__ = ${inputSize}
__resumer=unthrow.Resumer()
__resumer.set_interrupt_frequency(____step_freq);
__unthrowActiveCommand__ = dict()
____unthrowActiveInput = ''
def cip___awaitclick():
    global __unthrowActiveCommand__
    if unthrow.test_mode:
        return 0
    __unthrowActiveCommand__["cmd"] = "awaitclick"
    unthrow.stop("awaitclick")
    __unthrowActiveCommand__ = dict()
def cip___throwSleep(seconds):
    global __unthrowActiveCommand__
    if unthrow.test_mode:
        return 0
    __unthrowActiveCommand__["cmd"] = "sleep"
    __unthrowActiveCommand__["data"] = seconds
    unthrow.stop("sleep")
    __unthrowActiveCommand__ = dict()
def cip___throwInput(printMessage):
    global __unthrowActiveCommand__
    __unthrowActiveCommand__["cmd"] = "input"
    __unthrowActiveCommand__["data"] = printMessage
    print(printMessage)
    if unthrow.test_mode:
        global __input_sze_test__, __input_ctr_test__
        if  __input_ctr_test__ >= __input_sze_test__:
            return ""
        __input_ctr_test__+=1
    unthrow.stop("input")
    __unthrowActiveCommand__ = dict()
    return ____unthrowActiveInput
# ANDREW TIERNO print unthrow frame to see issues
unthrow.cip___awaitclick = cip___awaitclick
`
}


const RUN_MAINAPP = `
if not __resumer.finished:
    __resumer.run_once(mainApp, "x")
else:
    finished = True
`

const RESET_MODULES = `
__resumer.cancel()
modules = []
for module in sys.modules:
  if "/home/pyodide" in str(sys.modules[module]):
    modules.append(module)
for module in modules:
  del sys.modules[module]
      `

const RESET_REPL = `
sys.settrace(None)
modules = []
for module in sys.modules:
  if "/home/pyodide" in str(sys.modules[module]):
    modules.append(module)
for module in modules:
  del sys.modules[module]
      `


const RESET_SCOPE = `
# if there is a current scope present
# transfer all of its variables in the current
# globals scope somewhere else
curr_scope = py_scope['current_scope']
# Always (almost) true
if curr_scope and curr_scope != new_scope:
    copy = py_scope['copy']
    py_scope['scopes'][curr_scope] = copy.copy(globals())
    # reset to init values first
    for var in list(globals().keys()):
        should_be_variables = list(py_scope['init_vars'].keys())
        should_be_variables += ['curr_scope', 'new_scope', 'copy', 'var']
        if var not in should_be_variables:
            del globals()[var]
    # add variables of the new scope if they exist
    globals().update(py_scope['scopes'].setdefault(new_scope, {}))
    del copy
    py_scope['current_scope'] = new_scope
del new_scope
del curr_scope
`


/*
await micropip.install(
  '/pyodide/karel-0.0.1-py3-none-any.whl'
)
*/
const INIT_SYSTEM_CODE = `
import sys
import micropip
# from js import graphics
await micropip.install(
  '/PyodideBuild/graphics-0.0.4-py3-none-any.whl'
)
await micropip.install(
  '/PyodideBuild/karel-0.0.1-py3-none-any.whl'
)
del micropip
`


const SET_STEPPING_LISTS = `
step_list = unthrow.step_list`


const REPL_SETUP =  `
import sys
from pyodide import to_js
from pyodide.console import PyodideConsole, repr_shorten
import __main__
import js
import os
pyconsole = PyodideConsole(__main__.__dict__)
import builtins
async def await_fut(fut):
  res = await fut
  if res is not None:
    builtins._ = res
  return to_js([res], depth=1)
def clear_console():
  pyconsole.buffer = []
__line_cnt__ = 0
__repl_input__ = ""
__std__input = builtins.input
def __cip_repl_input(prompt=''):
    data = js.replInput(prompt)
    return data

builtins.input = __cip_repl_input
`

const REPL_TRACE = `
__tf_ctr__ = 0
def trace_function(frame, event, arg):
    global __tf_ctr__
    __tf_ctr__  += 1

    if __tf_ctr__ > 110000:
        raise Exception("Stopping... The CIP Repl will only let you run about 100,000 total lines. Check to make sure all of your loops stop.")

    return trace_function

sys.settrace(trace_function)

`




export {
  SETUP_SCRIPT,
  RUN_MAINAPP,
  RESET_MODULES,
  RESET_SCOPE,
  INIT_SYSTEM_CODE,
  PYODIDE_BUILD,
  SET_STEPPING_LISTS,
  REPL_SETUP,
  REPL_TRACE,
  RESET_REPL
}
