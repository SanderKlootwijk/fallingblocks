.pragma library

// To share values with the whole program
var valuesObject;

var fx;
var settings;

function createQMLObject(component, caller, params) {
    if (valuesObject.debug)
        print("createQMLObject")
    var qmlObjComponent = null;
    if (component.createObject) {
        // qmlObj is a component and can create an object
        qmlObjComponent = component;
    } else if (typeof component === "string") {
        qmlObjComponent = Qt.createComponent(component);
    } else {

        if (valuesObject.debug)
            print("CreateQMLObject(): "+component+" is not a component or a link");
        return null;
    }

    var qmlObjObject;
    if (params !== undefined) {
        qmlObjObject = qmlObjComponent.createObject(caller, params);
    } else {
        qmlObjObject = qmlObjComponent.createObject(caller);
    }
    if (!qmlObjObject) {
        print("createQMLObject: Failed to create the qmlObj object.");
        return;
    } else if (qmlObjObject.hasOwnProperty("caller") && caller)
        qmlObjObject.caller = caller;

    return qmlObjObject;
}

// Stack functions to keep track of a queue of comming pieces
function Stack() {
    this.stack = new Array
    this.length = 0
    this.random = new SeedableRandom()
}

Stack.prototype.stackAdd = function (valueToAdd) {
    if (valuesObject.debug)
        print("Stack::stackAdd():"+valueToAdd)
    this.stack.push(valueToAdd)
}

Stack.prototype.stackAddInFront = function (valueToAdd) {
    if (valuesObject.debug)
        print("Stack::stackAddInFront()")
    this.stack.unshift(valueToAdd)
}

Stack.prototype.stackGet = function () {
    if (valuesObject.debug)
        print("Stack::stackGet()")
    var retrievedQueueValue = this.stack.shift()
    if (!(retrievedQueueValue === null || retrievedQueueValue === undefined)) {
        return retrievedQueueValue
    } else {
        print("Stack is empty.")
        return undefined
    }
}

Stack.prototype.emptyStack = function () {
    if (valuesObject.debug)
        print("Stack::emptyStack")
    for(var iii=0; iii<this.stack.length; iii++)
        delete this.stack[iii];
    this.stack.length = 0;
}

Stack.prototype.addNewRandom = function () {
    if (valuesObject.debug)
        print("stack::addNewRandom")
//    this.stackAdd(Math.floor(Math.random() * 7))
    this.stackAdd(this.random.nextInt(0,6))
}

Stack.prototype.removeCurrent = function () {
    if (valuesObject.debug)
        print("Stack::removeCurrent()")
    delete this.stack.shift()
    this.addNewRandom();
}

Stack.prototype.getCurrent = function () {
    if (valuesObject.debug)
        print("Stack::getCurrent()")
    return this.stack[0]
}

Stack.prototype.getItem = function (i) {
    if (valuesObject.debug)
        print("Stack::getItem()" + i)
    return this.stack[i];
}

Stack.prototype.getLength = function () {
    if (valuesObject.debug)
        print("Stack::getLength()")
    return this.stack.length
}

Stack.prototype.init = function (amount) {
    if (valuesObject.debug)
        print("Stack::init")
    if (this.stack.length>0)
        this.emptyStack()
    if (amount)
        this.length = amount
    this.random.seed(Date.now())
    for (var i = 0; i < this.length; i++) {
        this.addNewRandom()
    }
}

Stack.prototype.constructor = Stack

// compare the board array with an array of the 4 blocks in a piece.
// If one of them overlap or go out of bound, it's a collision.
Array.prototype.collision = function (array, columnOffset, rowOffset) {
    if (valuesObject.debug)
        print("Array.collision()")
    if (array === undefined)
        return false
    for(var iii=0; iii<4; iii++) {
        if (array[iii] === undefined)
            continue;
        var column = columnOffset + array[iii].column;
        var row = rowOffset + array[iii].row;
        if (row >= maxRow || column >= maxColumn || row < 0 || column < 0 ) {
            if (valuesObject.debug)
                print("Array.collision()::outOfBorder:"+column+","+row)
            return true
        } else
        if (this[index(column, row)]  !== undefined && this[index(column, row)]  !== null) {
            // Return true if both exist on the same spot

            if (valuesObject.debug)
                print("Array.collision()::collide:"+column+","+row)
            return true
        }
    }
    return false
}

