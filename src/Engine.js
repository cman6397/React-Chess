function legal_moves(squares, player) {
    let boundary_squares = engine_squares(squares);
    var legal_boards = [];
    for (var i = 0; i < 120; i++) {
        /* Check for piece */
        if (boundary_squares[i] !== null && boundary_squares[i] !== 'boundary') {
            /* Check for piece color */
            if (boundary_squares[i].player === player){
                if (boundary_squares[i].name === 'Pawn') {
                    legal_boards = legal_boards.concat(pawn_moves(boundary_squares, i, player));
                }
            }
        }
    }
    return legal_boards;
}
/* Add padding around board so moves don't wrap */
function engine_squares(squares) {
    let engine_squares = Array(120).fill(null);
    let count = 0;
    let index = 0;
    for (var i = 0; i < 12; i++) {
        for (var y = 0; y<10; y++) {
            /*if boundary square*/
            index=i*10+y
            if (y === 0 || y === 9 || i === 0 || i === 1 || i === 10 || i === 11) {
                engine_squares[index] = 'boundary'
            }
            else {
                engine_squares[index] = squares[count];
                count = count + 1;
            }
        }
    }
    return engine_squares;
}

function is_legal(squares, legal_moves) {
    let boundary_squares = engine_squares(squares);
    let is_legal = false;
    for (var i = 0; i < legal_moves.length; i++) {
        if (squares_repr(legal_moves[i]) === squares_repr(boundary_squares)) {
            is_legal = true;
        }
    }
    return is_legal;
}

function pawn_moves(squares, location, player) {
    let legal_boards = []
    
    let pawn = squares[location];
    let forward_one = forward(1,location, player)
    let forward_two = forward(2, location, player)
    let left_one = left(1, location, player);
    let right_one = right(1, location, player);
    let diag_left = left(1,forward(1,location,player),player)
    let diag_right = right(1,forward(1,location,player),player)
    
    /*legal to move 2 spaces forward*/
    if (!pawn.has_moved && squares[forward_two] === null && squares[forward_one] === null) {
        legal_boards.push(make_move(pawn,location,forward_two,squares));
    }
    /*legal to move 1 space ahead*/
    if (squares[forward_one] === null) {
        legal_boards.push(make_move(pawn,location,forward_one,squares));
    }
    /*legal to take left*/
    if (squares[diag_left] !== null && squares[diag_left] !== 'boundary') {
        if (squares[diag_left].player !== player) {
            legal_boards.push(make_move(pawn, location, diag_left, squares));
        }
    }
    /*legal to take right*/
    if (squares[diag_right] !== null && squares[diag_right] !== 'boundary') {
        if (squares[diag_right].player !== player) {
            legal_boards.push(make_move(pawn, location, diag_right, squares));
        }
    }
    /*legal to take en passant right*/
    if (squares[right_one] !== null && squares[right_one] !== 'boundary') {
        if (squares[right_one].name === 'Pawn') {
            if (squares[right_one].player !== player && squares[right_one].just_moved_two) {
                legal_boards.push(en_passant(pawn, location, diag_right, right_one, squares));
            }
        }
    }
    /*legal to take en passant left*/
    if (squares[left_one] !== null && squares[left_one] !== 'boundary') {
        if (squares[left_one].name === 'Pawn') {
            if (squares[left_one].player !== player && squares[left_one].just_moved_two) {
                legal_boards.push(en_passant(pawn, location, diag_left, left_one, squares));
            }
        }
    }

    return legal_boards;
}

function make_move(piece, start, end, squares) {
    squares = squares.slice();
    squares[start] = null;
    squares[end] = piece;
    return squares;
}
function en_passant(piece, start, end, captured_location, squares) {
    squares = squares.slice();
    squares[start] = null;
    squares[end] = piece;
    squares[captured_location] = null;

    return squares;
}
 
function squares_repr(squares) {
    squares = squares.slice();
    for (var i = 0; i < legal_moves.length; i++) {
        if (squares[i] != null && squares[i] !== 'boundary') {
            squares[i] = squares[i].name;
        }
    }
    return squares.toString();
}

/* Abstact away difference between black and white moves. All from perspective of player. */
function forward(distance, location, player) {
    if (player === 'white') {
        return location - 10*distance;
    }
    else {
        return location + 10*distance;
    }
}
function back(distance, location, player) {
    if (player === 'white') {
        return location + 10*distance;
    }
    else {
        return location - 10*distance;
    }
}
function left(distance, location, player) {
    if (player === 'white') {
        return location - distance;
    }
    else {
        return location + distance;
    }
}
function right(distance, location, player) {
    if (player === 'white') {
        return location + distance;
    }
    else {
        return location - distance;
    }
}


export {legal_moves, is_legal}