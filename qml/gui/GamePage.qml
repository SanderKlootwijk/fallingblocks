import QtQuick 2.7
import Lomiri.Components 1.3
import Lomiri.Components.Popups 1.3
import "blocks"
import "../logic/game.js" as Game
import "gamePageHelper.js" as Helper

Page {
    id: gamePage

    property real blockSize: units.gu(3)
    property bool running

    signal sizeChanged
    signal init

    onWidthChanged: sizeChanged()
    onHeightChanged: sizeChanged()

    onSizeChanged: {
        if (values.debug)
            print("GamePage::sizeChanged")
        if (Game.valuesObject && Game.valuesObject.initiated)
            Helper.calcBlockSize()
    }

    header: PageHeader {
        id: gamePageHeader
        
        title: "Falling Blocks"

        trailingActionBar {
            numberOfSlots: 1

            actions: [
                Action {
                    iconName: "settings"
                    text: i18n.tr("Settings")
                    onTriggered: {
                        pageStack.push(settingsPage)
                    }
                },
                Action {
                    iconName: "info"
                    text: i18n.tr("About")
                    onTriggered: {
                        pageStack.push(aboutPage)
                    }
                }
            ]
        }
    }

    Item {
        id: gameRow
        
        anchors {
            top: gamePageHeader.bottom
            topMargin: units.gu(1)
            right: parent.right
            left: parent.left
            bottom: scoreBlock.top
        }

        LeftBlocksColumn {
            id: blockInfo
            
            width: blockSize * Helper.blockInfoColmun + 2 * Helper.spacing + 2 * Helper.border
            
            anchors {
                top: parent.top
                left: parent.left
                margins: Helper.spacing
            }
        }

        LeftButtonsColumn {
            id: buttonColumn
           
            width: blockInfo.width

            anchors {
                top: blockInfo.bottom
                left: parent.left
                margins: Helper.spacing
            }
        }

        Item {
            id: gameContainer

            anchors {
                right: parent.right
                top: parent.top
                bottom: parent.bottom
                left: blockInfo.right
                margins: Helper.spacing
            }

            Item {
                id: gameCanvas
                    
                width: blockSize*Helper.maxColumn+Helper.border*2
                height: blockSize*Helper.maxRow+Helper.border*2

                anchors {
                    horizontalCenter: parent.horizontalCenter
                    top: parent.top
                }

                LomiriShape {
                    id: gameCanvasBorder
                    
                    anchors {
                        fill: gameCanvasPlain
                        margins: -Helper.border
                    }

                    color: theme.palette.normal.base
                }

                LomiriShape {
                    id: gameCanvasPlain

                    width: blockSize*Helper.maxColumn
                    height: blockSize*Helper.maxRow
                    
                    anchors.centerIn: parent

                    color: theme.palette.normal.overlay

                    PauseOverlay {
                        id: overlay
                        
                        anchors.fill: parent

                        visible: values.paused
                    }

                    MouseObj {
                        id: currentPieceMouse
                        
                        enabled: gamePage.running
                    }

                    GridOverlay {
                        anchors.fill: parent

                        rows: Helper.maxRow
                        columns: Helper.maxColumn

                        model: rows*columns

                        imgWidth: blockSize
                        imgheight: blockSize
                    }

                    Keys.enabled: running

                    Keys.onReleased: {
                        if (values.debug)
                            print("GamePage::Keys.onReleased:"+event.key)
                        if (Helper.keyReleased(event.key))
                            event.accepted = true
                    }

                    Keys.onPressed: {
                        if (Game.debug)
                            print("GamePage::Keys.onPressed:"+event.key)
                        if (Helper.keyPressed(event.key))
                            event.accepted = true
                    }

                    Timer {
                        id: keyTimer
                        
                        interval: 150
                        repeat: true
                        triggeredOnStart: true
                        onTriggered: {
                            Helper.keyRepeat()
                        }
                    }
                }
            }
        }
    }

    ScoreBlock {
        id: scoreBlock

        height: units.gu(2)

        anchors {
            bottom: parent.bottom
            bottomMargin: units.gu(2)
            left: parent.left
            leftMargin: units.gu(2)
        }
    }

    states: [
        State {
            name: "GameOver"
            when: values.gameOver
            StateChangeScript {
                script: {
                    if (values.gameOver) {
                        delay.start()
                    }
                }
            }
        }
    ]

    Timer {
        id: delay
        
        interval: 2000
        onTriggered: {
            if (values.gameOver)
                PopupUtils.open(Qt.resolvedUrl("GameOverDialog.qml"))
        }
    }

    onRunningChanged: {
        if (!running) {
            Helper.stopRunning()
        }
    }

    onInit: {
        if (values.debug)
            print("GamePage::onInit")
        Helper.calcBlockSize()
        Game.valuesObject.gameCanvas = gameCanvasPlain;
        blockInfo.init()
        gamePage.running = Qt.binding(function() {return Game.valuesObject.running})
        Game.valuesObject.blockSize = Qt.binding(function () {return gamePage.blockSize})
    }
}