// Returns an array with unique values and ordered ASSENDING.
Array.prototype.getUniqueSorted = function(){
    if (valuesObject.debug)
        print("Array.getUniqueSorted()")
    var u = {}, a = [];
    for(var i = 0, l = this.length; i < l; ++i){
        if (u.hasOwnProperty(this[i])) {
            continue;
        }
        if (this[i]>a[a.length-1])
            a.push(this[i]);
        else
            a.unshift(this[i]);
        u[this[i]] = 1;
    }
    return a;
}

// Some values
// # columns is 10
var maxColumn = 10
// # rows is 20
var maxRow = 20
var maxIndex = maxColumn * maxRow

// This holds all the non-moving blocks on the board
var board = new Array(maxIndex)
// The components are only once initiated
var blockComponent
var shapeComponent
var rowComponent

// The queue for the dropping pieces
var stackSize = 5
var blockStack = new Stack()

var storredAPiece = false

// Are we already adding a piece to the board?
var addingToBoard = false

// Howmany lines are buzy disapearing. We have to wait for them.
var waitingFor=0

//Index function used instead of a 2D array
function index(column, row) {
    if (valuesObject.debug) {
 //       print("Get index of column: "+column+" row: "+row)
    }
    return column + (row * maxColumn)
}

function init() {
    if (valuesObject.debug)
        print("init()")
    initBlocks()
    valuesObject.init()
    //fillWithSquares();
}

// Set up the block
function initCurrentBlock() {
    if (valuesObject.debug)
        print("initCurrentBlock()")
    valuesObject.currentPiece.shape = blockStack.getCurrent();
    valuesObject.currentPiece.reset()

    valuesObject.nextPiece.shape = blockStack.getItem(1);
    valuesObject.nextPiece.reset()

    // If there is no more room it's game over
    if (detectCollision()) {
        gameOver();
    }
}

// Initiate the Queue stack and load the current blocks
function initBlocks() {
    if (valuesObject.debug)
        print("initBlocks()")

    blockStack.init(stackSize)
}

function initBoard() {
    if (valuesObject.debug)
        print("initBlocks()")
    //Delete blocks from previous game
    for (var i = 0; i < maxIndex; i++) {
        if (board[i] != null) {
            board[i].destroy()
            board[i] = null;
        }
    }
}

function startGame() {
    init()

    //Populate stack
    valuesObject.started = true;
    checkLevel()
    initCurrentBlock()
}

// Start up a new gamme
function startNewGame() {
    print("Starting new game")
    removeStoredPiece()
    initBoard()
    startGame()
}

function removeStoredPiece() {
    valuesObject.storedPiece.shape = -1
}

// Testing function that loads the whole board with Squares. Not used.
function fillWithSquares() {
    if (valuesObject.debug)
        print("fillWithSquares()")
    for (var column = 0; column < maxColumn; column++) {
        for (var row = 0; row < maxRow; row++) {
            board[index(column, row)] = createBlock(column, row, 0)
        }
    }
}

// create a block dynamicly on the specific place, seen from the canvas(parent) and of a specific shape(color)
// This function returns the block object
function createBlock(column, row, shape, canvas) {
    if (valuesObject.debug)
        print("createBlock()::column:"+column+"/row:"+row+"/shape:"+shape+"/canvas:"+canvas)
    canvas = canvas !== undefined ? canvas : valuesObject.gameCanvas;
    if (!blockComponent)
        blockComponent = Qt.createComponent("../gui/blocks/Normal.qml")

    var dynamicObject;

    if (blockComponent.status == 1) {
        dynamicObject = createQMLObject(blockComponent, canvas, {
                                                       "shape": shape
                                                   })
        if (dynamicObject) {
            positionObject(dynamicObject,column,row)
            return dynamicObject
        }
    } else {
        print("error loading blockComponent")
        print(blockComponent.errorString())
        return undefined
    }
}

// Creates a block specificly used in the shape that is falling. We supply the array which holds it
// and also have to tell it where to put it in the array.
function createShapeBlock(array, column, row, shape, canvas, iii) {
    if (valuesObject.debug)
        print("createShapeBlock()::column:"+column+"/row:"+row+"/shape:"+shape+"/canvas:"+canvas+"/iii:"+iii)
    if (array[iii] === undefined) {
        if (valuesObject.debug)
            print("createShapeBlock()::block is undefined, making a new one")
        array[iii] = createBlock(column, row, shape, canvas)
    } else {
        positionObject(array[iii], column, row)
        array[iii].shape = shape;
    }
}

