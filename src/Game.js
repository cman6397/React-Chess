import { legal_moves } from "./EngineMoves";


var piece_scores = { Pawn: 1, Knight: 3, Bishop: 3.3, Rook: 5, Queen: 9.5, King: 0 };

class Game {
    constructor(position, history, moves) {
        this.position = position;
        this.history = history;
        this.moves = moves; 
    }
    moves() {
        return legal_moves(this.position);
    }
    make_move(move) {
        const history = this.history.slice();
        const moves = this.moves.slice();
        let new_position = make_move(this.position, move);
        this.position = new_position;
        this.history = history.concat(new_position);
        this.moves = moves.concat(move);
    }
}

/* king locations = [white king, black king]
 * castle_state = [white kingside, white queenside, black kingside, black queenside] 1 for can castle 0 for cannot castle */
class Position {
    constructor(player, squares, king_locations, castle_state, material_balance, en_passant_square) {
        this.player = player;
        this.squares = squares;
        this.king_locations = king_locations;
        this.castle_state = castle_state;
        this.material_balance = material_balance;
        this.en_passant_square = en_passant_square;
    }
}

class Move {
    constructor(start,end, en_passant, rook_start, rook_end, promotion_piece) {
        this.start = start;
        this.end = end;
        this.en_passant_capture = en_passant;
        this.rook_start = rook_start;
        this.rook_end = rook_end;
        this.promotion_piece = promotion_piece;
    }
}

function make_move(position, move) {

    let start = move.start
    let end = move.end

    /*Starting Rook Locations */
    let wk_rook = 98;
    let wq_rook = 91;
    let bk_rook = 28;
    let bq_rook = 21;

    let player = position.player;

    let squares = position.squares.slice();
    let piece = JSON.parse(JSON.stringify(squares[start]));
    let king_locations = position.king_locations.slice();
    let castle_state = position.castle_state.slice();
    let material_balance = position.material_balance;
    let en_passant_square = null;

    if (move.en_passant_capture !== null) {
        squares[move.en_passant_capture] = null;
    }

    /* Pawn Just Moved Two */
    if (piece.name === 'Pawn' && Math.abs(start - end) === 20) {
        en_passant_square = start + (end - start) / 2;
    }

    /*Castling move*/
    if (move.rook_start !== null) {
        let rook = JSON.parse(JSON.stringify(squares[move.rook_start]));
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
    /* Change castling states for rook captures */
    if (squares[end] !== null && squares[end].name === 'Rook') {
        if (end === wk_rook) {
            castle_state[0] = 0;
        }
        else if (end === wq_rook) {
            castle_state[1] = 0;
        }
        else if (end === bk_rook) {
            castle_state[2] = 0;
        }
        else if (end === bq_rook) {
            castle_state[3] = 0;
        }
    }
    /*Change material Balance */
    if (material_balance !== null && squares[end] !== null) {
        if (position.player === 'white') {
            material_balance = material_balance + piece_scores[squares[end].name];
        }
        else {
            material_balance = material_balance - piece_scores[squares[end].name];
        }
    }

    /*Promotion */
    if (move.promotion_piece !== null) {
        piece = move.promotion_piece;
        if (piece.player === 'white') {
            material_balance = material_balance + piece_scores[piece.name] - 1;
        }
        else {
            material_balance = material_balance - piece_scores[piece.name] + 1;
        }
    }

    squares[start] = null;
    squares[end] = piece;
    piece.has_moved = true;

    (player === 'white') ? player = 'black' : player = 'white';

    return new Position(player, squares, king_locations, castle_state, material_balance, en_passant_square);
}

/*This move creation function turns dragged moves from the UI into move objects */
function create_move(start, end, position, promotion_piece) {
    let squares = position.squares;
    let piece = position.squares[start];
    let en_passant = null;
    let rook_start = null;
    let rook_end = null;

    /*For En passant*/
    if (piece.name === 'Pawn') {
        /* En Passant One way*/
        if (Math.abs(start - end) === 9 && squares[end] === null) {
            if (position.player === 'white') {
                en_passant = start + 1;
            }
            else {
                en_passant = start - 1;
            }

        }
        else if (Math.abs(start - end) === 11 && squares[end] === null) {
            if (position.player === 'white') {
                en_passant = start - 1;
            }
            else {
                en_passant = start + 1;
            }
        }
    }

    if (piece.name === 'King') {
        /* kingside */
        if ((end - start) === 2) {
            rook_start = end + 1
            rook_end = start + 1
        }
        else if ((start - end) === 2) {
            rook_start = end - 2
            rook_end = start - 1
        }
    }
    return new Move(start, end, en_passant, rook_start, rook_end, promotion_piece)
}

export {Move, Position, make_move, create_move, Game}