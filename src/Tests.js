import { initialize_board } from './Pieces.js';
import { make_engine_move } from './Engine.js';
import { legal_moves} from './ChessMoves';

/* Compare possible move generation to known possible move generation */
function test() {
    /* Initialize empty board.*/
    var t0 = performance.now();
    let test_squares = initialize_board();
    let possible_moves = legal_moves(test_squares, 'white');

    let total_positions = possible_moves.length;
    console.log(total_positions)

    let response_positions = []

    for (var i = 0; i < possible_moves.length; i++) {
        let current_board = possible_moves[i][0];
        let current_move = possible_moves[i][1];

        make_engine_move(current_board, current_move)

        response_positions = response_positions.concat(legal_moves(current_board, 'black'));
    }
    total_positions = total_positions + response_positions.length
    var t1 = performance.now();
    console.log((t1-t0)/1000, total_positions)
}

export { test }