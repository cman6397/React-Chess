/********************************************** Legal Move Generation and Checking for Engine*************************************/
import { Knight, Bishop, Rook, Queen } from './Pieces.js';
import { Move } from './Engine.js';

/* Return all legal moves given a board position and the player to move (white or black) */
function legal_moves(position) {
    let squares = position.squares;
    let player = position.player;
    let king_location = (player === 'white') ? position.king_locations[0] : position.king_locations[1];
    let pinned_pieces = get_pinned_pieces(squares, king_location, player);
    let castle_state = position.castle_state;

    let [attacking_pieces, attacked_squares] = king_check_squares(squares, king_location, player);

    /* Only King can move in double check */
    if (attacking_pieces.length > 1) {
        return king_moves(squares, king_location, player, castle_state);
    }
    var legal_moves = [];

    for (var i = 0; i < 120; i++) {
        /* Skip empty and boundary squares */
        if (squares[i] !== null && squares[i] !== 'boundary') {
            /* Check for piece color and send move generation to subfunctions*/
            if (squares[i].player === player) {
                if (squares[i].name === 'Pawn') {
                    legal_moves = legal_moves.concat(pawn_moves(squares, i, player, pinned_pieces));
                }
                else if (squares[i].name === 'Knight') {
                    legal_moves = legal_moves.concat(knight_moves(squares, i, player, pinned_pieces));
                }
                else if (squares[i].name === 'Bishop') {
                    legal_moves = legal_moves.concat(bishop_moves(squares, i, player, pinned_pieces));
                }
                else if (squares[i].name === 'Rook') {
                    legal_moves = legal_moves.concat(rook_moves(squares, i, player, pinned_pieces));
                }
                else if (squares[i].name === 'Queen') {
                    legal_moves = legal_moves.concat(rook_moves(squares, i, player, pinned_pieces));
                    legal_moves = legal_moves.concat(bishop_moves(squares, i, player, pinned_pieces));
                }
                else if (squares[i].name === 'King') {
                    legal_moves = legal_moves.concat(king_moves(squares, i, player, castle_state));
                }
            }
        }
    }

    if (attacking_pieces.length > 0) {
        legal_moves = in_check_handler(legal_moves, king_location, attacked_squares);
    }

    return legal_moves;
}


/* Check if a given move is within the legal moves found */
function is_legal(squares, legal_boards) {
    let is_legal = false;
    for (var i = 0; i < legal_boards.length; i++) {
        if (squares_repr(legal_boards[i][0]) === squares_repr(squares)) {
            is_legal = true;
        }
    }
    return is_legal;
}

/************************************************************ Piece Move Generation Functions ************************************************/

/* Get legal moves for a pawn given a board position */
function pawn_moves(squares, location, player, pinned_pieces) {
    let legal_boards = [];
    let pawn = squares[location];

    let forward_one = forward(1, location, player);
    let forward_two = forward(2, location, player);
    let left_one = left(1, location, player);
    let right_one = right(1, location, player);
    let diag_left = left(1, forward(1, location, player), player)
    let diag_right = right(1, forward(1, location, player), player)

    /*legal to move 2 spaces forward*/
    if (!pawn.has_moved && squares[forward_two] === null && squares[forward_one] === null) {
        legal_boards = legal_boards.concat(pinned_pawn_move(pawn, location, forward_two, pinned_pieces, [0, 1], squares, false, null));
    }
    /*legal to move 1 space ahead*/
    if (squares[forward_one] === null) {
        legal_boards = legal_boards.concat(pinned_pawn_move(pawn, location, forward_one, pinned_pieces, [0, 1], squares, false, null));
    }
    /*legal to take left*/
    if (squares[diag_left] !== null && squares[diag_left] !== 'boundary') {
        if (squares[diag_left].player !== player) {
            legal_boards = legal_boards.concat(pinned_pawn_move(pawn, location, diag_left, pinned_pieces, [-1, 1], squares, false, null));
        }
    }
    /*legal to take right*/
    if (squares[diag_right] !== null && squares[diag_right] !== 'boundary') {
        if (squares[diag_right].player !== player) {
            legal_boards = legal_boards.concat(pinned_pawn_move(pawn, location, diag_right, pinned_pieces, [1, 1], squares, false, null));
        }
    }
    /*legal to take en passant right*/
    if (squares[right_one] !== null && squares[right_one] !== 'boundary') {
        if (squares[right_one].name === 'Pawn') {
            if (squares[right_one].player !== player && squares[right_one].just_moved_two) {
                legal_boards = legal_boards.concat(pinned_pawn_move(pawn, location, diag_right, pinned_pieces, [1, 1], squares, true, right_one));
            }
        }
    }
    /*legal to take en passant left*/
    if (squares[left_one] !== null && squares[left_one] !== 'boundary') {
        if (squares[left_one].name === 'Pawn') {
            if (squares[left_one].player !== player && squares[left_one].just_moved_two) {
                legal_boards = legal_boards.concat(pinned_pawn_move(pawn, location, diag_left, pinned_pieces, [-1, 1], squares, true, left_one));
            }
        }
    }

    return legal_boards;
}

