/*
 * Copyright (C) 2022  Sander Klootwijk
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 3.
 *
 * fallingblocks is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import QtQuick 2.7
import Lomiri.Components 1.3
import QtQuick.Layouts 1.3
import Qt.labs.settings 1.0
import QtMultimedia 5.0

import "gui"
import "logic/game.js" as Game

MainView {
    id: root

    width: units.gu(45)
    height: units.gu(75)

    objectName: 'mainView'
    applicationName: 'fallingblocks.sanderklootwijk'
    automaticOrientation: true
    property string version: "1.0.1"

    QtValues {
        id: values
    }

    Settings {
        id: settings

        property bool darkMode: false
        property bool music: true
        property bool soundEffects: true

        property int highscore: 0
        property int sensitivity: 5

        onDarkModeChanged: {
            Theme.name = darkMode ? "Lomiri.Components.Themes.SuruDark" : "Lomiri.Components.Themes.Ambiance"
        }

        Component.onCompleted: {
            Theme.name = darkMode ? "Lomiri.Components.Themes.SuruDark" : "Lomiri.Components.Themes.Ambiance"
        }
    }

    property var musicFiles: ["01.ogg", "02.ogg", "03.ogg"]

    Audio {
        id: music

        property int current: Math.floor((Math.random() * musicFiles.length) + 1);
        onCurrentChanged: if (current > musicFiles.length) current = 1

        source: "music/" + musicFiles[current-1]

        onStatusChanged: {
            if (status == Audio.EndOfMedia) {
                current+=1
            }
        }
        
        onStopped: {
            current+=1
        }
    }

    Item {
        id: fx

        property var clear4: SoundEffect {
            id: clear4Fx

            source: "fx/clear.wav"
        }

        property var clear1: SoundEffect {
            id: clear1Fx

            source: "fx/clear1.wav"
        }

        property var laser: SoundEffect {
            id: laserFx

            source: "fx/laser.wav"
        }

        property var powerup: SoundEffect {
            id: powerUpFx

            source: "fx/powerup.wav"
        }

        property var shutdown: SoundEffect {
            id: shutdownFx

            source: "fx/shutdown.wav"
        }
        
        // property var alert: SoundEffect {
        //     id: alertFx

        //     source: "fx/alert.wav"
        // }

        // property var turn: SoundEffect {
        //     id: turnFx

        //     source: "fx/turn.wav"
        // }

        // property var blip: SoundEffect {
        //     id: turn2Fx

        //     source: "fx/blip.wav"
        // }

        // property var fastdrop: SoundEffect {
        //     id: fastDropFx

        //     source: "fx/fastdrop.wav"
        // }
    }

    PageStack {
        id: stack

        Component.onCompleted: push(gamePage)

        onCurrentPageChanged: {
            if (currentPage != gamePage && values.running == true) {
                values.paused = true
            }
        }

        GamePage {
            id: gamePage

            visible: false
        }

        SettingsPage {
            id: settingsPage

            visible: false
        }

        AboutPage {
            id: aboutPage

            visible: false
        }
    }

    Connections {
        target: Qt.application
        onActiveChanged:
            if (!Qt.application.active && values.running) {
                values.paused = true
            }
    }

    Component.onCompleted: {
        Game.valuesObject = values;
        Game.fx = fx
        Game.settings = settings

        gamePage.init()

        Keys.forwardTo = values.gameCanvas

        Game.init();
    }
}
