import { makeRowColKey, makeWallStr } from './karelutil.js';

export class Karel {

  constructor(setWorldState, startState) {
    this.currentState = {... startState}
    this.completeState()
  }
  getState() {
    return {...this.currentState}
  }


  // these are the apis that are called direction from python. woot!
  move() {
    let oldRow = this.currentState.karelRow
    let oldCol = this.currentState.karelCol
    let newRow = oldRow
    let newCol = oldCol
    switch (this.currentState.karelDir) {
      case "East":
        newCol++
        break;
      case "West":
        newCol--
        break;
      case "North":
        newRow--
        break;
      case "South":
        newRow++
        break;
    }
    const rowColStr = makeRowColKey(newRow, this.currentState.karelCol)
    var beeperMsg = ""
    if(this.currentState.beepers && rowColStr in this.currentState.beepers) {
      beeperMsg = this.currBeeperDescription(
        this.currentState.beepers[rowColStr]
      );
    }
    const blockedMsg = this.getBlockedMsg(newRow, newCol, this.currentState.karelDir);
    const descr =
      `Karel moved one step forward and is now at row ${newRow} and column ${newCol}, facing ${this.currentState.karelDir}. ` +
      beeperMsg +
      blockedMsg;

    if (this.isMoveValid(oldRow, oldCol, newRow, newCol)) {
      this.setKarelCoords(newRow, newCol)
      this.setActionHistory(descr)
      this.setKarelWorldState()
    }

  }

  turn_left() {
    const newD = this.getLeftDirection()
    const descr = `Karel turned left and is now facing ${newD}. ${this.getBlockedMsg(
      this.currentState.karelRow,
      this.currentState.karelCol,
      newD
    )}`
    this.currentState.karelDir = newD

    this.setActionHistory(descr)
    this.setKarelWorldState()
  }


  put_beeper() {
    if(!this.currentState.beepers) {
      this.currentState.beepers = {}
    }
    const beepers = this.currentState.beepers
    const rowColStr = makeRowColKey(this.currentState.karelRow, this.currentState.karelCol)
    const oldValue = (rowColStr in beepers) ? beepers[rowColStr] : 0
    beepers[rowColStr] = oldValue + 1

    this.setKarelWorldState()

    // push to descriptions
    const beeperMsg = this.currBeeperDescription(this.currentState.beepers[rowColStr], true);
    const descr = "Karel put a beeper. " + beeperMsg
    this.setActionHistory(descr)

  }

  paint_corner(color) {
    if(!this.currentState.paint) {
      this.currentState.paint = {}
    }

    // check if color is a valid string color

    const paint = this.currentState.paint
    const rowColStr = makeRowColKey(this.currentState.karelRow, this.currentState.karelCol)
    paint[rowColStr] = color
    this.setKarelWorldState()
  }

  pick_beeper() {
    const rowColStr = makeRowColKey(this.currentState.karelRow, this.currentState.karelCol)
    const oldValue = this.getNBeepers()
    if(oldValue == 0) {
      console.error("no beepers to pick up")
      return
    }
    this.currentState.beepers[rowColStr] = oldValue - 1
    this.setKarelWorldState()

    // push to descriptions
    const beeperMsg = this.currBeeperDescription(rowColStr, true);

    const descr = "Karel picked up a beeper. " + beeperMsg
    this.setActionHistory(descr)
  }



  front_is_clear() {
    let oldRow = this.currentState.karelRow;
    let oldCol = this.currentState.karelCol;
    var newRow = oldRow;
    var newCol = oldCol;
    switch (this.currentState.karelDir) {
      case "East":
        newCol++;
        break;
      case "West":
        newCol--;
        break;
      case "North":
        newRow--;
        break;
      case "South":
        newRow++;
        break;
      default:
        console.error("invalid this.dir: " + this.currentState.karelDir);
        break;
    }
    return this.isMoveValid(oldRow, oldCol, newRow, newCol);
  }

  beepers_present(){
    const n = this.getNBeepers()
    return n > 0
  }

  beepers_in_bag() {
    return true
  }

  random() {
    return true
  }

  left_is_clear() {
    // strategy here is to try and move karel to the left and then see if
    // is move valid says its ok!
    let oldRow = this.currentState.karelRow;
    let oldCol = this.currentState.karelCol;
    var newRow = oldRow;
    var newCol = oldCol;
    switch (this.currentState.karelDir) {
      case "East":
        newRow--;
        break;
      case "West":
        newRow++;
        break;
      case "North":
        newCol--;
        break;
      case "South":
        newCol++;
        break;
      default:
        console.error("invalid this.dir: " + this.currentState.karelDir);
        break;
    }
    return this.isMoveValid(oldRow, oldCol, newRow, newCol);
  }

  right_is_clear() {
    let oldRow = this.currentState.karelRow;
    let oldCol = this.currentState.karelCol;
    var newRow = oldRow;
    var newCol = oldCol;
    switch (this.currentState.karelDir) {
      case "East":
        newRow++;
        break;
      case "West":
        newRow--;
        break;
      case "North":
        newCol++;
        break;
      case "South":
        newCol--;
        break;
      default:
        console.error("invalid this.dir: " + this.currentState.karelDir);
        break;
    }
    return this.isMoveValid(oldRow, oldCol, newRow, newCol);
  }
  facing_north() {
    return this.currentState.karelDir === "North";
  }
  facing_south() {
    return this.currentState.karelDir === "South";
  }
  facing_east() {
    return this.currentState.karelDir === "East";
  }
  facing_west() {
    return this.currentState.karelDir === "West";
  }

  corner_color_is(color) {
    const paint = this.currentState.paint
    if(! paint) { return false;}
    const rowColStr = makeRowColKey(this.currentState.karelRow, this.currentState.karelCol)
    return paint[rowColStr] === color
  }