/* Get legal moves for a knight given a board position */
function knight_moves(squares, location, player, pinned_pieces) {
    let legal_boards = [];
    /*Impossible to move pinned knight*/
    if (location in pinned_pieces) {
        return legal_boards;
    }
    let knight = squares[location];

    let moves = get_knight_moves(location, player);

    for (var i = 0; i < moves.length; i++) {
        if (squares[moves[i]] === null && squares[moves[i]] !== 'boundary') {
            legal_boards.push(make_move(knight, location, moves[i], squares));
        }
        else if (squares[moves[i]].player !== player && squares[moves[i]] !== 'boundary') {
            legal_boards.push(make_move(knight, location, moves[i], squares));
        }
    }

    return legal_boards;
}

/* Get legal moves for bishop given board position */
function bishop_moves(squares, location, player, pinned_pieces) {
    let legal_boards = [];
    let bishop = squares[location];
    let pin_direction = null;
    let inverse_direction = null;

    let moves = [[1, 1], [-1, 1], [1, -1], [-1, -1]]

    for (var i = 0; i < moves.length; i++) {
        if (location in pinned_pieces) {
            pin_direction = pinned_pieces[location];
            inverse_direction = [pin_direction[0] * -1, pin_direction[1] * -1];
            if (moves[i].toString() === pin_direction.toString() || moves[i].toString() === inverse_direction.toString()) {
                legal_boards = legal_boards.concat(moves_and_captures(squares, moves[i], location, player, bishop));
            }
        }
        else {
            legal_boards = legal_boards.concat(moves_and_captures(squares, moves[i], location, player, bishop));
        }
    }
    return legal_boards;
}
/* Get legal moves for a rook given a board position*/
function rook_moves(squares, location, player, pinned_pieces) {
    let legal_boards = [];
    let rook = squares[location];
    let pin_direction = null;
    let inverse_direction = null;

    let moves = [[0, 1], [0, -1], [-1, 0], [1, 0]]

    for (var i = 0; i < moves.length; i++) {
        if (location in pinned_pieces) {
            pin_direction = pinned_pieces[location];
            inverse_direction = [pin_direction[0] * -1, pin_direction[1] * -1];
            if (moves[i].toString() === pin_direction.toString() || moves[i].toString() === inverse_direction.toString()) {
                legal_boards = legal_boards.concat(moves_and_captures(squares, moves[i], location, player, rook));
            }
        }
        else {
            legal_boards = legal_boards.concat(moves_and_captures(squares, moves[i], location, player, rook));
        }
    }
    return legal_boards;
}
/* Get legal moves for a king given a board position */
function king_moves(squares, location, player, castle_state) {
    let legal_boards = [];

    let king = squares[location];

    /* Take King off the board for calculating normal move attacking squares */
    let king_squares = squares.slice();
    king_squares[location] = null;

    let moves = get_king_moves(location, player);

    /* Regular Moves (non castling) */
    for (var i = 0; i < moves.length; i++) {
        /* Move to empty square */
        if (squares[moves[i]] === null) {
            if (!is_attacked(king_squares, moves[i], player)[0]) {
                legal_boards.push(make_move(king, location, moves[i], squares));
            }
        }
        /* Capture */
        else if (squares[moves[i]] !== 'boundary' && squares[moves[i]].player !== player && !is_attacked(king_squares, moves[i], player)[0]) {
            legal_boards.push(make_move(king, location, moves[i], squares));
        }
    }

    /* Castling */
    let white_kingside_rook = 98;
    let white_queenside_rook = 91;
    let black_kingside_rook = 28;
    let black_queenside_rook = 21;
    let white_king_start = 95;
    let black_king_start = 25;


    /* White Kingside */
    if (castle_state[0] === 1 && squares[white_king_start + 1] === null && squares[white_king_start + 2] === null) {
        if (!is_attacked(squares, white_king_start + 1, player)[0] && !is_attacked(squares, white_king_start + 2, player)[0]) {
            legal_boards.push(castle(king, white_king_start, white_king_start + 2, squares[white_kingside_rook], white_kingside_rook, white_kingside_rook - 2, squares));
        }
    }
    /* White Queenside */
    if (castle_state[1] === 1 && squares[white_king_start - 1] === null && squares[white_king_start - 2] === null && squares[white_king_start - 3] === null) {
        if (!is_attacked(squares, white_king_start - 1, player)[0] && !is_attacked(squares, white_king_start - 2, player)[0]) {
            legal_boards.push(castle(king, white_king_start, white_king_start - 2, squares[white_queenside_rook], white_queenside_rook, white_queenside_rook + 3, squares));
        }
    }
    /* Black Kingside */
    if (castle_state[2] === 1 && squares[black_king_start + 1] === null && squares[black_king_start + 2] === null) {
        if (!is_attacked(squares, black_king_start + 1, player)[0] && !is_attacked(squares, black_king_start + 2, player)[0]) {
            legal_boards.push(castle(king, black_king_start, black_king_start + 2, squares[black_kingside_rook], black_kingside_rook, black_kingside_rook - 2, squares));
        }
    }
    /* Black Queenside */
    if (castle_state[3] === 1 && squares[black_king_start - 1] === null && squares[black_king_start - 2] === null && squares[black_king_start - 3] === null) {
        if (!is_attacked(squares, black_king_start - 1, player)[0] && !is_attacked(squares, black_king_start - 2, player)[0]) {
            legal_boards.push(castle(king, black_king_start, black_king_start - 2, squares[black_queenside_rook], black_queenside_rook, black_queenside_rook + 3, squares));
        }
    }

    return legal_boards;
}

