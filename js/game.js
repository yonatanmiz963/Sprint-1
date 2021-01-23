'use strict'

var gLevel = {
    SIZE: 4,
    MINES: 2,
    difficulity: 'beginner'
}

var gGame;
var gTimer;
var gBoard;


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
        isHint: false,
        safeClicks: 3,
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
        var hintedCells = revealHint({ i: i, j: j });
        setTimeout(function() {
            removeHintedShown(hintedCells);
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
    if (!cell.minesAroundCount && !cell.isMine) {
        expandShownRecurse({ i: i, j: j });
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
                continue;
            }
            gBoard[randomPos.i][randomPos.j].isMine = true;
            minesCreated++;
        }
    }
}



// Checks for a win or a loss.
function checkGameOver(i, j) {
    var elSmiley = document.querySelector('.smiley');
    if (!gGame.lives) {
        revealAllMines();
        elSmiley.innerHTML = '🤯';
        gGame.isFinished = true;
        clearTimer();
    } else {
        var isWin = checkIfVictory(i, j);
    }
    if (isWin) {
        setBestTime();
        elSmiley.innerHTML = '😎';
        document.getElementById('win').play();
        gGame.isFinished = true;
        clearTimer();
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
function changeLevel(difficulity, size, mines, lives) {
    gGame = null;
    gBoard = null;
    gGame = newGame();
    gLevel.SIZE = size;
    gLevel.MINES = mines;
    gLevel.difficulity = difficulity;
    gGame.lives = lives;
    gGame.secsPassed = 0;

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
    elLives.innerText = `Lives: ${gGame.lives}`;
    var elHints = document.querySelector('.hints');
    elHints.innerHTML = ` <img src="imgs/hint-light.jpg">
        <img src="imgs/hint-light.jpg">
        <img src="imgs/hint-light.jpg"> `;


    var elBestTime = document.querySelector('.best-time');
    elBestTime.innerText = (localStorage.getItem(`${gLevel.difficulity}`)) ? `Best Time: ${localStorage.getItem(`${gLevel.difficulity}`)}` : `Best Time: 0`;
    var elSafeClick = document.querySelector('.safe-click');
    elSafeClick.innerText = `${gGame.safeClicks} Safe Clicks`;
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
    var hintedCells = [];
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue

            var elCell = document.querySelector(`.cell-${i}-${j}`);
            var cell = gBoard[i][j];

            if (!cell.isShown) {
                cell.isShown = true;
                elCell.classList.add('shown');
                renderCell({ i: i, j: j });
                hintedCells.push({ i: i, j: j });
            }
        }

    }
    return hintedCells;
}



function renderCell(location) {
    var cell = gBoard[location.i][location.j];
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    var value = '';

    if (cell.isShown) {
        if (cell.isMine) {
            if (!gGame.isHint) {
                // gExplosionAudio.play();
                document.getElementById('explosion').play();
                if (gGame.lives !== 0) gGame.lives--;
            }
            elCell.classList.remove('shown');
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



function removeHintedShown(hintedCells) {
    if (hintedCells.length) {
        for (var i = 0; i < hintedCells.length; i++) {
            var cellPos = hintedCells[i];
            var cell = gBoard[cellPos.i][cellPos.j];
            cell.isShown = false;
            var elCell = document.querySelector(`.cell-${cellPos.i}-${cellPos.j}`);
            elCell.classList.remove('shown');
            renderCell({ i: cellPos.i, j: cellPos.j });
        }
    }
}



// RECURSIVE EXPANDING.
function expandShownRecurse(pos) {
    var nextEmpty = null;
    var cell = gBoard[pos.i][pos.j]

    if (cell.isMine) return;
    if (cell.minesAroundCount) {
        cell.isShown = true;
        renderCell({ i: pos.i, j: pos.j });
        var elCell = document.querySelector(`.cell-${pos.i}-${pos.j}`);
        elCell.classList.add('shown');

    } else {
        cell.isShown = true;
        renderCell({ i: pos.i, j: pos.j });
        var elCell = document.querySelector(`.cell-${pos.i}-${pos.j}`);
        elCell.classList.add('shown');

        for (var i = pos.i - 1; i <= pos.i + 1; i++) {
            if (i < 0 || i > gBoard.length - 1) continue
            for (var j = pos.j - 1; j <= pos.j + 1; j++) {
                if (j < 0 || j > gBoard[0].length - 1) continue
                if (i === pos.i && j === pos.j) continue
                var cell = gBoard[i][j];

                if (cell.minesAroundCount) {
                    cell.isShown = true;
                    renderCell({ i: i, j: j });
                    var elCell = document.querySelector(`.cell-${i}-${j}`);
                    elCell.classList.add('shown');
                }
                if (!cell.minesAroundCount && !cell.isMine && !cell.isShown && !nextEmpty) {
                    nextEmpty = { i: i, j: j };
                }
                if (nextEmpty && !cell.minesAroundCount && !cell.isMine && !cell.isShown) {
                    var secondEmpty = { i: i, j: j };
                }
            }
        }
        if (!nextEmpty) return;
        expandShownRecurse(nextEmpty);
        if (secondEmpty) {
            expandShownRecurse(secondEmpty);
        }
    }
}


function setBestTime() {
    switch (gLevel.difficulity) {
        case 'beginner':
            if (!localStorage.getItem('beginner') || gGame.secsPassed < localStorage.getItem('beginner')) {
                localStorage.removeItem('beginner');
                localStorage.setItem('beginner', gGame.secsPassed);
            }
            break;

        case 'medium':
            if (!localStorage.getItem('medium') || gGame.secsPassed < localStorage.getItem('medium')) {
                localStorage.removeItem('medium');
                localStorage.setItem('medium', gGame.secsPassed);
            }
            break;

        case 'expert':
            if (!localStorage.getItem('expert') || gGame.secsPassed < localStorage.getItem('expert')) {
                localStorage.removeItem('expert');
                localStorage.setItem('expert', gGame.secsPassed);
            }
            break;
    }
}


function safeClick() {
    if (gGame.safeClicks <= 0) return;
    gGame.safeClicks--;

    var elSafeClick = document.querySelector('.safe-click');
    elSafeClick.innerText = `${gGame.safeClicks} Safe Clicks`;

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
        var cell = gBoard[i][j];

        if (!cell.isMine && !cell.isShown) {
            var safeCell = {i: i, j: j};
        }
    }
    }

    var elSafeCell = document.querySelector(`.cell-${safeCell.i}-${safeCell.j}`);
    elSafeCell.style.backgroundColor = '#FFFF99';

    setTimeout(function() {
        var elSafeCell = document.querySelector(`.cell-${safeCell.i}-${safeCell.j}`);
    elSafeCell.style.backgroundColor = 'grey';
    }, 2000);
}