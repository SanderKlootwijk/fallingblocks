import QtQuick 2.7
import Lomiri.Components 1.3

Row {
    id: scoreBlock
    
    height: parent.height

    spacing: units.gu(2)

    Label {
        id: scoreTextLabel
        
        anchors.verticalCenter: parent.verticalCenter

        text: i18n.tr("Score:")
    }

    Label {
        id: scoreLabel
        
        anchors.verticalCenter: parent.verticalCenter

        text: values.score
    }

    Label {
        id: linesTextLabel
        
        anchors.verticalCenter: parent.verticalCenter

        text: i18n.tr("Lines:")
    }

    Label {
        id: linesLabel
        
        anchors.verticalCenter: parent.verticalCenter

        text: values.lines
    }

    Label {
        id: levelTextLabel
        text: i18n.tr("Level:")

        anchors.verticalCenter: parent.verticalCenter
    }

    Label {
        id: levelLabel
        
        anchors.verticalCenter: parent.verticalCenter

        text: values.level
    }
}