// Sets the position of the object relative to it's parent
function positionObject(object, column, row) {
    if (valuesObject.debug)
        print("positionObject()::object:"+object+"/column:"+column+"/row:"+row)
    if (!object) {
        if (false && valuesObject.debug)
            print("can't set block position")
        return false
    }
    object.column = column
    object.row = row
}

// Positions the falling piece when it first starts going down.
// The shapes have the same numbring than in the /blocks/Normal*.qml files
function positionShape(shapeObj) {
    if (valuesObject.debug)
        print("positionShape()::"+shapeObj)
    // the amount our 4*4 matrix has to move to be in the middle of the 10*20 matrix
    var middleColumn = (10-4)/2
    switch(shapeObj.shape)
    {
    case 0:
        positionObject(shapeObj,middleColumn,-1)
        break;
    case 1:
        positionObject(shapeObj,middleColumn,-1)
        break;
    case 2:
        positionObject(shapeObj,middleColumn,-1)
        break;
    case 3:
        positionObject(shapeObj,middleColumn,-1)
        break;
    case 4:
        positionObject(shapeObj,middleColumn,-1)
        break;
    case 5:
        positionObject(shapeObj,middleColumn,-1)
        break;
    case 6:
        positionObject(shapeObj,middleColumn,-1)
        break;
    }
}

// Build an array for a piece that drops, given the shape and the angle and shapeJSObj
// These are defined at the bottom of this file.
// Angles are in paces of 90° CW
function buildArrayFromJSObj(shapeJSObj, shape, angle, canvas, array) {
    if (valuesObject.debug)
        print("buildArrayFromJSObj()::angle:"+angle+"/shape:"+shape)
    var points
    switch(angle) {
    case 0:
        points = shapeJSObj.d0
        break;
    case 1:
        points = shapeJSObj.d1
        break;
    case 2:
        points = shapeJSObj.d2
        break;
    case 3:
        points = shapeJSObj.d3
        break;
    }
    createShapeBlock(array, points.p1.c, points.p1.r, shape, canvas, 0)
    createShapeBlock(array, points.p2.c, points.p2.r, shape, canvas, 1)
    createShapeBlock(array, points.p3.c, points.p3.r, shape, canvas, 2)
    createShapeBlock(array, points.p4.c, points.p4.r, shape, canvas, 3)
    return array;
}

// Build an array for a piece that drops, given the shape
// The shapes have the same numbring than in the /blocks/Normal*.qml files
function buildArray(shape, canvas, angle, array) {
    if (valuesObject.debug)
        print("buildArray()::angle:"+angle+"/shape:"+shape)
    angle = angle !== undefined ? angle : 0
    array = array !== undefined ? array : new Array
    switch(shape)
    {
    case -1:
        for(var iii=0;iii<4;iii++)
        {
            array[iii].shape = -1;
        }

    case 0:
        return buildArrayFromJSObj(iShape, shape, angle, canvas, array)
    case 1:
        return buildArrayFromJSObj(jShape, shape, angle, canvas, array)
    case 2:
        return buildArrayFromJSObj(lShape, shape, angle, canvas, array)
    case 3:
        return buildArrayFromJSObj(oShape, shape, angle, canvas, array)
    case 4:
        return buildArrayFromJSObj(sShape, shape, angle, canvas, array)
    case 5:
        return buildArrayFromJSObj(tShape, shape, angle, canvas, array)
    case 6:
        return buildArrayFromJSObj(zShape, shape, angle, canvas, array)
    }
}

// function that checks if there is collition with the Array prototype function from above
function detectCollision(columnOffset,rowOffset) {
    columnOffset = columnOffset !== undefined ? columnOffset : valuesObject.currentPiece.column
    rowOffset = rowOffset !== undefined ? rowOffset : valuesObject.currentPiece.row
    if (valuesObject.debug)
        print("detectCollision()::columnOffset:"+columnOffset+"/rowOffset:"+rowOffset)
    return board.collision(valuesObject.currentPiece.blockArray, columnOffset, rowOffset )
}

