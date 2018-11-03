function legal_moves(squares, player) {
    let [boundary_squares, white_king_location, black_king_location] = engine_squares(squares);

    var legal_boards = [];
    for (var i = 0; i < 120; i++) {
        /* Check for piece */
        if (boundary_squares[i] !== null && boundary_squares[i] !== 'boundary') {
            /* Check for piece color */
            if (boundary_squares[i].player === player){
                if (boundary_squares[i].name === 'Pawn') {
                    legal_boards = legal_boards.concat(pawn_moves(boundary_squares, i, player));
                }
                else if (boundary_squares[i].name === 'Knight') {
                    legal_boards = legal_boards.concat(knight_moves(boundary_squares, i, player));
                }
                else if (boundary_squares[i].name === 'Bishop') {
                    legal_boards = legal_boards.concat(bishop_moves(boundary_squares, i, player));
                }
                else if (boundary_squares[i].name === 'Rook') {
                    legal_boards = legal_boards.concat(rook_moves(boundary_squares, i, player));
                }
                else if (boundary_squares[i].name === 'Queen') {
                    legal_boards = legal_boards.concat(rook_moves(boundary_squares, i, player));
                    legal_boards = legal_boards.concat(bishop_moves(boundary_squares, i, player));
                }
                else if (boundary_squares[i].name === 'King') {
                    legal_boards = legal_boards.concat(king_moves(boundary_squares, i, player));
                }
            }
        }
    }
    return legal_boards;
}
/* Add padding around board so moves don't wrap. Get king locations while looping. */
function engine_squares(squares) {
    let engine_squares = Array(120).fill(null);
    let count = 0;
    let index = 0;
    let white_king_location = null;
    let black_king_location = null;

    for (var i = 0; i < 12; i++) {
        for (var y = 0; y<10; y++) {
            /*if boundary square*/
            index=i*10+y
            if (y === 0 || y === 9 || i === 0 || i === 1 || i === 10 || i === 11) {
                engine_squares[index] = 'boundary'
            }
            else {
                engine_squares[index] = squares[count];

                if (squares[count] !== null && squares[count].name === "King") {
                    if (squares[count].player === 'white') {
                        white_king_location = index;
                    }
                    else {
                        black_king_location = index;
                    }
                }
                count = count + 1;
            }
        }
    }
    return [engine_squares, white_king_location, black_king_location];
}

function is_legal(squares, legal_moves) {
    let boundary_squares = engine_squares(squares)[0];
    let is_legal = false;
    for (var i = 0; i < legal_moves.length; i++) {
        if (squares_repr(legal_moves[i]) === squares_repr(boundary_squares)) {
            is_legal = true;
        }
    }
    return is_legal;
}

