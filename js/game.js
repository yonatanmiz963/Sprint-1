'use strict'


var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame;
var gTimer;
var gBoard;


function initGame() {
    clearTimer();
    cleanTimerHTML();
    gGame = newGame();
    gBoard = buildBoard(gLevel.SIZE);
    createMines(gLevel.MINES);
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
                isMarked: false
            }

            board[i][j] = cell;
        }
    }
    return board;
}

// resets the game counters
function newGame() {
    var gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    return gGame;
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

            strHTML += `\t<td class="cell ${cellClass} ${className}"
             onclick="cellClicked(this,${i},${j})"
              oncontextmenu="cellMarked(this,${i},${j})"
               >\n`;

            strHTML += value;

            strHTML += '\t</td>\n';
        }

        strHTML += '</tr>\n';
    }
    // console.log(strHTML);
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}


// reveal a cell
function cellClicked(elCell, i, j) {

    var cell = gBoard[i][j];
    if (cell.isMarked) return;
    cell.isShown = cell.isShown ? false : true;

    if (cell.isShown) {
        gBoard.shownCount++;
        elCell.classList.toggle('shown');
    } else {
        gBoard.shownCount--;
    }

    checkGameOver(i, j);

    if (!gGame.isOn) {
        gGame.isOn = true;
        startTimer();
    }

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
        if (!cell.minesAroundCount && !cell.isMine) {
            expandShown({ i: i, j: j });
        }
    }

    renderCell({ i: i, j: j }, value);
}

// mark a cell
function cellMarked(elCell, i, j) {
    var cell = gBoard[i][j];

    if (!cell.isMarked) {
        cell.isMarked = true;
        gBoard.markedCount++;
        renderCell({ i: i, j: j }, '🏁 ');
    } else {
        cell.isMarked = false;
        renderCell({ i: i, j: j }, '');
    }

    checkGameOver(i, j);
    // console.log(cell);
}



// Counts the mines around a specific cell
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


// generates mines at random positions 
function createMines(num) {
    var minesCreated = 0;

    while (minesCreated !== num) {
        var randomPos = { i: getRandomInt(0, gLevel.SIZE), j: getRandomInt(0, gLevel.SIZE) }

        if (!gBoard[randomPos.i][randomPos.j].isMine) {
            gBoard[randomPos.i][randomPos.j].isMine = true;
            minesCreated++

            console.log('mine pos: ', randomPos);
        }
    }
}



// check if a clicked cell is a mine 
function checkGameOver(i, j) {
    var cell = gBoard[i][j];

    if (cell.isMine && !cell.isMarked) {
        revealAllMines();
        console.log('YOU LOSE!')
        gGame.isOn = false;
        clearTimer();
    } else {
        var isWin = checkIfVictory();
    }
    if (isWin) {
        console.log('YOU WIN!')
        gGame.isOn = false;
        clearTimer();
    }
}


// reveal all mines
function revealAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];

            if (cell.isMine) {
                renderCell({ i: i, j: j }, '💣');
            }
        }
    }
}



function checkIfVictory() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];

            if (cell.isMine) {
                if (!cell.isMarked) {
                    return false;
                }

            } else {
                if (!cell.isShown) {
                    return false;
                }
            }
        }
    }
    return true;
}



function changeLevel(size, mines) {
    clearTimer();
    cleanTimerHTML()
    gGame = newGame();
    gBoard = null;

    gLevel.SIZE = size;
    gLevel.MINES = mines;


    gBoard = buildBoard(gLevel.SIZE);
    createMines(gLevel.MINES);
    setMinesNegsCount(gBoard);
    renderBoard(gBoard);
}





// clearInterval
function clearTimer() {
    clearInterval(gTimer);
    gTimer = null;
}

function startTimer() {
    gTimer = setInterval(setTime, 1000);
}

function cleanTimerHTML() {
    var elMinutes = document.querySelector('.minutes');
    var elSeconds = document.querySelector('.seconds');
    elMinutes.innerHTML = '00';
    elSeconds.innerHTML = '00';
}




function expandShown(pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            if (i === pos.i && j === pos.j) continue
            var cell = gBoard[i][j]
            if (!cell.isMine) {
                if (cell.minesAroundCount) {
                    renderCell({ i: i, j: j }, cell.minesAroundCount);
                    var elCell = document.querySelector(`.cell-${i}-${j}`);
                    elCell.classList.add('shown');
                }

                // else {
                //     expandShown({ i: i, j: j })
                // }
            }
        }
    }
}