  // ------------- Helpers (for text descritpions) --------------
  hasEastWall(r, c) {
    return this.hasWall(r, c, "East");
  }

  hasWestWall(r, c) {
    return c === 0 || this.hasWall(r, c - 1, "East");
  }

  hasNorthWall(r, c) {
    return this.hasWall(r, c, "North");
  }

  hasSouthWall(r, c) {
    return r === this.currentState.nRows - 1 || this.hasWall(r + 1, c, "North");
  }

  hasWallInDir(r, c, dir) {
    switch (dir) {
      case "North":
        return this.hasNorthWall(r, c);
      case "East":
        return this.hasEastWall(r, c);
      case "South":
        return this.hasSouthWall(r, c);
      case "West":
        return this.hasWestWall(r, c);
      default:
        console.error(`Invalid front direction: ${dir}`);
    }
  }

  rotLeft(dir) {
    switch (dir) {
      case "North":
        return "West";
      case "East":
        return "North";
      case "South":
        return "East";
      case "West":
        return "South";
      default:
        console.error(`Invalid left direction: ${dir}`);
    }
  }

  rotRight(dir) {
    switch (dir) {
      case "North":
        return "East";
      case "East":
        return "South";
      case "South":
        return "West";
      case "West":
        return "North";
      default:
        console.error(`Invalid right direction: ${dir}`);
    }
  }
  getHumanRow = (row) => {
    return this.currentState.nRows - row;
  };

  getHumanCol = (col) => {
    return col + 1;
  };

  getKarelStateDescription(optionalDescr = null) {
    var descr = optionalDescr;
    if (!descr) {
      descr = this.currentState;
    }

    let state = `Karel is standing on row ${this.getHumanRow(
      descr.karelRow
    )} and column ${this.getHumanCol(descr.karelCol)}, facing ${descr.dir}.`;

    const numStones = descr.stones[descr.karelRow][descr.karelCol];
    if (numStones > 0) {
      state += ` There are ${numStones} beepers on this square.`;
    }

    const blocked = this.getBlockedMsg(
      descr.karelRow,
      descr.karelCol,
      descr.dir
    );

    state += " " + blocked;

    return state;
  }

  getBlockedMsg = (row, col, dir) => {
    const directions = [];

    if (this.hasWallInDir(row, col, dir)) {
      directions.push("front");
    }
    if (this.hasWallInDir(row, col, this.rotLeft(dir))) {
      directions.push("left");
    }
    if (this.hasWallInDir(row, col, this.rotRight(dir))) {
      directions.push("right");
    }

    if (directions.length === 1) {
      return ` Karel's ${directions[0]} is blocked. `;
    }
    if (directions.length === 2) {
      return ` Karel's ${directions[0]} and ${directions[1]} are blocked. `;
    }
    if (directions.length === 3) {
      return ` Karel's front, left and right are blocked. `;
    }
    return "";
  };

  currBeeperDescription(nBeepers, now = false) {
    const fmt = [
      nBeepers === 1 || nBeepers === true ? "is" : "are",
      nBeepers === 1 || nBeepers === true? `1` : nBeepers > 1 ? nBeepers : "no",
      nBeepers === 1 || nBeepers === true ? "beeper" : "beepers",
    ];
    const currMsg = now ? "now" : "";
    return `There ${fmt[0]} ${currMsg} ${fmt[1]} ${fmt[2]} here.`;
  }
  // ------------- Helpers -------------------

  getNBeepers() {
    if(!this.currentState.beepers){
      return 0
    }
    const beepers = this.currentState.beepers
    const rowColStr = makeRowColKey(this.currentState.karelRow, this.currentState.karelCol)
    return (rowColStr in beepers) ? beepers[rowColStr] : 0
  }

  isMoveValid(startR, startC, endR, endC) {
    if (endC < 0 || endC >= this.currentState.nCols) return false;
    if (endR < 0 || endR >= this.currentState.nRows) return false;

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

  hasWall(r,c,d){
    const walls = this.currentState.walls
    if(!walls) return false
    const wallStr = makeWallStr(r, c, d)
    return (wallStr in walls && walls[wallStr])
  }

  getLeftDirection() {
    switch (this.currentState.karelDir) {
      case "North":
        return "West"
      case "West":
        return "South"
      case "South":
        return "East"
      case "East":
        return "North"

    }
  }

  completeState() {
    if(!this.currentState.beepers) {
      this.currentState.beepers = {}
    }
    if(!this.currentState.paint) {
      this.currentState.paint = {}
    }
    if(!this.currentState.walls) {
      this.currentState.walls = {}
    }
  }


  resetKarel(startState=this.startState, setWorldState=this.setWorldState) {
    // check if startState is empty object
    if(!startState || Object.keys(startState).length === 0) {
      return;
    }
    this.startState = {...startState};
    this.currentState = {...startState};
    this.setWorldState = setWorldState;
    this.setKarelWorldState()
  }

  setKarelState(karelState) {
    this.currentState = {
      ...karelState
    };
    this.setKarelWorldState()
  }

  setWorldStateSetter(setWorldState) {
    this.setWorldState = setWorldState;
  }

  setKarelCoords(row, col)  {
    this.currentState.karelRow = row
    this.currentState.karelCol = col
  }

  setActionHistory(newAction){
    // Create action history if does not exist
    if (!this.currentState.actionHistory) {
      this.currentState.actionHistory = []
    }
    this.currentState.actionHistory.push(newAction)
  }

  setKarelWorldState() {
    self.karelInfo.active = true
    if(self.testState.isTesting) { return; }
    this.setWorldState(this.currentState)
  }

}
