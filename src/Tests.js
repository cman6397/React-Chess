import { initialize_board, make_move} from './Pieces.js';
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

        let start = current_move[0];
        let end = current_move[1];
        let piece_copy = JSON.parse(JSON.stringify(current_move[2]));

        make_move(start,end,current_board,piece_copy)

        response_positions = response_positions.concat(legal_moves(current_board, 'black'));
    }
    total_positions = total_positions + response_positions.length
    var t1 = performance.now();
    console.log((t1-t0)/1000, total_positions)
}

export { test }