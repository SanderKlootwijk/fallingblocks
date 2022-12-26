// Some values
// # columns is 10
var maxColumn = 10
// # rows is 20
var maxRow = 20
var blockInfoColmun = 4

var maxIndex = maxColumn * maxRow

var down = new Array

var border = units.gu(0.5)
var spacing = units.gu(1)

function calcBlockSize() {
    gamePage.blockSize = Math.min(
                (gameRow.width - spacing * 6
                 - border * 4) / (maxColumn + blockInfoColmun),
                (gameRow.height - spacing * 2 - border * 2) / maxRow)
    if (values.debug)
        print(blockSize)
}

function keyPressed(key) {
    if (values.debug)
        print("gamePageHelper::keyPressed"+key)
    if (!isKnownKey(key))
        return false
    if (down.indexOf(key) == -1) {
        down.push(key)
        if (!keyTimer.running)
            keyTimer.start()
    }
    return true
}

function keyReleased(key) {
    if (values.debug)
        print("gamePageHelper::keyReleased"+key)
    if (!isKnownKey(key))
        return false
    var index = down.indexOf(key)
    if (index != -1) {
        down.splice(index, 1)
    }
    if (down.length==0)
        keyTimer.stop()
    return true
}

function handelKey(key) {
    if (values.debug)
        print("gamePageHelper::handelKey"+key)
    if (key == Qt.Key_Right) {
        Game.moveX(1)
    } else if (key == Qt.Key_Left) {
        Game.moveX(-1)
    } else if (key == Qt.Key_Down) {
        Game.moveY(1)
    } else if (key == Qt.Key_Up) {
        Game.rotateCW()
    } else if (key == Qt.Key_Space) {
        Game.hardDrop()
    } else if (key == Qt.Key_F || key == Qt.Key_Shift) {
        Game.storeCurrent()
    }
}

function isKnownKey(key) {
    if (key == Qt.Key_Right) {
        return true;
    } else if (key == Qt.Key_Left) {
        return true;
    } else if (key == Qt.Key_Down) {
        return true;
    } else if (key == Qt.Key_Up) {
        return true;
    } else if (key == Qt.Key_Space) {
        return true;
    } else if (key == Qt.Key_F) {
        return true;
    } else if (key == Qt.Key_Shift) {
        return true;
    }
    return false;
}

function keyRepeat() {
    if (values.debug)
        print("gamePageHelper::keyRepeat"+down)
    for(var iii=0;iii<down.length;iii++) {
        handelKey(down[iii])
    }
}

function stopRunning() {
    if (values.debug)
        print("gamePageHelper::stopRunning")
    down = new Array
    keyTimer.stop()
}