/************************************************************* Pinned Pieces and King Checks *******************************************************************/

/* Eliminate moves where king is still in check from originally checking piece.  Only for in check positions.*/
function in_check_handler(legal_moves, king_location, attacked_squares) {
    for (var i = legal_moves.length - 1; i >= 0; i--) {
        let current_move = legal_moves[i];
        /* If king was not moved out of check and the piece the moved piece did not block the check or eliminate the checking piece than remove the move */
        if (!attacked_squares.includes(current_move.end) && !attacked_squares.includes(current_move.en_passant) && current_move.start !== king_location) {
            legal_moves.splice(i, 1);
        }
    }
    return legal_moves;
}

/* Check if square is under attack from a specified direction */
function direction_is_attacked(squares, move_direction, start_location, player, piece_types) {
    let end_location = direction(move_direction, start_location, player);
    let attacking_piece = null;

    while (squares[end_location] === null) {
        end_location = direction(move_direction, end_location, player);
    }
    let end_piece = squares[end_location];
    if (end_piece !== 'boundary' && end_piece.player !== player) {
        for (var i = 0; i < piece_types.length; i++) {
            if (piece_types[i] === end_piece.name) {
                attacking_piece = [end_location, move_direction];
            }
        }
    }
    return attacking_piece;
}
/* king_check squares returns a set of squares which a player's piece must end up in to block the check or remove the checking piece */
function king_check_squares(squares, king_location, player) {

    let attacking_pieces = [];
    let checked_squares = [];

    let up_right = right(1, forward(1, king_location, player), player);
    let up_left = left(1, forward(1, king_location, player), player);

    let pawn_moves = [up_right, up_left];
    let knight_moves = get_knight_moves(king_location, player);
    let diag_directions = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
    let straight_directions = [[0, 1], [0, -1], [-1, 0], [1, 0]];

    /* get bishop/queen attack squares */
    for (var i = 0; i < diag_directions.length; i++) {
        let [attack_squares, attack_piece] = attacked_squares(squares, diag_directions[i], king_location, player, ['Queen', 'Bishop']);
        if (attack_piece !== null) {
            checked_squares = checked_squares.concat(attack_squares);
            attacking_pieces.push(attack_piece);
        }
    }
    /* Check for rook/queen attacks */
    for (i = 0; i < straight_directions.length; i++) {
        let [attack_squares, attack_piece] = attacked_squares(squares, straight_directions[i], king_location, player, ['Queen', 'Rook']);
        if (attack_piece !== null) {
            checked_squares = checked_squares.concat(attack_squares);
            attacking_pieces.push(attack_piece);
        }
    }

    /* Check if square is under attack by knights*/
    for (i = 0; i < knight_moves.length; i++) {
        let end_piece = squares[knight_moves[i]];
        if (end_piece !== 'boundary' && end_piece !== null) {
            if (end_piece.player !== player && end_piece.name === 'Knight') {
                checked_squares = checked_squares.concat([knight_moves[i]]);
                attacking_pieces.push(end_piece);
            }
        }
    }
    /* Check if square is under attack by pawns*/
    for (i = 0; i < pawn_moves.length; i++) {
        let end_piece = squares[pawn_moves[i]];
        if (end_piece !== 'boundary' && end_piece !== null) {
            if (end_piece.player !== player && end_piece.name === 'Pawn') {
                checked_squares = checked_squares.concat([pawn_moves[i]]);
                attacking_pieces.push(end_piece);
            }
        }
    }

    return [attacking_pieces, checked_squares];
}

