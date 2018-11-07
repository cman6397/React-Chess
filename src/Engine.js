
import { legal_moves} from './EngineMoves';

/* king locations = [white king, black king]
 * castle_state = [white kingside, white queenside, black kingside, black queenside] 1 for can castle 0 for cannot castle */
class Position {
    constructor(player, squares, king_locations, castle_state) {
        this.player = player;
        this.squares = squares;
        this.king_locations = king_locations;
        this.castle_state = castle_state;
    }
}

class Move {
    constructor(start,end, en_passant, rook_start, rook_end) {
        this.start = start;
        this.end = end;
        this.en_passant_capture = en_passant;
        this.rook_start = rook_start;
        this.rook_end = rook_end;
    }
}

function make_move(position, move) {

    let start = move.start
    let end = move.end

    /*Starting Rook Locations */
    let wk_rook = 96;
    let wq_rook = 91;
    let bk_rook = 28;
    let bq_rook = 21;

    let player = position.player;

    let squares = position.squares.slice();
    let piece = JSON.parse(JSON.stringify(squares[start]));
    let king_locations = position.king_locations.slice();
    let castle_state = position.castle_state.slice();

    if (move.en_passant_capture !== null) {
        squares[move.en_passant_capture] = null;
    }
    /*Castling move*/
    if (move.rook_start !== null) {
        let rook = JSON.parse(JSON.stringify(squares[move.rook_start]));
        castle_state = [0, 0, 0, 0];
        squares[move.rook_start] = null;
        squares[move.rook_end] = rook;
        rook.has_moved = true;
    }
    /*Change King Location and Castling states*/
    if (piece.name === 'King') {
        if (piece.player === 'white') {
            king_locations[0] = end
            castle_state[0] = 0;
            castle_state[1] = 0;
        }
        else {
            king_locations[1] = end
            castle_state[2] = 0;
            castle_state[3] = 0;
        }
    }
    /* Change castling states for first rook moves */
    if (piece.name === 'Rook' && !piece.has_moved) {
        if (start === wk_rook) {
            castle_state[0] = 0;
        }
        else if (start === wq_rook) {
            castle_state[1] = 0;
        }
        else if (start === bk_rook) {
            castle_state[2] = 0;
        }
        else if (start === bq_rook) {
            castle_state[3] = 0;
        }
    }

    squares[start] = null;
    squares[end] = piece;

    piece.has_moved = true;

    (player === 'white') ? player = 'black' : player = 'white';

    return new Position(player, squares, king_locations, castle_state);
}

function get_king_locations(position) {
    /*White King Location & Black King location*/
    let wk_location = null;
    let bk_location = null;
    let squares = position.squares;

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
    let king_locations = {'white': wk_location, 'black': bk_location}
    return king_locations;
}

/* Breadth First Search.*/
function breadth_search(depth, positions) {
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
        return breadth_search(depth - 1, new_positions);
    }
}

export {Move, Position, make_move, get_king_locations, breadth_search}