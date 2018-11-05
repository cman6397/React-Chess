import { initialize_board } from './Pieces.js';
import { make_engine_move } from './Engine.js';
import { legal_moves, normal_squares} from './ChessMoves';

/* Compare possible move generation to known possible move generation */
function test() {
    /* Initialize empty board.*/
    var t0 = performance.now();
    const test_squares = initialize_board();
    let initial_positions = legal_moves(test_squares, 'white')[0];

    let positions = get_positions(3, initial_positions, 'black');
    let total_positions = positions.length
    var t1 = performance.now();
    console.log('nodes per second ', total_positions/((t1-t0)/1000), 'total_positions: ', total_positions)
}

function get_positions(depth, positions,player) {
    if (depth === 0) {
        return positions;
    }
    else {
        let new_positions = [];
        for (var i = 0; i < positions.length; i++) {
            const current_board = positions[i][0];
            const current_move = positions[i][1];
            const new_board = normal_squares(make_engine_move(current_board, current_move));

            new_positions = new_positions.concat(legal_moves(new_board, player)[0]);
        }

        let new_player = (player === 'white') ? 'black' :'white';
        return get_positions(depth - 1, new_positions, new_player);
    }
}

export { test }