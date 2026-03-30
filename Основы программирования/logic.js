let players = ['x', 'o'];
let activePlayer = 0;
let board;

function startGame() {
  board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];
activePlayer = Math.floor(Math.random() * 2);
renderBoard(board)
console.log('Новая игра начата!');
console.log(`Первый ход за игроком: ${players[activePlayer]}`);
}

function click(row, col) {
  if (board[row][col] !== '') {
    return;
  }

  board[row][col] = players[activePlayer];
  renderBoard(board);
  
  if (checkWin(row, col)) {
    showWinner(activePlayer);
    return;
  }

  switchPlayer();
}

function checkWin(row, col) {
  const player = players[activePlayer];

  if (board[row][0] === player && 
    board[row][1] === player && 
    board[row][2] === player) {
  return true;
}

  if (board[0][col] === player && 
        board[1][col] === player && 
        board[2][col] === player) {
      return true;
  }

  if (row === col) {
    if (board[0][0] === player &&
        board[1][1] === player &&
        board[2][2] === player) {
      return true;
    }
  }

  if (row + col === 2) {
    if (board[0][2] === player && 
        board[1][1] === player && 
        board[2][0] === player) {
      return true;
    }
  }

  return false;
}

function switchPlayer() {
  activePlayer = activePlayer === 0 ? 1 : 0;
}