function is_attacked(boundary_squares, square_location, player) {

    let is_attacked = false;
    let king_location = square_location;

    let up_right = right(1, forward(1, king_location, player), player);
    let up_left = left(1, forward(1, king_location, player), player);
    let down_right = right(1, back(1, king_location, player), player);
    let down_left = left(1, back(1, king_location, player), player);
    let up = forward(1, king_location, player);
    let down = back(1, king_location, player);
    let move_right = right(1, king_location, player);
    let move_left = left(1, king_location, player);

    let pawn_moves = [up_right, up_left];
    let knight_moves = get_knight_moves(king_location, player)

    while (boundary_squares[up_right] === null) {
        up_right = right(1, forward(1, up_right, player), player)
    }
    while (boundary_squares[up_left] === null) {
        up_left = left(1, forward(1, up_left, player), player)
    }
    while (boundary_squares[down_right] === null) {
        down_right = right(1, back(1, down_right, player), player)
    }
    while (boundary_squares[down_left] === null) {
        down_left = left(1, back(1, down_left, player), player)
    }
    while (boundary_squares[up] === null) {
        up = forward(1, up, player)
    }
    while (boundary_squares[down] === null) {
        down = back(1, down, player)
    }
    while (boundary_squares[move_right] === null) {
        move_right = right(1, move_right, player)
    }
    while (boundary_squares[move_left] === null) {
        move_left = left(1, move_left, player)
    }

    let diag_moves = [up_right, up_left, down_right, down_left];
    let straight_moves = [up, down, move_left, move_right];

    var i = 0;

    /* Check if square is under attack by diagonal pieces*/
    for (i = 0; i < diag_moves.length; i++) {
        let end_piece = boundary_squares[diag_moves[i]]
        if (end_piece !== 'boundary' && end_piece.player !== player && (end_piece.name === 'Queen' || end_piece.name === 'Bishop')) {
           is_attacked = true;
        }
    }
    /* Check if square is under attack by straight pieces*/
    for (i = 0; i < straight_moves.length; i++) {
        let end_piece = boundary_squares[straight_moves[i]]
        if (end_piece !== 'boundary' && end_piece.player !== player && (end_piece.name === 'Queen' || end_piece.name === 'Rook')) {
           is_attacked = true;
        }
    }
    /* Check if square is under attack by knights*/
    for (i = 0; i < knight_moves.length; i++) {
        let end_piece = boundary_squares[knight_moves[i]]
        if (end_piece !== 'boundary' && end_piece !== null){
            if(end_piece.player !== player && end_piece.name === 'Knight') {
                is_attacked = true;
            }
        }
    }
    /* Check if square is under attack by pawns*/
    for (i = 0; i < pawn_moves.length; i++) {
        let end_piece = boundary_squares[pawn_moves[i]]
        if (end_piece !== 'boundary' && end_piece !== null){
            if(end_piece.player !== player && end_piece.name === 'Pawn') {
                is_attacked = true;
            }
        }
    }

    return is_attacked;
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

function knight_moves(squares, location, player) {
    let legal_boards = []
    let knight = squares[location];

    let moves = get_knight_moves(location,player)

    for (var i = 0; i < moves.length; i++) {
        if (squares[moves[i]] === null && squares[moves[i]] !== 'boundary') {
            legal_boards.push(make_move(knight, location, moves[i], squares))
        }
        else if (squares[moves[i]].player !== player) {
            legal_boards.push(make_move(knight, location, moves[i], squares))
        }
    }
    
    return legal_boards;
}

function get_knight_moves(location,player) {
    
    let up_right = right(1, forward(2, location, player), player);
    let up_left = left(1, forward(2, location, player), player);
    let down_right = right(1, back(2, location, player), player);
    let down_left = left(1, back(2, location, player), player);
    let right_up = right(2, forward(1, location, player), player);
    let right_down = right(2, back(1, location, player), player);
    let left_up = left(2, forward(1, location, player), player);
    let left_down = left(2, back(1, location, player), player);

    let moves = [up_right, up_left, down_right, down_left, right_up, right_down, left_up, left_down];
    return moves;
}

function bishop_moves(squares, location, player) {
    let legal_boards = []

    let bishop = squares[location];
    let up_right = right(1, forward(1, location, player), player)
    let up_left = left(1, forward(1, location, player), player)
    let down_right = right(1, back(1, location, player), player)
    let down_left = left(1, back(1, location, player), player)

    while (squares[up_right] === null) {
        legal_boards.push(make_move(bishop, location, up_right, squares))
        up_right = right(1, forward(1, up_right, player), player)
    }
    while (squares[up_left] === null) {
        legal_boards.push(make_move(bishop, location, up_left, squares))
        up_left = left(1, forward(1, up_left, player), player)
    }
    while (squares[down_right] === null) {
        legal_boards.push(make_move(bishop, location, down_right, squares))
        down_right = right(1, back(1, down_right, player), player)
    }
    while (squares[down_left] === null) {
        legal_boards.push(make_move(bishop, location, down_left, squares))
        down_left = left(1, back(1, down_left, player), player)
    }

    /*Captures*/
    if (squares[up_right].player !== player) {
        legal_boards.push(make_move(bishop, location, up_right, squares))
    }
    if (squares[up_left].player !== player) {
        legal_boards.push(make_move(bishop, location, up_left, squares))
    }
    if (squares[down_right].player !== player) {
        legal_boards.push(make_move(bishop, location, down_right, squares))
    }
    if (squares[down_left].player !== player) {
        legal_boards.push(make_move(bishop, location, down_left, squares))
    }

    return legal_boards;
}

function rook_moves(squares, location, player) {
    let legal_boards = []

    let rook = squares[location];
    let up = forward(1, location, player)
    let down = back(1, location, player)
    let move_right = right(1, location, player)
    let move_left = left(1, location, player)

    while (squares[up] === null) {
        legal_boards.push(make_move(rook, location, up, squares))
        up = forward(1, up, player)
    }
    while (squares[down] === null) {
        legal_boards.push(make_move(rook, location, down, squares))
        down = back(1, down, player)
    }
    while (squares[move_right] === null) {
        legal_boards.push(make_move(rook, location, move_right, squares))
        move_right = right(1, move_right, player)
    }
    while (squares[move_left] === null) {
        legal_boards.push(make_move(rook, location, move_left, squares))
        move_left = left(1, move_left, player)
    }

    /*Captures*/
    if (squares[up].player !== player) {
        legal_boards.push(make_move(rook, location, up, squares))
    }
    if (squares[down].player !== player) {
        legal_boards.push(make_move(rook, location, down, squares))
    }
    if (squares[move_right].player !== player) {
        legal_boards.push(make_move(rook, location, move_right, squares))
    }
    if (squares[move_left].player !== player) {
        legal_boards.push(make_move(rook, location, move_left, squares))
    }

    return legal_boards;
}

function king_moves(squares, location, player) {
    let legal_boards = []

    let king = squares[location];
    let up = forward(1, location, player);
    let up_right = right(1, forward(1, location, player), player);
    let up_left = left(1, forward(1, location, player), player);
    let move_left = left(1, location, player);
    let move_right = right(1, location, player);
    let down_right = right(1, back(1, location, player), player);
    let down_left = left(1, back(1, location, player), player);
    let down = forward(1, location, player);

    let moves = [up, up_right, up_left, move_left, move_right, down_right, down_left, down]

    /* Regular Moves */
    for (var i = 0; i < moves.length; i++) {
        /* Move */
        if (squares[moves[i]] === null) {
            if (!is_attacked(squares,moves[i],player)) {
                legal_boards.push(make_move(king, location, moves[i], squares));
            }
        }
        /* Capture */
        else if (squares[moves[i]] !== 'boundary' && squares[moves[i]].player !== player && !is_attacked(squares,moves[i],player)) {
            legal_boards.push(make_move(king, location, moves[i], squares))
        }
    }

    /* Castling */
    let white_kingside_rook = 98;
    let white_queenside_rook = 91;
    let black_kingside_rook = 28;
    let black_queenside_rook = 21;
    let white_king_start = 95;
    let black_king_start = 25;

    if (!king.has_moved && !is_attacked(squares,location,player)) {
        /* White Kingside */
        if (location === white_king_start && !squares[white_kingside_rook].has_moved && squares[white_king_start + 1] === null && squares[white_king_start + 2] === null ) {
            if (!is_attacked(squares,white_king_start + 1,player) && !is_attacked(squares,white_king_start + 2,player)) {
                legal_boards.push(castle(king, white_king_start, white_king_start + 2, squares[white_kingside_rook], white_kingside_rook, white_kingside_rook-2, squares))
            }
        }
        /* Black Kingside */
        if (location === black_king_start && !squares[black_kingside_rook].has_moved && squares[black_king_start + 1] === null && squares[black_king_start + 2] === null) {
            if (!is_attacked(squares,black_king_start + 1,player) && !is_attacked(squares,black_king_start + 2,player)) {
                legal_boards.push(castle(king, black_king_start, black_king_start + 2, squares[black_kingside_rook], black_kingside_rook, black_kingside_rook - 2, squares))
            }
        }
        /* White Queenside */
        if (location === white_king_start && !squares[white_queenside_rook].has_moved && squares[white_king_start - 1] === null && squares[white_king_start - 2] === null && squares[white_king_start - 3] === null) {
            if (!is_attacked(squares,white_king_start - 1,player) && !is_attacked(squares,white_king_start - 2,player)) {
            legal_boards.push(castle(king, white_king_start, white_king_start - 2, squares[white_queenside_rook], white_queenside_rook, white_queenside_rook + 3, squares))
            }
        }
        /* Black Queenside */
        if (location === black_king_start && !squares[black_queenside_rook].has_moved && squares[black_king_start - 1] === null && squares[black_king_start - 2] === null && squares[black_king_start - 3] === null) {
            if (!is_attacked(squares,black_king_start - 1,player) && !is_attacked(squares,black_king_start - 2,player)) {
                legal_boards.push(castle(king, black_king_start, black_king_start - 2, squares[black_queenside_rook], black_queenside_rook, black_queenside_rook + 3, squares))
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

function castle(king, king_start, king_end, rook, rook_start, rook_end, squares) {
    squares = squares.slice();
    squares[king_start] = null;
    squares[rook_start] = null;
    squares[king_end] = king;
    squares[rook_end] = rook;

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