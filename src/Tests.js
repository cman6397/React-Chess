//These are tests for the Engine and move validation
import { Pawn,Rook,Knight,Bishop,King,Queen,initialize_board, make_move } from './Pieces.js';
import { legal_moves, is_legal } from './Engine';

function random_position() {
    var board = Array(64).fill(null)
    for (var k = 0; k < 5; k++) {
        board[k + 8] = new Pawn('black');
        board[k + 48] = new Pawn('white');
    };

    var color = 'black';
    for (var i = 0; i < 2; i++) {
        if (i === 1) {
            color = 'white'
        }
        board[i * 56] = new Rook(color);
        board[i * 56 + 7] = new Rook(color);
        board[i * 56 + 1] = new Knight(color);
        board[i * 56 + 6] = new Knight(color);
        board[i * 56 + 2] = new Bishop(color);
        board[i * 56 + 5] = new Bishop(color);
        board[i * 56 + 3] = new Queen(color);
        board[i * 56 + 4] = new King(color);
    }
    return board
}

function tests() {
    /* Initialize empty board.*/
    var t0 = performance.now();
    let test_squares = random_position();
    let possible_moves = legal_moves(test_squares, 'white');
    for (var i = 0; i < 1000000; i++) {
        possible_moves = legal_moves(test_squares, 'white');
    }
    var t1 = performance.now();
    console.log((t1-t0)/1000)
}


export { tests }