import QtQuick 2.7
import Lomiri.Components 1.3
import Lomiri.Components.Popups 1.3
import Lomiri.Components.ListItems 1.3 as ListItem
import "../logic/game.js" as Game

Dialog {
    id: gameOverDialog

    title: values.nowHighscore?i18n.tr("New Highscore"):i18n.tr("Game Over")
    
    text: i18n.tr("Your score is:") + "\n" + values.score

    Button {
        id: newGameButton

        color: theme.palette.normal.positive
        text: i18n.tr("New Game")

        onClicked: {
            Game.startNewGame()
            PopupUtils.close(gameOverDialog)
            values.startButtonEnabled = true
        }
    }

    Button {
        id: closeButton

        color: theme.palette.normal.base
        text: i18n.tr("Close")

        onClicked: {
            PopupUtils.close(gameOverDialog)
            values.startButtonEnabled = true
        }
    }
}
