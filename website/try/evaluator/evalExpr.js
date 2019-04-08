//@flow

import {realmStatus, compiledCode} from '../domain'
import scopedEval from './scopedEval'
import {transformCode} from './compiler'
import {getStackFrames} from './stackframe/getStackFrames'

export async function evalExpr(expr, vars) {
  status.init()
  //TODO: split into two effects
  try {
    const compiled = `${transformCode(expr)}
//# sourceURL=repl.js`
    //$off
    compiledCode.setState(compiled)
  } catch (error) {
    status.fail()
    throw {type: 'babel-error', original: error, stackFrames: []}
  }
  try {
    const exprFunc = scopedEval.runCode(compiledCode.getState())
    const results = exprFunc(vars)
    status.done()
    return results
  } catch (error) {
    status.fail()
    const stackFrames = await getStackFrames(error)
    throw {type: 'runtime-error', original: error, stackFrames}
  }
}

const status = {
  init() {
    realmStatus({
      active: true,
      throwError: false,
    })
  },
  done() {
    realmStatus({
      active: false,
      throwError: false,
    })
  },
  fail() {
    realmStatus({
      active: false,
      throwError: true,
    })
  },
}
