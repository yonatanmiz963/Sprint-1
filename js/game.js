'use strict'

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame;
var gTimer;
var gBoard;
var gExplosionAudio = new Audio('../sounds/explosion.mp3');


function initGame() {
    clearTimer();
    gGame = newGame();
    resetHTML();
    gBoard = buildBoard(gLevel.SIZE);
    renderBoard(gBoard)
}


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


// resets the game counters.
function newGame() {
    var gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 2,
        isFinished: false,
        hints: 3,
        isHint: false
    }
    return gGame;
}


// Updates mines count for each cell.
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
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}


// Reveal a cell.
function cellClicked(elCell, i, j) {
    if (gGame.isFinished) return;
    if (gGame.isHint) {
        revealHint({ i: i, j: j });
        setTimeout(function() {
            revealHint({ i: i, j: j })
            gGame.isHint = false;
        }, 1000);
        return;
    }

    var cell = gBoard[i][j];

    if (cell.isMarked) return;
    if (!cell.isShown) {
        cell.isShown = true;
        gBoard.shownCount++;
        elCell.classList.add('shown');

    }
    if (!gGame.isOn) {
        gGame.isOn = true;
        createMines(gLevel.MINES, i, j);
        setMinesNegsCount(gBoard);
        startTimer();
    }

    // var value = '';

    if (!cell.minesAroundCount && !cell.isMine) {
        expandShown({ i: i, j: j });
    }
    renderCell({ i: i, j: j });
    checkGameOver(i, j);
}




// Marks a cell if right clicked.
function cellMarked(elCell, i, j) {
    if (gGame.isFinished) return;
    var cell = gBoard[i][j];

    if (!cell.isMarked) {
        cell.isMarked = true;
        gBoard.markedCount++;
        elCell.innerHTML = '🏁 ';
        elCell.classList.toggle('shown');
    } else {
        cell.isMarked = false;
        elCell.innerHTML = '';
        elCell.classList.toggle('shown');
    }

    checkGameOver(i, j);
}



// Counts the mines around a specific cell.
function countMines(pos, board) {
    var minesCount = 0;

    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            if (i === pos.i && j === pos.j) continue;
            var currCell = board[i][j];

            if (currCell.isMine) minesCount++;
        }
    }
    return minesCount;
}


// Generates mines at random positions. 
function createMines(num, i, j) {
    var minesCreated = 0;
    var startingPos = gBoard[i][j];

    while (minesCreated !== num) {
        var randomPos = { i: getRandomInt(0, gLevel.SIZE), j: getRandomInt(0, gLevel.SIZE) }

        if (!gBoard[randomPos.i][randomPos.j].isMine) {
            if (gBoard[randomPos.i][randomPos.j] === startingPos) {
                // console.log('this is the starting pos', randomPos);
                continue;
            }
            gBoard[randomPos.i][randomPos.j].isMine = true;
            minesCreated++;
            // console.log('mine pos: ', randomPos);
        }
    }
}



// Checks for a win or a loss.
function checkGameOver(i, j) {
    var elSmiley = document.querySelector('.smiley');
    // console.log('lives left: ', gGame.lives)

    if (!gGame.lives) {
        revealAllMines();
        elSmiley.innerHTML = '🤯';
        gGame.isFinished = true;
        clearTimer();
        // console.log('YOU LOSE!');
    } else {
        var isWin = checkIfVictory(i, j);
    }
    if (isWin) {
        elSmiley.innerHTML = '😎';
        gGame.isFinished = true;
        clearTimer();
        // console.log('YOU WIN!')
    }
}


// Reveal all mines.
function revealAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];

            if (cell.isMine) {
                cell.isShown = true;
                renderCell({ i: i, j: j }, '💣');
            }
        }
    }
}



function checkIfVictory(i, j) {
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


// Modifies level and resets game.
function changeLevel(size, mines, lives) {
    gGame = null;
    gBoard = null;
    gGame = newGame();
    gLevel.SIZE = size;
    gLevel.MINES = mines;
    gGame.lives = lives;
    clearTimer();
    resetHTML()
    gBoard = buildBoard(gLevel.SIZE);
    renderBoard(gBoard);
}



// Clears gamme interval.
function clearTimer() {
    clearInterval(gTimer);
    gTimer = null;
}


// Starts game interval.
function startTimer() {
    gTimer = setInterval(setTime, 1000);
}


// Resets all HTML fields every level change/init.
function resetHTML() {
    var elMinutes = document.querySelector('.minutes');
    var elSeconds = document.querySelector('.seconds');
    elMinutes.innerHTML = '00';
    elSeconds.innerHTML = '00';
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerHTML = '😀';
    var elLives = document.querySelector('.lives');
    console.log(elLives);
    elLives.innerText = `Lives: ${gGame.lives}`;
    var elHints = document.querySelector('.hints');
    elHints.innerHTML = ` <img src="imgs/hint-light.jpg">
        <img src="imgs/hint-light.jpg">
        <img src="imgs/hint-light.jpg"> `;
}



// Expands all cells that have no mine neighbors.
function expandShown(pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            if (i === pos.i && j === pos.j) continue
            var cell = gBoard[i][j]

            if (!cell.isMine) {
                if (cell.minesAroundCount) {
                    cell.isShown = true;
                    renderCell({ i: i, j: j }, cell.minesAroundCount);
                    var elCell = document.querySelector(`.cell-${i}-${j}`);
                    elCell.classList.add('shown');
                }
            }
        }
    }
}


// removes one hint each click.
function getHint() {
    if (!gGame.isOn) return;
    gGame.isHint = true;
    --gGame.hints;
    var elHints = document.querySelector('.hints');
    if (gGame.hints === 2) {
        elHints.innerHTML = ` <img src="imgs/hint-light.jpg">
        <img src="imgs/hint-light.jpg"> `;
    } else if (gGame.hints === 1) {
        elHints.innerHTML = ` <img src="imgs/hint-light.jpg">`;
    } else {
        elHints.innerHTML = '';
    }
}


// reveals all the hint cell neighbors.
function revealHint(pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            if (i === pos.i && j === pos.j) continue

            var elCell = document.querySelector(`.cell-${i}-${j}`);
            var cell = gBoard[i][j];

            if (elCell.classList.contains('shown')) {
                cell.isShown = false;
                elCell.classList.remove('shown');

            } else {
                cell.isShown = true;
                elCell.classList.add('shown');
            }

            renderCell({ i: i, j: j }, '');
        }
    }
}


function renderCell(location) {
    var cell = gBoard[location.i][location.j];
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    var value = '';

    if (cell.isShown) {
        if (cell.isMine) {
            if (!gGame.isHint) {
                gExplosionAudio.play();
                if (gGame.lives !== 0) gGame.lives--;
            }
            value = '💣';
            var elLives = document.querySelector('.lives');
            elLives.innerText = `Lives: ${gGame.lives}`;
        }

        if (!cell.isMine && cell.minesAroundCount) {
            value = cell.minesAroundCount;
        }
    }

    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector);
    elCell.innerHTML = value;
}