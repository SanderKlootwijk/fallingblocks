import QtQuick 2.7
import "gui/blocks"

QtObject {
    property double blockSize
    property bool initiated: false
    property bool running: !paused && started && !gameOver && !waiting
    property bool paused: false
    property bool waiting: false
    property bool started: false
    property bool gameOver: false
    property bool debug: false
    property int score: 0
    property int lines: 0
    property int level: 0
    property int deltaTime: 1000
    property int comboScore: 0
    property int highscore: 0
    property bool nowHighscore: highscore < score

    property int startingLevel: 1
    property int sensitivity: settings.sensitivity

    property Item gameCanvas

    property Shape currentPiece: Shape
    property Shape nextPiece: Shape
    property Shape storedPiece: Shape

    signal run(bool running)
    signal init()

    onRunningChanged: {
        print("QtValues::onRunningChanged():" + running)
        if (running) {
            if (settings.music == true) { music.play() }
        }
        run(running)
    }

    onPausedChanged: {
        print("QtValues::onPausedChanged():" + paused)
        if (paused) {
            if (settings.music == true) { music.pause() }
        }
    }

    onWaitingChanged: {
        print("QtValues::onWaitingChanged():" + waiting)
        if (waiting) {

        }
    }

    onStartedChanged: {
        print("QtValues::onStartedChanged():" + started)
        if (started) {
            gameOver = false
        }
    }

    onScoreChanged: {
        if (score > settings.highscore) {
            settings.highscore = score
        }
    }

    onGameOverChanged: {
        print("QtValues::onGameOverChanged():" + gameOver)
        if (gameOver) {
            music.stop()
            paused = false;
            started = false;
        }
    }

    onInit: {
        paused = false
        waiting = false
        started = false
        gameOver = false
        score = 0
        lines = 0
        level = 0
        deltaTime = 1000
        highscore = settings.highscore
        initiated = true
    }
}