// Adds the current falling piece to the board and removes it from the stack.
// Next it checks for Lines and marks them for removal
function addCurrentToBoard() {
    if (valuesObject.debug)
        print("addCurrentToBoard()")
    addingToBoard = true;
    var array = valuesObject.currentPiece.blockArray;
    var rows = new Array
    //Drop existing blocks on the board
    for (var iii = 0; iii < 4; iii++) {
        if (array[iii] !== undefined) {
            var column = valuesObject.currentPiece.column + array[iii].column
            var row = valuesObject.currentPiece.row + array[iii].row
            board[index(column, row)] = createBlock(column,row,array[iii].shape,valuesObject.gameCanvas);

            rows.push(row)
        }
    }
    blockStack.removeCurrent();
    var lines = haveALineIn(rows.getUniqueSorted())
    storredAPiece = false;
    processLines(lines);
    initCurrentBlock();
    addingToBoard = false;
}

function processLines(lines) {
    var nLines = lines.length
    if (valuesObject.debug)
        print("lines: " + lines + " nLines: " + nLines)
    if (nLines > 0) {
        if (valuesObject.debug)
            print("Made " + nLines + " lines")
        for(var jjj=0; jjj < nLines; jjj++){
            removeLine(lines[jjj])
        }
        if (nLines==4) {
            if (settings.soundEffects==true) {
                fx.clear4.play()
            }
        }
        else {
            if (settings.soundEffects==true) {
                fx.clear1.play()
            }
        }

        earnedPoints(nLines);
    }
    else {
        resetCombo()
    }
}

// Marks a line for removal. It creates a row for an animation and binds the blocks that need to be removed to that.
// After the animation it destroys itself and calls dropAllAboveThisLineOne
function removeLine(line) {
    if (valuesObject.debug)
        print("RemoveLine()::line:" + line)
    valuesObject.waiting = true;

    if (!rowComponent)
        rowComponent = Qt.createComponent("../gui/blocks/BoardRow.qml")

    var rowObj;

    if (rowComponent.status == 1) {
        rowObj = createQMLObject(rowComponent, valuesObject.gameCanvas, {
                                                       "line": line
                                                   })
        if (!rowObj) {
            return false
        }

    } else {
        print("error loading row component")
        print(comp.errorString())
    }

    for(var column = 0; column < maxColumn; column++) {
        if (board[index(column,line)] !== null && board[index(column,line)] !== undefined) {
            board[index(column,line)].parent = rowObj.myRow
            positionObject(board[index(column,line)], board[index(column,line)].column, 0)
            board[index(column,line)]=null;
        }
    }
    rowObj.deleteAnimation();

    // Mark that we are waiting for another line to clear
    waitingFor++;
}

// one of our row remove animations has destroyed itself
function removeOneFromWaitinglist () {
    if (valuesObject.debug)
        print("removeOneFromWaitingList()")
    waitingFor--;
    if (waitingFor<=0) {
        valuesObject.waiting = false
    }
    valuesObject.lines++;
    checkLevel()
}

// Remove a line and drop all rows one down
function dropAllAboveThisLineOne(line) {
    if (valuesObject.debug)
        print("dropAllAboveThisLineOne():"+line)
    var column
    for(column = 0; column < maxColumn; column++) {
        if (board[index(column,line)] !== null && board[index(column,line)] !== undefined) {
            if (valuesObject.debug)
                print("dropAllAboveThisLineOne()::Destroy:"+column+","+line)
            board[index(column,line)].destroy()
            board[index(column,line)]=null;
        }
    }

    for(var row=line-1; row>=0; row--) {
        for(column = 0; column < maxColumn; column++) {
            if (board[index(column,row)] !== null && board[index(column,row)] !== undefined) {
                if (valuesObject.debug)
                    print("dropAllAboveThisLineOne()::move "+column+","+row+" down 1 row")
                board[index(column,row+1)] = board[index(column,row)];
                positionObject(board[index(column,row)], column, row+1)
                board[index(column,row)] = null;
            }
        }
    }
}

// Move the current piece x columns
function moveX(columns) {
    // if (settings.soundEffects==true) {
    //     fx.blip.play()
    // }
    if (valuesObject.debug)
        print("moveX()::columns:"+columns)
    if (columns>1)
        moveX(columns-1)

    if (detectCollision(valuesObject.currentPiece.column+columns, valuesObject.currentPiece.row))
        return false;
    else
        valuesObject.currentPiece.column += columns
    return true
}

