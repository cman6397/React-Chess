import { initialize_engine_board } from './Pieces.js';
import { make_engine_move, Game } from './Engine.js';
import { legal_moves} from './EngineMoves';

/* Compare possible move generation to known possible move generation */
function test() {
    /* Initialize empty board.*/
    var t0 = performance.now();
    let test_board = initialize_engine_board();
    let position = legal_moves(test_board, 'white', 95, 25)[0];

    let positions = get_positions(2, position, 'black');
    let total_positions = positions.length
    var t1 = performance.now();
    console.log('nodes per second ', total_positions / ((t1 - t0) / 1000), 'total_positions: ', total_positions)

    test_game();
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
            const new_board = make_engine_move(current_board, current_move);

            new_positions = new_positions.concat(legal_moves(new_board, player,95,25)[0]);
  
        }
        let new_player = (player === 'white') ? 'black' :'white';
        return get_positions(depth - 1, new_positions, new_player);
    }
}

function test_game() {
    let chess_game = new Game('white', initialize_engine_board());
    chess_game.set_king_locations();

    /*
    let position_moves = legal_moves(chess_game.squares, chess_game.player, chess_game.king_locations['white'], chess_game.king_locations['black'])[0];
    console.log(position_moves)
    */
}

export { test }