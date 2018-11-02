//These are tests for the Engine and move validation
import { initialize_board, make_move } from './Pieces.js';
import { legal_moves, is_legal } from './Engine';

function test_time() {

}

function tests() {
    /* Initialize empty board.*/
    var t0 = performance.now();
    let test_squares = initialize_board();
    let possible_moves = legal_moves(test_squares, 'white');
    for (var i = 0; i < 100000; i++) {
        possible_moves = legal_moves(test_squares, 'white');
    }
    var t1 = performance.now();
    console.log((t1-t0)/1000)
}


export { tests }