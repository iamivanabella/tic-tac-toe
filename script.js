const Gameboard = (() => {
    let board = ['', '', '', '', '', '', '', '', ''];

    const getBoard = () => board;

    const updateCell = (index, symbol) => {
        board[index] = symbol;
        GameFlow.checkGame();
    };

    const resetBoard = () => {
        board = ['', '', '', '', '', '', '', '', ''];
    };

    const getAvailableMoves = (board) => {
        const availableMoves = [];
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                availableMoves.push(i);
            }
        }
        return availableMoves;
    };

    const isBoardFull = (board) => !board.includes('');

    return {
        getBoard,
        updateCell,
        resetBoard,
        getAvailableMoves,
        isBoardFull
    };
})();

const Player = (name, symbol) => ({
    getName: () => name,
    getSymbol: () => symbol,
});

const ComputerPlayer = (symbol) => {
    const getName = () => 'Computer';
    const getSymbol = () => symbol;

    const makeRandomMove = () => {
        const availableMoves = Gameboard.getAvailableMoves(Gameboard.getBoard());
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        const randomMove = availableMoves[randomIndex];

        Gameboard.updateCell(randomMove, getSymbol());
    };

    const makeSmartMove = () => {
        const board = Gameboard.getBoard();
        const bestMove = minimax(board, getSymbol()).index;
        Gameboard.updateCell(bestMove, getSymbol());
    };

    const minimax = (board, player) => {
        // console.log(`minimax(board, ${player})`);

        const availableMoves = Gameboard.getAvailableMoves(board);

        if (GameFlow.isGameWon(board, getSymbol())) {
            // console.log('Game is won by computer');
            return { score: 10 };
        } else if (GameFlow.isGameWon(board, GameFlow.getOpponent(getSymbol()))) {
            // console.log('Game is won by opponent');
            return { score: -10 };
        } else if (availableMoves.length === 0) {
            // console.log('Game is a tie');
            return { score: 0 };
        }

        const moves = [];

        for (let i = 0; i < availableMoves.length; i++) {
            const move = {};
            move.index = availableMoves[i];
            board[availableMoves[i]] = player;

            // console.log(`Trying move ${availableMoves[i]} for ${player}`);
            // console.log('Current board:', board);

            if (player === getSymbol()) {
                const result = minimax(board, GameFlow.getOpponent(player));
                move.score = result.score;
            } else {
                const result = minimax(board, getSymbol());
                move.score = result.score;
            }

            board[availableMoves[i]] = ''; 

            // console.log(`Move ${availableMoves[i]} for ${player} has score: ${move.score}`);
            // console.log('Board after move:', board);

            moves.push(move);
        }

        let bestMove;
        if (player === getSymbol()) {
            let bestScore = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        // console.log(`Best move for ${player} has score: ${moves[bestMove].score}`);
        // console.log('Best move:', moves[bestMove].index);

        return moves[bestMove];
    };


    return {
        getName,
        getSymbol,
        makeRandomMove,
        makeSmartMove,
    };
};


const GameFlow = (() => {
    const player1 = Player('Player 1', 'X');
    const player2 = ComputerPlayer('O');
    let currentPlayer = player1;
    let gameStatus = false;

    const switchTurn = () => {
        currentPlayer = currentPlayer === player1 ? player2 : player1;

        if (currentPlayer === player2) {
            currentPlayer.makeSmartMove();
        }
    };

    const getCurrentPlayer = () => currentPlayer;

    const getOpponent = (symbol) => (symbol === 'X' ? 'O' : 'X');

    const newGame = () => {

        currentPlayer = gameStatus === player1 ? player2 : player1;

        gameStatus = false;
    };

    const isGameWon = (board, symbol) => {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        for (const combination of winningCombinations) {
            const [a, b, c] = combination;

            if (board[a] === symbol && board[b] === symbol && board[c] === symbol) {
                return true;
            }
        }
        return false;
    };


    const checkGame = () => {
        const board = Gameboard.getBoard();

        if (isGameWon(board, currentPlayer.getSymbol())) {
            gameStatus = currentPlayer;
        } else if (Gameboard.isBoardFull(board)) {
            gameStatus = 'tie';
        } else {
            switchTurn();
        }
    }

    const getGameStatus = () => gameStatus;

    return {
        getCurrentPlayer,
        switchTurn,
        newGame,
        getGameStatus,
        checkGame,
        getOpponent,
        isGameWon
    };
})();

// Renders board game
const renderBoard = () => {
    const board = Gameboard.getBoard();
    const cells = document.querySelectorAll('#board td');

    cells.forEach((cell, index) => {
        cell.textContent = board[index];
    });

    const restartButton = document.getElementById('restartButton');
    const gameStatus = GameFlow.getGameStatus();

    // Add message 
    if (!gameStatus) {
        restartButton.classList.add('hidden');
    } else {
        const message = gameStatus === 'tie' ? 'It\'s a tie!' : `${gameStatus.getName()} wins!`;
        document.getElementById('message').textContent = message;

        restartButton.classList.remove('hidden');
        restartButton.addEventListener('click', () => {
            document.getElementById('message').textContent = '';
            Gameboard.resetBoard();
            GameFlow.newGame();
            renderBoard();
        });
    }

};

const handleClick = (event) => {
    const gameStatus = GameFlow.getGameStatus();
    const currentPlayer = GameFlow.getCurrentPlayer();
    const board = Gameboard.getBoard();

    if (gameStatus) {
        return;
    }

    const cellIndex = event.target.dataset.index;

    if (!board[cellIndex] && cellIndex) {
        Gameboard.updateCell(cellIndex, currentPlayer.getSymbol());
        renderBoard();
    }
};

document.getElementById('board').addEventListener('click', handleClick);
