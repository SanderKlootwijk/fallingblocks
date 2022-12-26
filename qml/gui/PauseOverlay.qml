import QtQuick 2.7
import Lomiri.Components 1.3

LomiriShape {
    z: 100
    
    color: theme.palette.normal.overlay
    opacity: 0.91

    Label {
        anchors.centerIn: parent

        text: i18n.tr("Paused")
        fontSize: "Medium"
    }
}
