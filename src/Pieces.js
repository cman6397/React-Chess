import { engine_squares } from './ChessMoves';

class Piece {
  constructor(player, img_url, name){
    this.player = player;
    this.style = {backgroundImage: "url('"+img_url+"')"};
    this.name = name;
    this.url = img_url;
    this.has_moved = false;
  }
}

class Pawn extends Piece {
  constructor(player){
    var url='https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg'
    if (player === 'black') {
        url = 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg'
    }
    super(player, url, 'Pawn');
    this.just_moved_two = false;
  }
}

class Rook extends Piece {
    constructor(player) {
        var url = 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg'
        if (player === 'black') {
            url = 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg'
        }
        super(player, url, 'Rook');
    }
}

class Knight extends Piece {
    constructor(player) {
        var url = 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg'
        if (player === 'black') {
            url = 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg'
        }
        super(player, url, 'Knight')
    }
}

class Bishop extends Piece {
    constructor(player) {
        var url = 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg'
        if (player === 'black') {
            url = 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg'
        }
        super(player, url, 'Bishop')
    }
}

class Queen extends Piece {
    constructor(player) {
        var url = 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg'
        if (player === 'black') {
            url = 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg'
        }
        super(player, url, 'Queen')
    }
}

class King extends Piece {
    constructor(player) {
        var url = 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg'
        if (player === 'black') {
            url = 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg'
        }
        super(player, url, 'King')
    }
}
/*This move generation function is for the UI and it interprets the mouse moves not egine moves */
function make_move(start, end, squares, piece) {

    /*For En passant*/
    if (piece.name === 'Pawn') {
        if (Math.abs(start - end) === 16) {
            piece.just_moved_two = true;
				}
        else {
            piece.just_moved_two = false;
            /* En Passant.  Remove pawn to the direct left or right when en passant criteria is satisfied.*/
            if (Math.abs(start - end) === 7 && squares[end] === null) {
                if (piece.player === 'white') {
                    squares[start + 1] = null;
                }
                else {
                    squares[start - 1] = null;
                }
            }
            else if (Math.abs(start - end) === 9 && squares[end] === null) {
                if (piece.player === 'white') {
                    squares[start - 1] = null;
                }
                else {
                    squares[start + 1] = null;
                }
            }
        }
    }
    /* For Castling */
    if (piece.name === 'King') {
        /* kingside */
        if ((end - start) === 2) {
            squares[start + 1] = squares[end + 1];
            squares[end + 1] = null
        }
        else if ((start - end) === 2) {
            squares[start - 1] = squares[end - 2];
            squares[end - 2] = null
        }
    }
    squares[start] = null;
    squares[end] = piece;
    piece.has_moved = true;
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
    let engine_board = engine_squares(board)[0];
    return engine_board
}

export {Pawn,Rook,Knight,Bishop,King,Queen, initialize_board, initialize_engine_board, make_move}