function softDrop(rows) {
    if (valuesObject.debug)
        print("softDrop()::rows:"+rows)
    while(moveY(rows--)) {
        softDropScore();
    }
}

function hardDrop() {
    // if (settings.soundEffects==true) {
    //     fx.fastdrop.play()
    // }
    if (valuesObject.debug)
        print("hardDrop()")
    while(moveY(1)) {
        hardDropScore();
    }
    addCurrentToBoard();
}

// Move the current piece x rows
function moveY(rows) {
    if (rows<=0)
        return false
    if (valuesObject.debug)
        print("moveY()::rows:"+rows)
    if (detectCollision(valuesObject.currentPiece.column, valuesObject.currentPiece.row+rows))
        return false;
    else {
        valuesObject.currentPiece.row += rows
    }
    return true
}

function storeCurrent() {
    if (settings.soundEffects==true) {
       fx.laser.play()
    }
    if (valuesObject.debug)
        print("storeCurrent()::storredAPiece:"+storredAPiece)
    if (storredAPiece)
        return;
    var previousStoredShape = valuesObject.storedPiece.shape;
    valuesObject.storedPiece.shape = blockStack.stackGet();
    if (previousStoredShape !== -1) {
        blockStack.stackAddInFront(previousStoredShape);
    }
    else {
        blockStack.addNewRandom();
    }

    storredAPiece = true;

    initCurrentBlock()
}

function gameOver() {
    print("Game Over")
    if (settings.soundEffects==true) {
        fx.shutdown.play()
    }
    valuesObject.gameOver = true;
}

// Rotates the current block 90° CW
function rotateCW() {
    if (valuesObject.debug)
        print("Rotate CW")
    // if (settings.soundEffects==true) {
    //     fx.turn.play()
    // }
    var oldRotation = valuesObject.currentPiece.rotation
    if (valuesObject.currentPiece.rotation===3)
        valuesObject.currentPiece.rotation = 0
    else
        valuesObject.currentPiece.rotation++
    if (valuesObject.currentPiece.sideKickTop && !detectCollision(valuesObject.currentPiece.column,valuesObject.currentPiece.row-1)) {
        valuesObject.currentPiece.row--;
        valuesObject.currentPiece.sideKickTop = false;
        return;
    }
    if (valuesObject.currentPiece.sideKickLeft && !detectCollision(valuesObject.currentPiece.column-1,valuesObject.currentPiece.row)) {
        valuesObject.currentPiece.column--;
        valuesObject.currentPiece.sideKickLeft = false;
        return;
    }
    if (valuesObject.currentPiece.sideKickRight && !detectCollision(valuesObject.currentPiece.column+1,valuesObject.currentPiece.row)) {
        valuesObject.currentPiece.column++;
        valuesObject.currentPiece.sideKickRight = false;
        return;
    }
    if (detectCollision()) {
        // Checking for possible SideKicks
        if (!valuesObject.currentPiece.sideKickTop && valuesObject.currentPiece.row<1 && !detectCollision(valuesObject.currentPiece.column,valuesObject.currentPiece.row+1)) {
            if (valuesObject.debug)
                print("Top Side Kick")
            valuesObject.currentPiece.sideKickTop = true
            valuesObject.currentPiece.row++
            return;
        }
        if (!valuesObject.currentPiece.sideKickLeft && !detectCollision(valuesObject.currentPiece.column+1,valuesObject.currentPiece.row)) {
            if (valuesObject.debug)
                print("Left Side Kick")
            valuesObject.currentPiece.sideKickLeft = true
            valuesObject.currentPiece.column++
            return;
        }
        if (!valuesObject.currentPiece.sideKickRight && !detectCollision(valuesObject.currentPiece.column-1,valuesObject.currentPiece.row)) {
            if (valuesObject.debug)
                print("Right Side Kick")
            valuesObject.currentPiece.sideKickRight = true
            valuesObject.currentPiece.column--
            return;
        }
        // No SideKick possible
        if (valuesObject.debug)
            print("Rotation is stoped")
        valuesObject.currentPiece.rotation = oldRotation;
    }
}

