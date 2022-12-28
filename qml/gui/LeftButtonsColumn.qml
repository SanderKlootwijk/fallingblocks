import QtQuick 2.7
import Lomiri.Components 1.3
import "../logic/game.js" as Game
import "gamePageHelper.js" as Helper

Item {
    signal init
    
    height: column.height + column.y

    Column {
        id: column

        anchors {
            top: parent.top
            left: parent.left
            right: parent.right
        }

        spacing: Helper.spacing

        Item {
            height: 0.01
            width: 0.01
        }

        Button {
            id: startButton
            
            width: values.blockSize * 4 + Helper.spacing
            
            anchors.horizontalCenter: parent.horizontalCenter
            
            text: i18n.tr("Start")
            color: values.started ? theme.palette.normal.negative : theme.palette.normal.positive
            enabled: values.startButtonEnabled

            onClicked: {
                if (values.started) {
                    Game.gameOver()
                }
                else {
                    Game.startNewGame()
                }
            }
            
            Binding {
                target: startButton
                property: "text"
                value: values.started ? i18n.tr("Stop") : i18n.tr("Start")
            }
        }

        Button {
            id: pauseButton
            
            width: values.blockSize * 4 + Helper.spacing

            anchors.horizontalCenter: parent.horizontalCenter
            
            text: i18n.tr("Pause")
            color: theme.palette.normal.base
            enabled: values.started
            
            onClicked: {
                values.paused = !values.paused
            }

            Binding {
                target: pauseButton
                property: "text"
                value: values.paused ? i18n.tr("Resume") : i18n.tr("Pause")
            }
        }

        Item {
            height: 0.01
            width: 0.01
        }
    }
}
