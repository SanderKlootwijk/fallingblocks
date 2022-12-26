import QtQuick 2.7
import Lomiri.Components 1.3
import "../logic/game.js" as Game

Page {
    id: settingsPage

    header: PageHeader {
        id: settingsPageHeader

        title: i18n.tr("Settings")
    }
    
    property bool initiated: false

    Flickable {
        id: settingsFlickable

        anchors {
            fill: parent
            topMargin: settingsPageHeader.height
        }

        contentWidth: settingsColumn.width
        contentHeight: settingsColumn.height
    
        Column {
            id: settingsColumn

            width: settingsPage.width

            ListItem {
                id: darkModeListItem

                onClicked: darkModeSwitch.checked ? darkModeSwitch.checked = false : darkModeSwitch.checked = true

                Label {
                    width: parent.width - units.gu(10)

                    anchors {
                        verticalCenter: parent.verticalCenter
                        left: parent.left
                        leftMargin: units.gu(2)
                    }

                    text: i18n.tr("Dark Mode")
                    elide: Text.ElideRight
                }

                Switch {
                    id: darkModeSwitch

                    anchors {
                        verticalCenter: parent.verticalCenter
                        right: parent.right
                        rightMargin: units.gu(2)
                    }

                    checked: settings.darkMode
                    onCheckedChanged: settings.darkMode = checked
                }
            }

            ListItem {
                id: musicListItem

                visible: true

                onClicked: musicSwitch.checked ? musicSwitch.checked = false : musicSwitch.checked = true

                Label {
                    width: parent.width - units.gu(10)

                    anchors {
                        verticalCenter: parent.verticalCenter
                        left: parent.left
                        leftMargin: units.gu(2)
                    }

                    text: i18n.tr("Music")

                    elide: Text.ElideRight
                }

                Switch {
                    id: musicSwitch

                    anchors {
                        verticalCenter: parent.verticalCenter
                        right: parent.right
                        rightMargin: units.gu(2)
                    }

                    checked: settings.music
                    onCheckedChanged: {
                        settings.music = checked
                        if (checked == true) { music.stop() }
                    }
                }
            }

            ListItem {
                id: soundEffectsListItem

                onClicked: soundEffectsSwitch.checked ? soundEffectsSwitch.checked = false : soundEffectsSwitch.checked = true

                Label {
                    width: parent.width - units.gu(10)

                    anchors {
                        verticalCenter: parent.verticalCenter
                        left: parent.left
                        leftMargin: units.gu(2)
                    }

                    text: i18n.tr("Sound Effects")
                    elide: Text.ElideRight
                }

                Switch {
                    id: soundEffectsSwitch

                    anchors {
                        verticalCenter: parent.verticalCenter
                        right: parent.right
                        rightMargin: units.gu(2)
                    }

                    checked: settings.soundEffects
                    onCheckedChanged: settings.soundEffects = checked
                }
            }

            ListItem {
                id: sensitivityListItem

                height: units.gu(11)

                Label {
                    id: sensitivityLabel

                    width: parent.width - units.gu(10)

                    anchors {
                        top: parent.top
                        topMargin: units.gu(2)
                        left: parent.left
                        leftMargin: units.gu(2)
                    }

                    text: i18n.tr("Drop sensitivity")
                    elide: Text.ElideRight
                }

                Slider {
                    id: sensitivitySlider

                    anchors {
                        top: sensitivityLabel.bottom
                        left: parent.left
                        leftMargin: units.gu(2)
                        right: parent.right
                        rightMargin: units.gu(2)
                    }

                    live: false
                    value: 5
                    minimumValue: 1
                    maximumValue: 9
                }

                Binding {
                    target: settings
                    property: "sensitivity"
                    value: sensitivitySlider.value
                    when: initiated
                }
            }
        }
    }

    Connections {
        target: values
        onInitiatedChanged: {
            sensitivitySlider.value = values.sensitivity
            initiated = true
        }
    }
}
