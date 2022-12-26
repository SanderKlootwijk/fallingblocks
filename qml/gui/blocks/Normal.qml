import QtQuick 2.7
import Lomiri.Components 1.3
import "../../logic/game.js" as Game

LomiriShape {
    id: singleBlock
    
    // the shape this block originally was for defining the color
    // 0: iShape    1: jShape   2: lSape    3: oShape   4: zShape   5: tShape   6: sShape
    property int shape: -1
    property double blockSize: Game.valuesObject.blockSize
    property int column: 0
    property int row: 0
    property color blockColor

    property variant shapeStype: NormalColors {}
    
    width: blockSize
    height: blockSize

    x: column * blockSize
    y: row * blockSize

    color: theme.name == "Ubuntu.Components.Themes.Ambiance" ? "#3F3F3F" : "#7F7F7F"

    onShapeChanged: {
        if (Game.valuesObject.debug)
            print("Normal::onShapeChanged():"+shape)
        switch(shape)
        {
        case -1:
            visible = false;
            return
        case 0:
            blockColor = shapeStype.iColor;
            break;
        case 1:
            blockColor = shapeStype.jColor;
            break;
        case 2:
            blockColor = shapeStype.lColor;
            break;
        case 3:
            blockColor = shapeStype.oColor;
            break;
        case 4:
            blockColor = shapeStype.sColor;
            break;
        case 5:
            blockColor = shapeStype.tColor;
            break;
        case 6:
            blockColor = shapeStype.zColor;
            break;
        }
        visible = true
    }
    LomiriShape {
        id: block

        anchors {
            fill: parent
            margins: units.gu(0.25)
        }
        
        color: blockColor
    }
}