// Do we have a line in one of the rows supplied? Saves time not looking though the all
// It returns the found ones. Best to supply an unique ordered list
function haveALineIn(rows) {
    if (valuesObject.debug)
        print("haveALineIn()::rows:"+rows)
    var lines = new Array;
    while(true) {
        var row = rows.shift()
        if (row === undefined)
            break;

        if (valuesObject.debug)
            print("try: " + row)
        var haveALine = true;
        for(var column = 0; column < maxColumn; column++) {
            if (board[index(column, row)] === undefined || board[index(column, row)] === null) {
                haveALine = false;
                break;
            }
        }
        if (haveALine)
            lines.push(row);
    }
    return lines;
}

// Score data and variables
var baseScore = {
    l1: 100,
    l2: 300,
    l3: 500,
    l4: 800
}

function checkLevel() {
    if (valuesObject.debug)
        print("checkLevel()::startingLevel:"+valuesObject.startingLevel)
    if (valuesObject.level<valuesObject.startingLevel) {
        valuesObject.level = valuesObject.startingLevel;
        setDeltaTime();
    }
    if (valuesObject.lines >= (10*(valuesObject.level-valuesObject.startingLevel+1) + 5*Math.pow(valuesObject.level-valuesObject.startingLevel,2))) {
        valuesObject.level++
        if (settings.soundEffects==true) {
            fx.powerup.play()
        }
        setDeltaTime();
    }
    if (valuesObject.debug)
        print("checkLevel()::level:"+valuesObject.level)
}

// Set time it takes to lower the piece
function setDeltaTime() {
    if (valuesObject.debug)
        print("setDeltaTime()")
    valuesObject.deltaTime = 1000 - valuesObject.level*100 + Math.pow(valuesObject.level,2)*2.3;
    if (valuesObject.debug)
        print("setDeltaTime():valuesObject.deltaTime")
}

function addToScore(amount) {
    if (valuesObject.debug)
        print("addToScore():"+amount)
    valuesObject.score += amount;
    if (valuesObject.debug)
        print("addToScore()::Total"+valuesObject.score)
}

function addToCombo(amount) {
    if (valuesObject.debug)
        print("addToCombo():"+amount)
    valuesObject.comboScore += amount;
    if (valuesObject.debug)
        print("addToCombo()::Total"+valuesObject.comboScore)
}

function addComboToScore() {
    if (valuesObject.debug)
        print("addComboToScore()")
    valuesObject.score += valuesObject.comboScore*3/4;
    if (valuesObject.debug)
        print("addComboToScore()::Total"+valuesObject.score)
}

function resetCombo() {
    if (valuesObject.debug)
        print("resetCombo()")
    valuesObject.comboScore = 0;
}

function earnedPoints(lines) {
    if (valuesObject.debug)
        print("earnPoints()::lines:"+lines)
    var amount
    switch(lines) {
    case 1:
        amount = baseScore.l1*(valuesObject.level+1);
        break;
    case 2:
        amount = baseScore.l2*(valuesObject.level+1);
        break;
    case 3:
        amount = baseScore.l3*(valuesObject.level+1);
        break;
    case 4:
        amount = baseScore.l4*(valuesObject.level+1);
        break;
    }
    addToScore(amount);
    addComboToScore();
    addToCombo(amount);
}

function softDropScore() {
    if (valuesObject.debug)
        print("softDropScore()")
    addToScore(1)
}

function hardDropScore() {
    if (valuesObject.debug)
        print("hardDropScore()")
    addToScore(2)
}

/* Here are the definitions of all the shapes
 * d0-d3 stnads for the degree of turning CW in steps of 90°
 * p1-p4 are the blocks, relative to a 4*4 matrix with c the colomn and r the row in standard Qt convention.
 */


// TODO: Clean up the rotations
var iShape = {
    d0: {
        p1: {
            c: 0,
            r: 1
        },
        p2: {
            c: 1,
            r: 1
        },
        p3: {
            c: 2,
            r: 1
        },
        p4: {
            c: 3,
            r: 1
        }
    },
    d1: {
        p1: {
            c: 2,
            r: 0
        },
        p2: {
            c: 2,
            r: 1
        },
        p3: {
            c: 2,
            r: 2
        },
        p4: {
            c: 2,
            r: 3
        }
    },
    d2: {
        p1: {
            c: 0,
            r: 2
        },
        p2: {
            c: 1,
            r: 2
        },
        p3: {
            c: 2,
            r: 2
        },
        p4: {
            c: 3,
            r: 2
        }
    },
    d3: {
        p1: {
            c: 1,
            r: 0
        },
        p2: {
            c: 1,
            r: 1
        },
        p3: {
            c: 1,
            r: 2
        },
        p4: {
            c: 1,
            r: 3
        }
    }
}