/* Return the squares that are under attack and the piece that is attacking*/
function attacked_squares(squares, move_direction, start_location, player, piece_types) {
    let end_location = direction(move_direction, start_location, player);
    let attacked_squares = [end_location];

    while (squares[end_location] === null) {
        end_location = direction(move_direction, end_location, player);
        attacked_squares.push(end_location);
    }
    let end_piece = squares[end_location];
    if (end_piece !== 'boundary' && end_piece.player !== player) {
        for (var i = 0; i < piece_types.length; i++) {
            if (piece_types[i] === end_piece.name) {
                attacked_squares.push(end_location);
                return [attacked_squares, end_piece];
            }
        }
    }
    return [null, null];
}

/* Check if square is under attack by opposing pieces */
function is_attacked(boundary_squares, square_location, player) {

    let is_attacked = false;
    let attacking_pieces = {};
    let attacking_piece = null;

    let up_right = right(1, forward(1, square_location, player), player);
    let up_left = left(1, forward(1, square_location, player), player);

    let pawn_moves = [up_right, up_left];
    let knight_moves = get_knight_moves(square_location, player);
    let king_moves = get_king_moves(square_location, player);
    let diag_directions = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
    let straight_directions = [[0, 1], [0, -1], [-1, 0], [1, 0]];

    /* check for bishop/queen attacks */
    for (var i = 0; i < diag_directions.length; i++) {
        attacking_piece = direction_is_attacked(boundary_squares, diag_directions[i], square_location, player, ['Queen', 'Bishop']);
        if (attacking_piece !== null) {
            is_attacked = true;
            attacking_pieces[attacking_piece[0]] = attacking_piece[1];
        }
    }
    /* Check for rook/queen attacks */
    for (i = 0; i < straight_directions.length; i++) {
        attacking_piece = direction_is_attacked(boundary_squares, straight_directions[i], square_location, player, ['Queen', 'Rook']);
        if (attacking_piece !== null) {
            is_attacked = true;
            attacking_pieces[attacking_piece[0]] = attacking_piece[1];
        }
    }

    /* Check if square is under attack by knights*/
    for (i = 0; i < knight_moves.length; i++) {
        let end_piece = boundary_squares[knight_moves[i]];
        if (end_piece !== 'boundary' && end_piece !== null) {
            if (end_piece.player !== player && end_piece.name === 'Knight') {
                is_attacked = true;
                attacking_pieces[knight_moves[i]] = 'knight_attack';
            }
        }
    }
    /* Check if square is under attack by pawns*/
    for (i = 0; i < pawn_moves.length; i++) {
        let end_piece = boundary_squares[pawn_moves[i]];
        if (end_piece !== 'boundary' && end_piece !== null) {
            if (end_piece.player !== player && end_piece.name === 'Pawn') {
                is_attacked = true;
                attacking_pieces[pawn_moves[i]] = 'pawn_attack';
            }
        }
    }

    /* Check if square is under attack by king. */
    for (i = 0; i < king_moves.length; i++) {
        let end_piece = boundary_squares[king_moves[i]];
        if (end_piece !== 'boundary' && end_piece !== null) {
            if (end_piece.player !== player && end_piece.name === 'King') {
                is_attacked = true;
            }
        }
    }

    return [is_attacked, attacking_pieces];
}

