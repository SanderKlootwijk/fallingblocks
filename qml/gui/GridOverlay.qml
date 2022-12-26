import QtQuick 2.7

Grid {
    id: grid

    property alias model: reptr.model
    property real imgWidth
    property real imgheight
    
    Repeater {
        id: reptr
    
        Image {
            id: img
    
            width: imgWidth
            height: imgheight
    
            source: getSource(index)
        }
    }

    function getSource(index) {
        if (index%columns===0) {
            if (index===0) {
                return "img/rasterLU.svg"
            }
            else if (index===(rows-1)*columns) {
                return "img/rasterLD.svg"
            }
            else {
                return "img/rasterL.svg"
            }
        }
        else if (index%columns===columns-1) {
            if (index===columns-1) {
                return "img/rasterRU.svg"
            }
            else if (index===rows*columns-1) {
                return "img/rasterRD.svg"
            }
            else {
                return "img/rasterR.svg"
            }
        }
        else if (index<columns) {
            return "img/rasterU.svg"
        }
        else if (index>columns*(rows-1)) {
            return "img/rasterD.svg"
        }
        return "img/rasterM.svg"
    }
}
