import { initialize_engine_board } from './Pieces.js';
import { make_move, Position } from './Engine.js';
import { legal_moves} from './EngineMoves';

/* Compare possible move generation to known possible move generation.  */
function test() {
    test_position_class();
    test_positions();
}
/*Check number of positions found.  1) 20, 2) 400, 3) 8902, 4) 197281 */
function test_positions() {
    var t0 = performance.now();
    let depth = 4; 

    let chess_position = new Position('white', initialize_engine_board(), [95, 25]);

    let moves = get_positions(depth, [chess_position]);
    let total_positions = moves.length

    var t1 = performance.now();
    console.log('nodes per second', total_positions / ((t1 - t0) / 1000), 'total_positions:', total_positions, 'depth:', depth)
}
/* Breadth First Search.*/
function get_positions(depth, positions) {
    if (depth === 0) {
        return positions;
    }
    else {
        let new_positions = [];
        for (var j = 0; j < positions.length; j++) {
            let current_position = positions[j];
            let moves = legal_moves(current_position);

            for (var i = 0; i < moves.length; i++) {
                let current_move = moves[i];
                let next_move = make_move(current_position, current_move)
                new_positions.push(next_move);
            }
        }
        return get_positions(depth - 1, new_positions);
    }
}

/*See how move generation functions and move making functions are doing speed wise*/
function test_position_class() {
    let chess_position = new Position('white', initialize_engine_board(), [95, 25]);
    let moves = legal_moves(chess_position);
    let positions = [];
    let total_moves = 10000;
    let total_positions = 20000; 

    var m0 = performance.now();
    for (var x = 0; x < total_moves; x++) {
        let new_position = make_move(chess_position, moves[0]);
        positions.push(new_position);
    }
    var m1 = performance.now();

    var p0 = performance.now();
    for (x = 0; x < total_positions; x++) {
        legal_moves(chess_position);
    }
    var p1 = performance.now();

    console.log('made moves per second', total_moves / ((m1 - m0) / 1000), 'total_moves:', total_moves);
    console.log('moves_generated_per_second', (total_positions * legal_moves(chess_position).length) / ((p1 - p0) / 1000), 'total_moves_generated:', (total_positions * legal_moves(chess_position).length));
}

export { test }