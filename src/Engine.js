

class Position {
    constructor(player, squares, king_locations) {
        this.player = player;
        this.squares = squares;
        this.king_locations = king_locations;
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
    let king_locations = position.king_locations;

    let player = position.player;
    let squares = position.squares.slice();
    let piece = JSON.parse(JSON.stringify(squares[start]));

    squares[start] = null;
    squares[end] = piece;

    piece.has_moved = true;

    if (move.en_passant_capture !== null) {
        squares[move.en_passant_capture] = null;
    }
    if (move.rook_start !== null) {
        let rook = JSON.parse(JSON.stringify(squares[move.rook_start]));

        squares[move.rook_start] = null;
        squares[move.rook_end] = rook;
        rook.has_moved = true;
    }

    if (piece.name === 'King') {
        king_locations[player] = end;
    }

    (player === 'white') ? player = 'black' : player = 'white';

    return new Position(player, squares, king_locations);
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

export {Move, Position, make_move, get_king_locations}