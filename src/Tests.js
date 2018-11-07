import { initialize_engine_board, King, Rook, Pawn, Knight, Bishop } from './Pieces.js';
import { make_move, Position } from './Engine.js';
import { legal_moves, engine_squares, get_king_locations} from './EngineMoves';

/* Compare possible move generation to known possible move generation.  */
function test() {
    //test_position_class();
    test_positions();
    test_king();
    test_pawn();
    fen_to_position('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
}
/*Check number of positions found.  1) 20, 2) 400, 3) 8902, 4) 197281 for starting position */
function test_positions() {
    var t0 = performance.now();
    let depth = 3; 

    let chess_position = new Position('white', initialize_engine_board(), [95, 25], [1,1,1,1]);

    let moves = get_positions(depth, [chess_position]);
    let total_positions = moves.length

    var t1 = performance.now();
    console.log('nodes per second', total_positions / ((t1 - t0) / 1000), 'total_positions:', total_positions, 'depth:', depth)
}

/*Test King Moves*/
function test_king() {
    let passed=true;

    let pieces = [new King('white'), new King('black')];
    let locations = [60, 4];

    /*edge of board*/
    if (!test_num_moves(pieces, locations, 'white',[0,0,0,0],5)) {
        passed = false;
    }
    /* middle of board*/
    pieces = [new King('white'), new King('black')];
    locations = [45, 4];

    if (!test_num_moves(pieces, locations, 'white',[0,0,0,0],8)) {
        passed = false;
    }
    /*castle*/
    pieces = [new King('white'), new Rook('white'), new Pawn('white'), new King('black')];
    locations = [60, 63, 55, 4];

    if (!test_num_moves(pieces, locations, 'white',[1,0,0,0],10)) {
        passed = false;
    }

    if (passed) {
        console.log('PASSED')
    }
}

function test_pawn() {
    let passed=true;

    let pieces = [new King('white'), new King('black'), new Pawn('white')];
    let locations = [60, 4, 55];

    /*start move*/
    if (!test_num_moves(pieces, locations, 'white',[0,0,0,0],7)) {
        passed = false;
    }

    if (passed) {
        console.log('PASSED')
    }

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
    let chess_position = new Position('white', initialize_engine_board(), [95, 25], [1, 1, 1, 1]);
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
/* Turn FEN position representation into position object */
function fen_to_position(fen_string) {
    console.log(fen_string)
}

function test_num_moves(pieces, locations, player, castle_state, num_moves){
    let passed = true;
    let squares = Array(64).fill(null);

    for (var x = 0; x< pieces.length; x++){
        squares[locations[x]] = pieces[x];
    }
    
    squares = engine_squares(squares);
    let king_locations = get_king_locations(squares);
    let chess_position = new Position(player, squares, king_locations, castle_state);

    let moves = legal_moves(chess_position);
    if (moves.length !== num_moves ){
        passed = false;
    }
    return passed;
}

export { test }