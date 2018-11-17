import {King, Rook, Pawn, Knight, Bishop, Queen } from './Pieces.js';
import {Position } from './Game.js'

var piece_scores = { Pawn: 1, Knight: 3, Bishop: 3.3, Rook: 5, Queen: 9.5, King: 0 }

/* Turn FEN into chess position object */
function ParseFen(fen) {
    if (fen.length === 0) {
        return "FEN Error";
    }
    let squares = Array(64).fill(null);
    let player = null;
    let castle_state = [0,0,0,0];
    let en_passant_square = null;

	var rank = 0;
    var file = 0;
    var piece = 0;
    var count = 0;
    var i = 0;  
    var sq64 = 0;
    var fenCnt = 0; // fen[fenCnt]
	
	while ((rank <= 7) && fenCnt < fen.length) {
	    count = 1;
		switch (fen[fenCnt]) {
			case 'p': piece = new Pawn('black'); break;
            case 'r': piece = new Rook('black'); break;
            case 'n': piece = new Knight('black'); break;
            case 'b': piece = new Bishop('black'); break;
            case 'k': piece = new King('black'); break;
            case 'q': piece = new Queen('black'); break;
            case 'P': piece = new Pawn('white'); break;
            case 'R': piece = new Rook('white'); break;
            case 'N': piece = new Knight('white'); break;
            case 'B': piece = new Bishop('white'); break;
            case 'K': piece = new King('white'); break;
            case 'Q': piece = new Queen('white'); break;

            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                piece = null;
                count = fen[fenCnt].charCodeAt() - '0'.charCodeAt();
                break;
            
            case '/':
            case ' ':
                rank = rank + 1;
                file = 0;
                fenCnt = fenCnt + 1;
                continue;  
            default:
                return "FEN error";
        }
        for (i = 0; i < count; i++) {	
			sq64 = rank*8 + file;            
            squares[sq64] = piece;
			file++;
        }
		fenCnt++;
    } // while loop end
	
	//rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
	player = (fen[fenCnt] === 'w') ? 'white' : 'black';
    fenCnt += 2;
	
	for (i = 0; i < 4; i++) {
        if (fen[fenCnt] === ' ') {
            break;
        }		
		switch(fen[fenCnt]) {
			case 'K': castle_state[0] = 1 ; break;
			case 'Q': castle_state[1] = 1 ; break;
			case 'k': castle_state[2] = 1 ; break;
			case 'q': castle_state[3] = 1 ; break;
			default:	     break;
        }
		fenCnt++;
	}
    fenCnt++;	
	
	if (fen[fenCnt] !== '-') {        
		file = fen[fenCnt].charCodeAt() - 'a'.charCodeAt();
        rank = fen[fenCnt + 1].charCodeAt() - '1'.charCodeAt();	
        en_passant_square = coordinate_change((7-rank) * 8 + file);	
    }
    squares = engine_squares(squares);
    let king_locations = get_king_locations(squares);
    let material_balance = evaluate_material(squares);
    let position = new Position(player,squares,king_locations, castle_state,material_balance,en_passant_square);
    set_pawn_states(position);
    return position;
	
}

/* Add padding around board so moves don't wrap. Get king locations while looping. */
function engine_squares(squares) {
    let engine_squares = Array(120).fill(null);
    let count = 0;
    let index = 0;

    for (var i = 0; i < 12; i++) {
        for (var y = 0; y < 10; y++) {
            /*if boundary square*/
            index = i * 10 + y;
            if (y === 0 || y === 9 || i === 0 || i === 1 || i === 10 || i === 11) {
                engine_squares[index] = 'boundary';
            }
            else {
                engine_squares[index] = squares[count];
                count = count + 1;
            }
        }
    }
    return engine_squares
}
/* Turn padded board back into 64 Square board */
function normal_squares(engine_squares) {
    let squares = Array(64).fill(null);
    let count = 0;
    let index = 0;

    for (var i = 0; i < 12; i++) {
        for (var y = 0; y < 10; y++) {
            /*if boundary square*/
            index = i * 10 + y;
            if (y === 0 || y === 9 || i === 0 || i === 1 || i === 10 || i === 11) {
                //do nothing
            }
            else {
                squares[count] = engine_squares[index];
                count = count + 1;
            }
        }
    }
    return squares;
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

function inverse_coordinate_change(sq120) {
    let sq64 = sq120 - 17 - Math.floor(sq120/10)*2
    return sq64
}

function coordinate_change(sq64) {
    let sq120 = sq64 + 21 + Math.floor(sq64/8)*2
    return sq120
}

function set_pawn_states(position) {
    let squares = position.squares;
    for (var x = 0; x < squares.length; x++) {
        if (squares[x] !== 'boundary' && squares[x] !== null) {
            let piece = squares[x];
            if (piece.name === 'Pawn'){
                if (piece.player === 'white') {
                    if (x < 81) {
                        piece.has_moved = true;
                    }
                }
                else{
                    if (x > 38) {
                        piece.has_moved = true;
                    }
                }
            }
        }
    }
}

/*All evaluations with respect to white */
function evaluate_material(squares) {
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

function initialize_board() {
    var board = Array(64).fill(null)
    for (var k = 0; k < 8; k++) {
        board[k + 8] = new Pawn('black');
        board[k + 48] = new Pawn('white');
    };

    var color = 'black';
    for (var i = 0; i < 2; i++) {
        if (i === 1) {
            color = 'white'
        }
        board[i * 56] = new Rook(color);
        board[i * 56 + 7] = new Rook(color);
        board[i * 56 + 1] = new Knight(color);
        board[i * 56 + 6] = new Knight(color);
        board[i * 56 + 2] = new Bishop(color);
        board[i * 56 + 5] = new Bishop(color);
        board[i * 56 + 3] = new Queen(color);
        board[i * 56 + 4] = new King(color);
    }
    return board
}

function initialize_engine_board() {
    let board = initialize_board();
    let engine_board = engine_squares(board);
    return engine_board
}

export {ParseFen, coordinate_change, inverse_coordinate_change, get_king_locations, normal_squares, engine_squares, evaluate_material, initialize_board, initialize_engine_board}