

export const KAREL_IMG_PCT = 0.8;
export const BEEPER_IMG_PCT = 0.5;
export const CROSS_PCT = 0.1;
export const MAX_CORNER_SIZE = 80
export const MIN_CORNER_SIZE = 5




export function isValidWorldState(worldState) {
  if (!worldState) {
    return false
  }
  const requiredFields = [
    "nRows",
    "nCols",
    "karelRow",
    "karelCol",
    "karelDir"
  ]
  for (const field of requiredFields) {
    if (!(field in worldState)) {
      console.error(`missing field ${field} in karel state`)
      console.error(worldState)
      return false
    }
  }
  if (!isValidRowCol({ worldState }, worldState.karelRow, worldState.karelCol)) {
    return false
  }

  // ok to not have these, but they must be well formed
  const optionalFields = [
    "walls",
    "paint",
    "beepers"
  ]
  return true
}

export function getDefaultWorldState(nRows, nCols) {
  return {
    nRows,
    nCols,
    karelRow: nRows - 1,
    karelCol: 0,
    karelDir: 'East',
    beepers: {},
    paint: {},
    walls: {}
  }
}

export function areOutputsEqual(testOutput, userOutput) {
  if (testOutput === userOutput) return true;
  if (testOutput == null || userOutput == null) return false;
  if (testOutput.length !== userOutput.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < testOutput.length; ++i) {
    if (testOutput[i].replace(/\s+/g, '') !== userOutput[i].replace(/\s+/g, '')) return false;
  }
  return true;
}

export function areWorldsEqual(world1, world2) {
  if (!world1 || !world2) {
    return false
  }
  const keysThatMustBeEqual = [
    'nRows',
    'nCols',
    'karelRow',
    'karelCol',
    'karelDir'
  ]
  for (const key of keysThatMustBeEqual) {
    if (world1[key] != world2[key]) {
      return false
    }
  }
  return areBeepersEqual(world1, world2) && isPaintEqual(world1, world2)
}

function areBeepersEqual(world1, world2) {
  // beepers might not be defined
  const beepers1 = world1.beepers ? world1.beepers : {}
  const beepers2 = world2.beepers ? world2.beepers : {}

  // some functions take a state
  const state1 = { worldState: world1 }
  const state2 = { worldState: world2 }

  // get the union of all the places with beepers between the two worlds
  const allKeys = { ...beepers1, ...beepers2 }
  for (const key in allKeys) {
    // sometimes the world editor can leave beepers outside the board :(
    const [row, col] = parseRowColString(key)
    if (isValidRowCol(state1, row, col)) {
      const nBeepers1 = getNBeepers(state1, row, col)
      const nBeepers2 = getNBeepers(state2, row, col)
      if (nBeepers1 != nBeepers2) {
        return false
      }
    }
  }
  return true
}

function isPaintEqual(world1, world2) {
  // beepers might not be defined
  const paint1 = world1.paint ? world1.paint : {}
  const paint2 = world2.paint ? world2.paint : {}

  function isTransparent(colorStr) {
    if (colorStr === 'transparent' || colorStr === 'none') {
      return true
    }
    return false
  }

  const allKeys = { ...paint1, ...paint2 }
  for (const key in allKeys) {
    // we don't check that the corners are different colors
    // instead we just check if one corner has color and the other
    // doesn't
    if (!paint1[key] && !isTransparent(paint2[key])) {
      return false
    }
    if (!paint2[key] && !isTransparent(paint1[key])) {
      return false
    }
  }
  return true
}

export function getNBeepers(state, row, col) {
  if (!state.worldState.beepers) {
    return 0
  }
  const rowColStr = makeRowColKey(row, col)
  if (!(rowColStr in state.worldState.beepers)) {
    return 0
  }
  return state.worldState.beepers[rowColStr]
}

export function getCornerX(state, row, col) {
  return getWorldLeft() + col * getCornerSize(state);
}

