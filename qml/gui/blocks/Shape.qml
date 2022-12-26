import QtQuick 2.7
import "../../logic/game.js" as Game

Item {
    id: shapeObj

    property int shape: -1
    property double blockSize: Game.valuesObject.blockSize
    property var blockArray
    property bool sideKickTop: false
    property bool sideKickLeft: false
    property bool sideKickRight: false
    property bool isCurrent: false
    property bool isNext: false
    property bool isStored: false
    property int column: 0
    property int row: 0
    property int rotation: 0;
    property int deltaTime: 1000;

    signal init

    x: column * blockSize
    y: row * blockSize

    visible: false

    onIsCurrentChanged: {
        if (values.debug)
            print("Shape::onIsCurrentChanged():" + isCurrent)
        if (isCurrent) {
            isStored = false
            isNext = false
        }
    }
    onIsNextChanged: {
        if (values.debug)
            print("Shape::onIsNextChanged():" + isNext)
        if (isNext) {
            isCurrent = false
            isStored = false
        }
    }
    onIsStoredChanged: {
        if (values.debug)
            print("Shape::onIsStoredChanged():" + isStored)
        if (isStored) {
            isNext = false
            isCurrent = false
            reset()
        }
    }

    onShapeChanged: {
        if (values.debug)
            print("Shape::onShapeChanged:" + shape)
        rebuildBlockArray()
    }

    onRotationChanged: {
        if (values.debug)
            print("Shape::onRotationChanged:" + rotation)
        rebuildBlockArray()
    }

    states: [
        State {
            name: "nextBox"
            when: isNext
            StateChangeScript {
                script: {
                    if (values.debug)
                        print("Shape::StateChangeNextBox")
                    visible = true
                    goingDownTimer.stop()
                }
            }
        },
        State {
            name: "storred"
            when: isStored
            StateChangeScript {
                script: {
                    if (values.debug)
                        print("Shape::StateChangeStoredBox")
                    visible = true
                    goingDownTimer.stop()
                }
            }
        },
        State {
            name: "falling"
            when: isCurrent
            StateChangeScript {
                script: {
                    z = 80
                    if (values.debug)
                        print("Shape::StateChangeFalling")
                    visible = true
                    if (Game.valuesObject.running)
                        goingDownTimer.restart();
                }
            }
        },
        State {
            name: "nothing"
            when: !isCurrent && !isNext && !isStored
            StateChangeScript {
                script: {
                    if (values.debug)
                        print("Shape::StateChangeNothing")
                    visible = false
                    goingDownTimer.stop()
                }
            }
        }
    ]

    Timer {
        id: gameOverAnimation
        running: Game.valuesObject.gameOver && shapeObj.state == "falling"
        repeat: true
        interval: 600
        onTriggered: {
            visible = !visible
        }
        onRunningChanged: {
            if (!running)
                visible=true
        }
    }

    Timer {
        id: goingDownTimer
        interval: Game.valuesObject.deltaTime
        running: false
        repeat: true
        onTriggered: {
            if (!Game.addingToBoard && Game.detectCollision(column,row+1)) {
                print("Shape::Colition")
                Game.addCurrentToBoard();
            } else {
                row++
            }
        }
    }

    function reset() {
        if (Game.valuesObject.running && state == "falling")
            goingDownTimer.restart()
        rotation = 0
        sideKickTop = false
        sideKickLeft = false
        sideKickRight = false
        if (state == "falling")
            Game.positionShape(shapeObj)
    }

    function rebuildBlockArray() {
        if (values.debug)
            print("Shape::rebuildBlockArray():" + blockArray)
        if (blockArray==undefined)
            blockArray = new Array
        Game.buildArray(shape, shapeObj, rotation, blockArray);
    }

    function onRunningChanged(running) {
        if (values.debug)
            print("Shape::onRunningChanged():" + running)
        if (running && state == "falling")
            goingDownTimer.restart()
        if (!running)
            goingDownTimer.stop()
    }

    Component.onCompleted: {
        Game.valuesObject.run.connect(onRunningChanged)
    }
}
