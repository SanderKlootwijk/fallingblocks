import QtQuick 2.7
import Lomiri.Components 1.3
import "../logic/game.js" as Game
import "gamePageHelper.js" as Helper

Item {
    id: topItem
    
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

        Label {
            id: highScoreLabel

            anchors.horizontalCenter: parent.horizontalCenter

            text: i18n.tr("Highscore:")
        }

        LomiriShape {
            id: highScoreBlockBG

            width: values.blockSize * 4 + Helper.border * 2
            height: width / 2

            anchors.horizontalCenter: parent.horizontalCenter
            
            color: theme.palette.normal.base

            LomiriShape {
                id: highScoreBlock
                
                width: values.blockSize * 4
                height: width / 2 - units.gu(0.5)
                
                anchors.centerIn: parent
                
                color: theme.palette.normal.overlay

                Label {
                    anchors.centerIn: parent

                    text: settings.highscore
                }
            }
        }

        Label {
            id: nextLabel
            
            anchors.horizontalCenter: parent.horizontalCenter
            
            text: i18n.tr("Next block:")
        }

        LomiriShape {
            id: nextBlockBG
            
            height: values.blockSize * 4 + Helper.border * 2
            width: values.blockSize * 4 + Helper.border * 2
            
            anchors.horizontalCenter: parent.horizontalCenter
            
            color: theme.palette.normal.base

            LomiriShape {
                id: nextBlock
                
                width: values.blockSize * 4
                height: values.blockSize * 4
                
                anchors.centerIn: parent
                
                color: theme.palette.normal.overlay

                GridOverlay {
                    anchors.centerIn: parent
                    
                    rows: 4
                    columns: 4
                    model: rows*columns
                    imgWidth: values.blockSize
                    imgheight: values.blockSize
                }

                PauseOverlay {
                    anchors.fill: parent
                    
                    visible: values.paused
                }
            }
        }

        Label {
            id: storeLabel
            
            anchors.horizontalCenter: parent.horizontalCenter
            
            text: i18n.tr("Stored:")
        }

        LomiriShape {
            id: storedBlockBG
            
            height: values.blockSize * 4 + Helper.border * 2
            width: values.blockSize * 4 + Helper.border * 2
            
            anchors.horizontalCenter: parent.horizontalCenter
            
            color: theme.palette.normal.base

            LomiriShape {
                id: storedBlock
                
                width: values.blockSize * 4
                height: values.blockSize * 4
                
                anchors.centerIn: parent
                
                color: theme.palette.normal.overlay

                MouseArea {
                    enabled: running
                    
                    anchors.fill: parent
                    
                    onClicked: {
                        Game.storeCurrent()
                    }
                }

                GridOverlay {
                    anchors.centerIn: parent
                    
                    rows: 4
                    columns: 4
                    model: rows*columns
                    imgWidth: values.blockSize
                    imgheight: values.blockSize
                }

                PauseOverlay {
                    anchors.fill: parent
                    
                    visible: values.paused
                }
            }
        }

        Item {
            height: 0.01
            width: 0.01
        }
    }

    onInit: {
        var qmlObjComponent = Qt.createComponent("blocks/Shape.qml");
        Game.valuesObject.nextPiece = qmlObjComponent.createObject(nextBlock, {
                                                                       isNext: true
                                                                   })
        Game.valuesObject.storedPiece = qmlObjComponent.createObject(
                    storedBlock, {
                        isStored: true
                    })
        Game.valuesObject.currentPiece = qmlObjComponent.createObject(
                    gameCanvasPlain, {
                        isCurrent: true
                    })
    }
}
