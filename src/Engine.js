import { engine_squares, normal_squares } from './ChessMoves';

class Game {
    constructor(player, squares) {
        this.player = player;
        this.squares = squares;
        this.king_locations = null;

        /*
        Additional properties to move to game state
        this.castling_state = castling_state;
        this.en_passant_targets = en_passant_targets;
        this.en_passant_targets = en_passant_targets;
        this.attacked_squares = null;
        this.pinned_pieces = null;
        this.pinning_pieces = null;
        */
    }

    set_king_locations() {
        /*White King Location & Black King location*/
        let wk_location = null;
        let bk_location = null;
        let squares = this.squares;

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
        this.king_locations = {'white': wk_location, 'black': bk_location};
    }

    make_move(move) {
        let start = move[0];
        let end = move[1];
        let piece = JSON.parse(JSON.stringify(move[2]));
        let squares = this.squares;

        console.log(squares[start])
        squares[start] = null;
        squares[end] = piece;

        piece.has_moved = true;

        if ('en_passant' in move[3]) {
            let taken_location = move[3]['en_passant'];
            squares[taken_location] = null;
        }
        else if ('castle' in move[3]) {
            let rook_moves = move[3]['castle'];
            let rook = JSON.parse(JSON.stringify(rook_moves[2]));

            squares[rook_moves[0]] = null;
            squares[rook_moves[1]] = rook;
            rook.has_moved = true;
        }

        if (piece.name === 'King') {
            this.king_locations[this.player] = end;
        }
 
        (this.player === 'white') ? this.player = 'black' : this.player = 'white';
        return squares;
    }

    /*
    set_castle_state() {
        this.castling_state = {wk:1, wq:1, bk: 1, bq: 1};
    }
    set_attacked_squares() {
        Think about how to update attacked squares.  
        this.attacked_squares = {w:attacked_squares,b:attacked_squares};
    }
    */
}


/* Engine Make move function for React board */
function make_engine_move_react(squares64, move) {
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

/* Engine Make move function for Engine*/
function make_engine_move(squares120, move) {
    let start = move[0];
    let end = move[1];
    let piece = JSON.parse(JSON.stringify(move[2]));
    let squares = squares120;

    squares[start] = null;
    squares[end] = piece;

    piece.has_moved = true;

    if ('en_passant' in move[3]) {
        let taken_location = move[3]['en_passant'];
        squares[taken_location] = null;
    }
    else if ('castle' in move[3]) {
        let rook_moves = move[3]['castle'];
        let rook = JSON.parse(JSON.stringify(rook_moves[2]));

        squares[rook_moves[0]] = null;
        squares[rook_moves[1]] = rook;
        rook.has_moved = true;
    }
    return squares;
}



export {Game, make_engine_move_react, make_engine_move}