/* Get pieces which are pinned to the king */
function get_pinned_pieces(boundary_squares, king_location, player) {
    let pinned_pieces = {};
    let pin_info = null;
    let pinned_directions = [[0, 1], [0, -1], [-1, 0], [1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]];
    let pin_direction = null;

    for (var x = 0; x < pinned_directions.length; x++) {
        pin_direction = pinned_directions[x];
        if (pin_direction[0] === 0 || pin_direction[1] === 0) {
            pin_info = get_pinned_piece(boundary_squares, pin_direction, king_location, player, ['Queen', 'Rook']);
        }
        else {
            pin_info = get_pinned_piece(boundary_squares, pin_direction, king_location, player, ['Queen', 'Bishop']);
        }
        if (pin_info !== null) {
            pinned_pieces[pin_info[0]] = pin_info[1];
        }
    }
    return pinned_pieces;
}
/* Check for a pinned piece given an attacking direction towards the king */
function get_pinned_piece(boundary_squares, pin_direction, king_location, player, piece_types) {
    let pin_location = direction(pin_direction, king_location, player);
    let pinned_piece = null;
    /* Go until you run into a piece or boundary */
    while (boundary_squares[pin_location] === null) {
        pin_location = direction(pin_direction, pin_location, player);
    }

    /* If you run into same player piece, go until you run into the next piece or boundary */
    if (boundary_squares[pin_location] !== 'boundary' && boundary_squares[pin_location].player === player) {
        pinned_piece = pin_location;
        pin_location = direction(pin_direction, pin_location, player);
        while (boundary_squares[pin_location] === null) {
            pin_location = direction(pin_direction, pin_location, player);
        }
        /* Check if piece on the other end is a piece type associated with a pin */
        if (boundary_squares[pin_location] !== 'boundary' && boundary_squares[pin_location].player !== player) {
            for (var i = 0; i < piece_types.length; i++) {
                if (boundary_squares[pin_location].name === piece_types[i]) {
                    return [pinned_piece, pin_direction];
                }
            }
        }
    }
    return null;
}
/****************************************************** Move Checking/Exploring and Board Navigating Helper Functions *********************************************************/

/* Given a possible pawn move check if the move is legal and add the move */
function pinned_pawn_move(pawn, pawn_location, pawn_end_location, pinned_pieces, move_direction, squares, is_en_passant, en_passant_capture) {
    let legal_boards = [];
    let pin_direction = null;
    let inverse_direction = null;

    if (pawn_location in pinned_pieces) {
        pin_direction = pinned_pieces[pawn_location];
        inverse_direction = [pin_direction[0] * -1, pin_direction[1] * -1];

        /* Can only move towards King or away from king when pinned */
        if (move_direction.toString() === pin_direction.toString() || move_direction.toString() === inverse_direction.toString()) {
            if (is_en_passant) {
                legal_boards.push(en_passant(pawn, pawn_location, pawn_end_location, en_passant_capture, squares));
            }
            else {
                legal_boards.push(make_move(pawn, pawn_location, pawn_end_location, squares));
            }
        }
    }
    else {
        if (is_en_passant) {
            legal_boards.push(en_passant(pawn, pawn_location, pawn_end_location, en_passant_capture, squares));
        }
        else {
            /*Handle Promotions*/
            if (pawn_end_location >= 91 || pawn_end_location <= 28) {
                let knight_piece = new Knight(pawn.player);
                let bishop_piece = new Bishop(pawn.player);
                let rook_piece = new Rook(pawn.player);
                let queen_piece = new Queen(pawn.player);

                let pieces = [knight_piece, bishop_piece, rook_piece, queen_piece];

                for (var k = 0; k < pieces.length; k++) {
                    legal_boards.push(make_move(pieces[k], pawn_location, pawn_end_location, squares));
                }
            }
            else {
                legal_boards.push(make_move(pawn, pawn_location, pawn_end_location, squares));
            }
        }
    }
    return legal_boards;
}