var jShape = {
    d0: {
        p1: {
            c: 0,
            r: 1
        },
        p2: {
            c: 1,
            r: 1
        },
        p3: {
            c: 2,
            r: 1
        },
        p4: {
            c: 2,
            r: 2
        }
    },
    d1: {
        p1: {
            c: 1,
            r: 3
        },
        p2: {
            c: 2,
            r: 3
        },
        p3: {
            c: 2,
            r: 2
        },
        p4: {
            c: 2,
            r: 1
        }
    },
    d2: {
        p1: {
            c: 1,
            r: 1
        },
        p2: {
            c: 1,
            r: 2
        },
        p3: {
            c: 2,
            r: 2
        },
        p4: {
            c: 3,
            r: 2
        }
    },
    d3: {
        p1: {
            c: 2,
            r: 1
        },
        p2: {
            c: 1,
            r: 1
        },
        p3: {
            c: 1,
            r: 2
        },
        p4: {
            c: 1,
            r: 3
        }
    }
}

var lShape = {
    d0: {
        p1: {
            c: 0,
            r: 2
        },
        p2: {
            c: 0,
            r: 1
        },
        p3: {
            c: 1,
            r: 1
        },
        p4: {
            c: 2,
            r: 1
        }
    },
    d1: {
        p1: {
            c: 1,
            r: 0
        },
        p2: {
            c: 2,
            r: 0
        },
        p3: {
            c: 2,
            r: 1
        },
        p4: {
            c: 2,
            r: 2
        }
    },
    d2: {
        p1: {
            c: 3,
            r: 1
        },
        p2: {
            c: 3,
            r: 2
        },
        p3: {
            c: 2,
            r: 2
        },
        p4: {
            c: 1,
            r: 2
        }
    },
    d3: {
        p1: {
            c: 1,
            r: 1
        },
        p2: {
            c: 1,
            r: 2
        },
        p3: {
            c: 1,
            r: 3
        },
        p4: {
            c: 2,
            r: 3
        }
    }
}

var oShape = {
    d0: {
        p1: {
            c: 1,
            r: 1
        },
        p2: {
            c: 1,
            r: 2
        },
        p3: {
            c: 2,
            r: 1
        },
        p4: {
            c: 2,
            r: 2
        }
    },
    d1: {
        p1: {
            c: 1,
            r: 1
        },
        p2: {
            c: 1,
            r: 2
        },
        p3: {
            c: 2,
            r: 1
        },
        p4: {
            c: 2,
            r: 2
        }
    },
    d2: {
        p1: {
            c: 1,
            r: 1
        },
        p2: {
            c: 1,
            r: 2
        },
        p3: {
            c: 2,
            r: 1
        },
        p4: {
            c: 2,
            r: 2
        }
    },
    d3: {
        p1: {
            c: 1,
            r: 1
        },
        p2: {
            c: 1,
            r: 2
        },
        p3: {
            c: 2,
            r: 1
        },
        p4: {
            c: 2,
            r: 2
        }
    }
}

var sShape = {
    d0: {
        p1: {
            c: 0,
            r: 2
        },
        p2: {
            c: 1,
            r: 2
        },
        p3: {
            c: 1,
            r: 1
        },
        p4: {
            c: 2,
            r: 1
        }
    },
    d1: {
        p1: {
            c: 1,
            r: 1
        },
        p2: {
            c: 1,
            r: 2
        },
        p3: {
            c: 2,
            r: 2
        },
        p4: {
            c: 2,
            r: 3
        }
    },
    d2: {
        p1: {
            c: 0,
            r: 2
        },
        p2: {
            c: 1,
            r: 2
        },
        p3: {
            c: 1,
            r: 1
        },
        p4: {
            c: 2,
            r: 1
        }
    },
    d3: {
        p1: {
            c: 1,
            r: 1
        },
        p2: {
            c: 1,
            r: 2
        },
        p3: {
            c: 2,
            r: 2
        },
        p4: {
            c: 2,
            r: 3
        }
    }
}

