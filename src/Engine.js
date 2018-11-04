import { legal_moves, is_legal, engine_squares, normal_squares } from './ChessMoves';

/* Engine Make move function for board */
function make_engine_move(squares64, move) {
    let start = move[0];
    let end = move[1];
    let piece = JSON.parse(JSON.stringify(move[2]));
    let squares = engine_squares(squares64)[0];

    squares[start] = null;
    squares[end] = piece;

    piece.has_moved = true;

    if ('en_passant' in move[3]){
        let taken_location = move[3]['en_passant'];
        squares[taken_location] = null;
    }
    else if ('castle' in move[3]){
        let rook_moves = move[3]['castle'];
        let rook = JSON.parse(JSON.stringify(rook_moves[2]));
        
        squares[rook_moves[0]] = null;
        squares[rook_moves[1]] = rook;
        rook.has_moved = true;
    }
    squares = normal_squares(squares);
    return squares;
}

export {make_engine_move}