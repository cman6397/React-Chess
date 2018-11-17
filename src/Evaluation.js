import { Game } from './Game';
import { initialize_engine_board } from './BoardFunctions';
import { legal_moves } from './EngineMoves';
import { make_move, Position } from './Game';
import { is_attacked } from './EngineMoves'

var INFINITY = 10000;
var CHECKMATE = 9000;
var best_weights = { Pawn: 0, Knight: 0, Bishop: 0, Rook: 0, Queen: 0, King: 0};
var genetic_weights = null;
var learn_rate = 1;

function train() {
    let initial_position = new Position('white', initialize_engine_board(), [95, 25], [1, 1, 1, 1], 0);
    evolve_weights();
    let num_games = 50;
    let net_score = 0;
    learn_rate = 1; 

    for (var k = 0; k < num_games; k++) {
        /*Initialize Chess game and make two random moves to introduce variation*/
        let chess_game = new Game(initial_position, [initial_position], []);
        let moves = legal_moves(chess_game.position);
        let move = moves[Math.floor(Math.random() * moves.length)];
        chess_game.make_move(move);
        moves = legal_moves(chess_game.position);
        move = moves[Math.floor(Math.random() * moves.length)];
        chess_game.make_move(move);

        let game_result = play_game(chess_game)
        net_score = net_score + game_result.result;
    }
    console.log(net_score, best_weights, genetic_weights);
    if (net_score > 3) {
        learn_rate = learn_rate / 2;
        best_weights = genetic_weights
        evolve_weights();
    }
}

function evolve_weights() {
    let new_weights = {};
    /* add noise to best_weights */
    let max = 0; 
    for (var key in best_weights) {
        new_weights[key] = best_weights[key] + (Math.random()-0.5) * learn_rate;
        if (Math.abs(new_weights[key]) > max) {
            max = Math.abs(new_weights[key])
        }
    }
    /*Normalize new Weights*/
    for (key in new_weights) {
        new_weights[key] = new_weights[key] / max;
    }
    genetic_weights = new_weights;
}

function play_game(chess_game) {
    let alphabeta_result = null;
    let score = 0; 
    let result = 0;
    while (chess_game.history.length < 100) {
        if (chess_game.position.player === 'white') {
            alphabeta_result = alphabeta(chess_game.position, 1, -INFINITY, INFINITY, 'base');
        }
        else {
            alphabeta_result = alphabeta(chess_game.position, 1, -INFINITY, INFINITY, 'genetic');
        }
        score = alphabeta_result.value
        let move = alphabeta_result.move
        if (Math.abs(score) < 1000) {
            chess_game.make_move(move);
        }
        else {
            break;
        }
    }
    if (score === 9000) {
        result = -1
    }
    else if (score === -9000) {
        result = 1;
    }
    return { result: result, weights: genetic_weights };
}

function genetic_evaluation(position) {
    let squares = position.squares;
    let score = 0;
    for (var x = 0; x < squares.length; x++) {
        if (squares[x] !== 'boundary' && squares[x] !== null) {
            let piece = squares[x];
            if (piece.player === 'white') {
                score = score + genetic_weights[piece.name];
            }
            else {
                score = score - genetic_weights[piece.name];
            }
        }
    }
    return score;
}

function base_evaluation(position) {
    let squares = position.squares;
    let score = 0;
    for (var x = 0; x < squares.length; x++) {
        if (squares[x] !== 'boundary' && squares[x] !== null) {
            let piece = squares[x];
            if (piece.player === 'white') {
                score = score + best_weights[piece.name];
            }
            else {
                score = score - best_weights[piece.name];
            }
        }
    }
    return score;
}

function alphabeta(position, depth, alpha, beta, evaluation) {
    if (depth === 0) {
        if (evaluation === 'genetic') {
            return { value: genetic_evaluation(position), move: null };
        }
        else {
            return { value: base_evaluation(position), move: null };
        }
    }
    let moves = legal_moves(position);
    //Checkmate Stalemate
    if (moves.length === 0) {
        let in_check = false;
        if (!in_check) {
            return { value: 0, move: null };
        }
        else if (position.player === 'white') {
            in_check = is_attacked(position.squares, position.king_locations[0], position.player)[0];
            return { value: -CHECKMATE, move: null };
        }
        else {
            in_check = is_attacked(position.squares, position.king_locations[1], position.player)[0];
            return { value: CHECKMATE, move: null };
        }
    }
    if (position.player === 'white') {
        let value = -INFINITY;
        let top_move = null;
        for (var x = 0; x < moves.length; x++) {
            let current_move = moves[x];
            let current_position = make_move(position, current_move);
            value = Math.max(value, alphabeta(current_position, depth - 1, alpha, beta, evaluation).value);
            if (value > alpha) {
                alpha = value;
                top_move = current_move;
            }
            if (alpha >= beta) {
                break;
            }
        }
        return { value: value, move: top_move };
    }
    else {
        let value = INFINITY;
        let top_move = null;
        for (var k = 0; k < moves.length; k++) {
            let current_move = moves[k];
            let current_position = make_move(position, current_move);
            value = Math.min(value, alphabeta(current_position, depth - 1, alpha, beta, evaluation).value);
            if (value < beta) {
                beta = value;
                top_move = current_move;
            }
            if (alpha >= beta) {
                break;
            }
        }
        return { value: value, move: top_move };
    }
}

export {play_game, train}