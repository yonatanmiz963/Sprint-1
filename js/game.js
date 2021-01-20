'use strict'


var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gBoard;








function initGame() {
    gBoard = buildBoard(gLevel.SIZE);
    createMines(gLevel.SIZE);
    // setting mines manually
    // gBoard[3][0].isMine = true;
    // gBoard[2][1].isMine = true;

    setMinesNegsCount(gBoard);
    renderBoard(gBoard)
    console.log(gBoard);



}

// Create a 4x4 gBoard Matrix containing Objects. Place 2 mines manually when each cell’s isShown set to true.
function buildBoard(size) {
    var board = createMat(size, size);

    for (var i = 0; i < board.length; i++) {

        for (var j = 0; j < board[0].length; j++) {

            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: true
            }

            board[i][j] = cell;
        }
    }

    return board;
}



// Updates mines count for each cell
function setMinesNegsCount(board) {

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]

            if (!cell.isMine) {
                cell.minesAroundCount = countMines({ i: i, j: j }, gBoard);

            }

        }
    }

}


function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';

        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            var value = '';
            var className = ' ';


            if (cell.isShown) {
                if (cell.isMine) {
                    value = '💣';
                    className += 'mine ';
                } else if (!cell.isMine && cell.minesAroundCount) {
                    value = cell.minesAroundCount;
                }

            } else {
                if (cell.isMine) {
                    className += 'mine ';

                }
            }




            var cellClass = getClassName({ i: i, j: j })

            //TODO - Change To template string
            strHTML += `\t<td class="cell ${cellClass} ${className}" onclick="cellClicked(this, ${i},${j})" >\n`;

            strHTML += value;

            strHTML += '\t</td>\n';
        }

        strHTML += '</tr>\n';
    }
    // console.log(strHTML);
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}


function cellClicked(elCell, i, j) {
    var cell = gBoard[i][j]
    cell.isShown = cell.isShown ? false : true;
    var value = '';

    if (cell.isShown) {
        // if mine
        if (cell.isMine) {
            value = '💣';
        }
        // If not mine and has mines around it
        if (!cell.isMine && cell.minesAroundCount) {
            value = cell.minesAroundCount;
        }
    } else {
        value = '';
    }

    console.log(cell)
    renderCell({ i: i, j: j }, value);
}



function cellMarked(elCell) {

}



function checkGameOver() {

}



function expandShown(board, elCell, i, j) {

}


function countMines(pos, board) {
    var minesCount = 0;

    for (var i = pos.i - 1; i <= pos.i + 1; i++) {

        if (i < 0 || i > board.length - 1) continue

        for (var j = pos.j - 1; j <= pos.j + 1; j++) {

            if (j < 0 || j > board[0].length - 1) continue

            if (i === pos.i && j === pos.j) continue

            var currCell = board[i][j]

            if (currCell.isMine) minesCount++
        }
    }
    return minesCount
}

function createMines(size) {
    var minesCreated = 0;

    while (minesCreated !== (size / 2)) {
        var randomPos = { i: getRandomInt(0, size), j: getRandomInt(0, size) }

        if (!gBoard[randomPos.i][randomPos.j].isMine) {
            gBoard[randomPos.i][randomPos.j].isMine = true;
            minesCreated++

            console.log('mine pos: ', randomPos);
        }
    }
}