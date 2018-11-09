
import { legal_moves } from './EngineMoves';

var piece_scores = { Pawn: 1, Knight: 3, Bishop: 3.3, Rook: 5, Queen: 9.5, King: 0 }

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
    let wk_rook = 96;
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
    }

    squares[start] = null;
    squares[end] = piece;
    piece.has_moved = true;

    (player === 'white') ? player = 'black' : player = 'white';

    return new Position(player, squares, king_locations, castle_state, material_balance, en_passant_square);
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
                let next_position = make_move(current_position, current_move)
                new_positions.push(next_position);
            }
        }
        return breadth_search(depth - 1, new_positions);
    }
}

function alphabeta_search(position, depth, alpha, beta, move) {
    if (depth === 0) {
        return { value: position.material_balance, move: null};
    }
    let moves = legal_moves(position);
    //Checkmate
    if (moves.length === 0) {
        if (position.player === 'white') {
            return {value: -1000, move: null};
        }
        else {
            return {value: 1000, move: null};
        }
    }
    if (position.player === 'white') {
        let value = -10000;
        let best_move = move;
        for (var x = 0; x < moves.length; x ++) {
            let current_move = moves[x];
            let current_position = make_move(position, current_move);
            value = Math.max(value, alphabeta_search(current_position, depth - 1, alpha, beta, current_move).value);
            if (value > alpha) {
                alpha = value;
                best_move = current_move;
            }
            if (alpha >= beta) {
                break;
            }
        }
        return {value: value, move:best_move};
    }
    else {
        let value = 10000;
        let best_move = move;
        for (var k = 0; k < moves.length; k ++) {
            let current_move = moves[k];
            let current_position = make_move(position, current_move);
            value = Math.min(value, alphabeta_search(current_position, depth-1, alpha, beta, current_move).value);
            if (value < beta) {
                beta = value;
                best_move = current_move;
            }
            if (alpha >= beta) {
                break;
            }
        }
        return {value: value, move: best_move};
    }
}


/*All evaluations with respect to white */
function evaluate_position(position) {
    let squares = position.squares;
    let sum_material = 0
    for (var x = 0; x < squares.length; x ++) {
        if (squares[x] !== 'boundary' && squares[x] !== null) {
            if (squares[x].player === 'white') {
                sum_material = sum_material + piece_scores[squares[x].name];
            }
            else {
                sum_material = sum_material - piece_scores[squares[x].name];
            }
        }
    }

    return (sum_material)
}


export {Move, Position, make_move, evaluate_position, breadth_search, alphabeta_search}