/* Get possible moves and captures for rooks, queens, and bishops (straight pieces) with respect to direction */
function moves_and_captures(squares, move_direction, start_location, player, piece) {
    let legal_boards = [];
    let end_location = direction(move_direction, start_location, player);

    while (squares[end_location] === null) {
        legal_boards.push(make_move(piece, start_location, end_location, squares));
        end_location = direction(move_direction, end_location, player);
    }
    if (squares[end_location] !== 'boundary' && squares[end_location].player !== player) {
        legal_boards.push(make_move(piece, start_location, end_location, squares));
    }
    return legal_boards;
}
/* Get Knight move directions */
function get_knight_moves(location, player) {

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
/* Get King move directions */
function get_king_moves(location, player) {

    let up = forward(1, location, player);
    let up_right = right(1, forward(1, location, player), player);
    let up_left = left(1, forward(1, location, player), player);
    let move_left = left(1, location, player);
    let move_right = right(1, location, player);
    let down_right = right(1, back(1, location, player), player);
    let down_left = left(1, back(1, location, player), player);
    let down = back(1, location, player);

    let moves = [up, up_right, up_left, move_left, move_right, down_right, down_left, down];
    return moves;
}

/* Standard move making.  Set start square to null and end square to piece value */
function make_move(piece, start, end, squares) {
    squares = squares.slice();
    squares[start] = null;
    squares[end] = piece;

    let move = new Move(start, end, null, null, null)
    return move;
}
/* Castling Requires special move making */
function castle(king, king_start, king_end, rook, rook_start, rook_end, squares) {
    squares = squares.slice();
    squares[king_start] = null;
    squares[rook_start] = null;
    squares[king_end] = king;
    squares[rook_end] = rook;

    let move = new Move(king_start, king_end, null, rook_start, rook_end);
    return move;
}
/* En Passant requires special move making */
function en_passant(piece, start, end, captured_location, squares) {
    squares = squares.slice();
    squares[start] = null;
    squares[end] = piece;
    squares[captured_location] = null;

    let move = new Move(start, end, captured_location, null, null);
    return move;
}

/* Abstact away difference between black and white moves. All from perspective of player. */
function direction(directions, location, player) {
    let x = directions[0];
    let y = directions[1];

    let up_right = right(1, forward(1, location, player), player);
    let up_left = left(1, forward(1, location, player), player);
    let down_right = right(1, back(1, location, player), player);
    let down_left = left(1, back(1, location, player), player);
    let up = forward(1, location, player);
    let down = back(1, location, player);
    let move_right = right(1, location, player);
    let move_left = left(1, location, player);

    if (x === 0 && y === 1) {
        return up;
    }
    else if (x === -1 && y === 1) {
        return up_left;
    }
    else if (x === 1 && y === 1) {
        return up_right;
    }
    else if (x === 1 && y === 0) {
        return move_right;
    }
    else if (x === -1 && y === 0) {
        return move_left;
    }
    else if (x === 1 && y === -1) {
        return down_right;
    }
    else if (x === -1 && y === -1) {
        return down_left;
    }
    else if (x === 0 && y === -1) {
        return down;
    }
}

function forward(distance, location, player) {
    if (player === 'white') {
        return location - 10 * distance;
    }
    else {
        return location + 10 * distance;
    }
}
function back(distance, location, player) {
    if (player === 'white') {
        return location + 10 * distance;
    }
    else {
        return location - 10 * distance;
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

/******************************************************** Board Representation Functions  **********************************************/

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

/* Represent board as a string for comparisons */
function squares_repr(squares) {
    let squares_rep = squares.slice();
    for (var i = 0; i < squares_rep.length; i++) {
        if (squares_rep[i] != null && squares_rep[i] !== 'boundary') {
            squares_rep[i] = squares_rep[i].name + squares_rep[i].player;
        }
    }
    return squares_rep.toString();
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

export { legal_moves, is_legal, engine_squares, normal_squares , get_king_locations}