var tShape = {
    d0: {
        p1: {
            c: 0,
            r: 1
        },
        p2: {
            c: 1,
            r: 1
        },
        p3: {
            c: 2,
            r: 1
        },
        p4: {
            c: 1,
            r: 2
        }
    },
    d1: {
        p1: {
            c: 1,
            r: 0
        },
        p2: {
            c: 1,
            r: 1
        },
        p3: {
            c: 1,
            r: 2
        },
        p4: {
            c: 0,
            r: 1
        }
    },
    d2: {
        p1: {
            c: 0,
            r: 1
        },
        p2: {
            c: 1,
            r: 1
        },
        p3: {
            c: 2,
            r: 1
        },
        p4: {
            c: 1,
            r: 0
        }
    },
    d3: {
        p1: {
            c: 1,
            r: 0
        },
        p2: {
            c: 1,
            r: 1
        },
        p3: {
            c: 1,
            r: 2
        },
        p4: {
            c: 2,
            r: 1
        }
    }
}

var zShape = {
    d0: {
        p1: {
            c: 0,
            r: 1
        },
        p2: {
            c: 1,
            r: 1
        },
        p3: {
            c: 1,
            r: 2
        },
        p4: {
            c: 2,
            r: 2
        }
    },
    d1: {
        p1: {
            c: 1,
            r: 2
        },
        p2: {
            c: 1,
            r: 1
        },
        p3: {
            c: 2,
            r: 1
        },
        p4: {
            c: 2,
            r: 0
        }
    },
    d2: {
        p1: {
            c: 0,
            r: 1
        },
        p2: {
            c: 1,
            r: 1
        },
        p3: {
            c: 1,
            r: 2
        },
        p4: {
            c: 2,
            r: 2
        }
    },
    d3: {
        p1: {
            c: 1,
            r: 2
        },
        p2: {
            c: 1,
            r: 1
        },
        p3: {
            c: 2,
            r: 1
        },
        p4: {
            c: 2,
            r: 0
        }
    }
}

/**
        @class A fast, deterministic, seedable random number generator.
        @description Unlike the native random number generator built into most browsers, this one is deterministic, and so it will produce the same sequence of outputs each time it is given the same seed. It is based on George Marsaglia's MWC algorithm from the v8 Javascript engine.
*/

function SeedableRandom() {
        /**
                Get the next random number between 0 and 1 in the current sequence.
        */
        this.next = function next() {
                // Random number generator using George Marsaglia's MWC algorithm.
                // Got this from the v8 js engine

                // don't let them get stuck
                if (this.x == 0) this.x == -1;
                if (this.y == 0) this.y == -1;

                // Mix the bits.
                this.x = this.nextX();
                this.y = this.nextY();
                return ((this.x << 16) + (this.y & 0xFFFF)) / 0xFFFFFFFF + 0.5;
        }

        this.nextX = function() {
                return 36969 * (this.x & 0xFFFF) + (this.x >> 16);
        }

        this.nextY = function() {
                return 18273 * (this.y & 0xFFFF) + (this.y >> 16);
        }

        /**
                Get the next random integer in the current sequence.
                @param a The lower bound of integers (inclusive).
                @param gs The upper bound of integers (exclusive).
        */
        this.nextInt = function nextInt(a, b) {
                if (!b) {
                        a = 0;
                        b = 0xFFFFFFFF;
                }
                // fetch an integer between a and b inclusive
                return Math.floor(this.next() * (b - a)) + a;
        }

        /**
                Seed the random number generator. The same seed will always yield the same sequence. Seed with the current time if you want it to vary each time.
                @param x The seed.
        */
        this.seed = function(x) {
                this.x = x * 3253;
                this.y = this.nextX();
        }

        /**
                Seed the random number generator with a two dimensional seed.
                @param x First seed.
                @param y Second seed.
        */
        this.seed2d = function seed(x, y) {
                this.x = x * 2549 + y * 3571;
                this.y = y * 2549 + x * 3571;
        }

        /**
                Seed the random number generator with a three dimensional seed.
                @param x First seed.
                @param y Second seed.
                @param z Third seed.
        */
        this.seed3d = function seed(x, y, z) {
                this.x = x * 2549 + y * 3571 + z * 3253;
                this.y = x * 3253 + y * 2549 + z * 3571;
        }
}
