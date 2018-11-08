import { initialize_engine_board, King, Rook, Pawn, Knight, Bishop, Queen } from './Pieces.js';
import { make_move, Position,breadth_search, evaluate_position } from './Engine.js';
import { legal_moves, engine_squares} from './EngineMoves';

/* Compare possible move generation to known possible move generation.  */
function test() {
    test_position_class();
    test_positions();
    test_pieces();
    test_evaluation();
   
}
/*Check number of positions found.  1) 20, 2) 400, 3) 8902, 4) 197281 for starting position */
function test_positions() {
    var t0 = performance.now();
    let depth = 4; 

    let chess_position = new Position('white', initialize_engine_board(), [95, 25], [1,1,1,1]);

    let positions = breadth_search(depth, [chess_position]);
    let total_positions = positions.length

    var t1 = performance.now();
    console.log('nodes per second', total_positions / ((t1 - t0) / 1000), 'total_positions:', total_positions, 'depth:', depth)
}

/*Test Piece Moves */
function test_pieces() {
    let test_results = [];
    test_results.push(test_king());
    test_results.push(test_pawn());
    test_results.push(test_knight());
    test_results.push(test_bishop());
    test_results.push(test_rook());
    test_results.push(test_queen());

    console.log(test_results);
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
        return 'PASSED'
    }
    else {
        return 'KING FAILED'
    }
}
/*Test Pawn Moves*/
function test_pawn() {
    let passed=true;

    /*start move test*/
    let pieces = [new King('white'), new King('black'), new Pawn('white')];
    let locations = [60, 4, 55];

    if (!test_num_moves(pieces, locations, 'white',[0,0,0,0],7)) {
        passed = false;
    }

    /*move with capture test*/
    let white_pawn = new Pawn('white');
    white_pawn.has_moved = true;

    let black_pawn = new Pawn('black');
    black_pawn.has_moved = true;

    pieces = [new King('white'), new King('black'), white_pawn, black_pawn];
    locations = [60, 4, 27, 18];

    if (!test_num_moves(pieces, locations, 'white', [0, 0, 0, 0], 7)) {
        passed = false;
    }

    /*en passant test*/
    white_pawn = new Pawn('white');
    white_pawn.has_moved = true;

    black_pawn = new Pawn('black');
    black_pawn.has_moved = true;
    black_pawn.just_moved_two = true;

    pieces = [new King('white'), new King('black'), white_pawn, black_pawn];
    locations = [60, 4, 26, 25];

    if (!test_num_moves(pieces, locations, 'white', [0, 0, 0, 0], 7)) {
        passed = false;
    }

    /*promotion test*/
    white_pawn = new Pawn('white');
    white_pawn.has_moved = true;

    let black_rook = new Rook('black');

    pieces = [new King('white'), new King('black'), white_pawn, black_rook];
    locations = [60, 4, 14, 7];

    if (!test_num_moves(pieces, locations, 'white', [0, 0, 0, 0], 13)) {
        passed = false;
    }

    if (passed) {
        return 'PASSED'
    }
    else {
        return 'PAWN FAILED'
    }

}

/*Test Knight Moves*/
function test_knight() {
    let passed = true;

    /*start move test*/
    let pieces = [new King('white'), new King('black'), new Knight('white')];
    let locations = [60, 4, 35];

    if (!test_num_moves(pieces, locations, 'white', [0, 0, 0, 0], 13)) {
        passed = false;
    }

    if (passed) {
        return 'PASSED'
    }
    else {
        return 'KNIGHT FAILED'
    }
}

/*Test Bishop Moves*/
function test_bishop() {
    let passed = true;

    /*start move test*/
    let pieces = [new King('white'), new King('black'), new Bishop('white')];
    let locations = [60, 4, 35];

    if (!test_num_moves(pieces, locations, 'white', [0, 0, 0, 0], 18)) {
        passed = false;
    }

    if (passed) {
        return 'PASSED'
    }
    else {
        return 'BISHOP FAILED'
    }
}

/*Test Rook Moves*/
function test_rook() {
    let passed = true;

    /*start move test*/
    let pieces = [new King('white'), new King('black'), new Rook('white')];
    let locations = [60, 4, 35];

    if (!test_num_moves(pieces, locations, 'white', [0, 0, 0, 0], 19)) {
        passed = false;
    }

    if (passed) {
        return 'PASSED'
    }
    else {
        return 'ROOK FAILED'
    }
}
/* Test Queen Moves */
function test_queen() {
    let passed = true;

    /*start move test*/
    let pieces = [new King('white'), new King('black'), new Queen('white')];
    let locations = [60, 4, 35];

    if (!test_num_moves(pieces, locations, 'white', [0, 0, 0, 0], 32)) {
        passed = false;
    }

    if (passed) {
        return 'PASSED'
    }
    else {
        return 'QUEEN FAILED'
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

function test_evaluation(){
    let chess_position = new Position('white', initialize_engine_board(), [95, 25], [1, 1, 1, 1]);

    if (evaluate_position(chess_position) !== 0){
        console.log('EVALUATION FAILED')
    }
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

function get_king_locations(squares) {
    /*White King Location & Black King location*/
    let wk_location = null;
    let bk_location = null;

    for (var k = 0; k < squares.length; k++) {
        let current_square = squares[k];
        if (current_square !== null && current_square !== 'boundary') {
            if (current_square.name === 'King') {
                if (current_square.player === 'white') {
                    wk_location = k;
                }
                else {
                    bk_location = k;
                }
            }
        }
    }
    let king_locations = [wk_location, bk_location]
    return king_locations;
}

export { test }