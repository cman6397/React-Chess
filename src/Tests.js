import { initialize_engine_board } from './Pieces.js';
import { make_move, Position } from './Engine.js';
import { legal_moves} from './EngineMoves';

/* Compare possible move generation to known possible move generation.  */
function test() {
    test_positions();
    test_position_class();
}

function test_positions() {
    var t0 = performance.now();

    let chess_position = new Position('white', initialize_engine_board(), {white: 95, black: 25});

    let positions = get_positions(4, [chess_position]);
    let total_positions = positions.length

    var t1 = performance.now();
    console.log('nodes per second ', total_positions / ((t1 - t0) / 1000), 'total_positions: ', total_positions)
}

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
                const new_position = make_move(current_position,current_move);
                new_positions = new_positions.concat(new_position);
            }
        }
        return get_positions(depth - 1, new_positions);
    }
}

function test_position_class() {
    let chess_position = new Position('white', initialize_engine_board(), {white: 95, black: 25});
    let moves = legal_moves(chess_position);
    let new_position = make_move(chess_position, moves[0]);

    return new_position;

    /*
    let position_moves = legal_moves(chess_game.squares, chess_game.player, chess_game.king_locations['white'], chess_game.king_locations['black'])[0];
    console.log(position_moves)
    */
}

export { test }