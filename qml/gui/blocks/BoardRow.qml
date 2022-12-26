import QtQuick 2.7
import "../../logic/game.js" as Game

Item {
    id: mainItem
    
    anchors.left: parent.left
   
    property double blockSize: Game.valuesObject.blockSize
    property int line: 0

    signal deleteAnimation

    property alias myRow: myRow
    property alias colorAnimation: colorAnimation

    y: line * blockSize

    onDeleteAnimation: {
        colorAnimation.running = true
    }

    Row {
        id: myRow

        spacing: 0
    }

    Rectangle {
        anchors.fill: myRow
        
        color: "#00000000"

        SequentialAnimation on color {
            id: colorAnimation;
            loops: 3
            running: false
            ColorAnimation { from: "#00000000"; to: "#d0f2f2f2"; duration: 100 }
            ColorAnimation { from: "#d0f2f2f2"; to: "#00000000"; duration: 100 }
            onRunningChanged: {
                if(!running) {
                    Game.dropAllAboveThisLineOne(line)
                    Game.removeOneFromWaitinglist();
                    mainItem.destroy();
                }
            }
        }
    }
}