export function getCornerY(state, row, col) {
  return getWorldTop() + row * getCornerSize(state);
}

export function xyToRowCol(state, x, y) {
  const size = getCornerSize(state)
  const row = Math.floor(y / size)
  const col = Math.floor(x / size)
  return [row, col]
}

export function getCornerSize(state) {
  if (!state.canvasState.ref || !state.canvasState.ref.current) {
    return MIN_CORNER_SIZE;
  }

  const curr = state.canvasState.ref.current;
  if (curr) {
    // get the width of the canvas directly from the ref...
    const currClientWidth = curr.clientWidth;
    const computedSize = currClientWidth / state.worldState.nCols;
    return Math.max(MIN_CORNER_SIZE, Math.min(computedSize, MAX_CORNER_SIZE))
  }

  const computedSize = state.canvasState.width / state.worldState.nCols;
  return Math.max(MIN_CORNER_SIZE, Math.min(computedSize, MAX_CORNER_SIZE))
}

export function parseRowColString(rowColStr) {
  // make sure that any change here is also reflected in
  // makeRowColKey
  const parts = rowColStr.split(',')
  if (parts.length != 2) {
    console.error("invalid row col string: " + rowColStr)
  }
  const row = Number(parts[0].trim())
  const col = Number(parts[1].trim())
  return [row, col]
}

export function makeRowColKey(row, col) {
  // make sure that any change here is also reflected in
  // parseRowColString
  return `${row},${col}`
}

export function parseWallString(wallStr) {
  const parts = wallStr.split(',')
  if (parts.length != 3) {
    console.error("invalid wall string: " + wallStr)
  }
  const row = Number(parts[0].trim())
  const col = Number(parts[1].trim())
  const direction = parts[2]
  return [row, col, direction]
}

export function makeWallStr(row, col, direction) {
  return `${row},${col},${direction}`
}

export function isValidRowCol(state, row, col) {

  if (row < 0 || row >= state.worldState.nRows) {
    return false
  }
  if (col < 0 || col >= state.worldState.nCols) {
    return false
  }
  return true
}

export function isValidWall(state, row, col, direction) {

  if (direction == "East") {
    return isValidRowCol(state, row, col + 1)
  }
  if (direction == "North") {
    return isValidRowCol(state, row, col)
  }
  return false
}


export function getValidKarelIdx(n, rowCol) {
  if (rowCol < 0 || rowCol >= n) {
    return n - 1
  }
  return rowCol
}

export function isMoveValid(karelWorld, startR, startC, endR, endC) {
  if (endC < 0 || endC >= karelWorld.nCols) return false;
  if (endR < 0 || endR >= karelWorld.nRows) return false;

  var dRow = Math.abs(endR - startR);
  var dCol = Math.abs(endC - startC);

  // check for walls
  let isEast = startC + 1 === endC;
  let isWest = startC - 1 === endC;
  let isNorth = startR - 1 === endR;
  let isSouth = startR + 1 === endR;

  // walls are only north and east
  if (isEast && this.hasWall(startR, startC, "East")) return false;
  if (isWest && this.hasWall(endR, endC, "East")) return false;
  if (isNorth && this.hasWall(startR, startC, "North")) return false;
  if (isSouth && this.hasWall(endR, endC, "North")) return false;

  // can only move 1 manhattan distance
  if (dRow + dCol !== 1) return false;

  return true;
}

export function getValidCol(state, row) {

}

export function getWorldLeft() {
  return 0;
}

export function getWorldTop() {
  return 0;
}

export function getKarelImg(state, karelType) {
  return;
}

export const EXAMPLE_WORLD_STATE = {
  nRows: 3,
  nCols: 4,
  // all walls are "North" or "East"
  walls: {
    "0,1,East": true
  },
  beepers: {
    "1,1": 2
  },
  paint: {
    "1,0": "salmon"
  },
  karelRow: 0,
  karelCol: 0,
  karelDir: 'South'
}
