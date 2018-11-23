import { legal_moves } from './EngineMoves';
import { make_move } from './Game';

var INFINITY = 10000;
var CHECKMATE = 9000;

var start_time = null;
//var best_moves = {};
var time_limit = null;
var depth_searched = null;
var time_cutoff = false;

function set_variables(max_time) {
    start_time = performance.now();
    //best_moves = {};
    time_limit = max_time;
    depth_searched = 0;
    time_cutoff = false;
}

function alphabeta(position, depth, alpha, beta) {
    if (depth === 0) {
        return { value: position.material_balance, move: null};
    }
    let moves = legal_moves(position);
    //Checkmate
    if (moves.length === 0) {
        if (position.player === 'white') {
            return {value: -CHECKMATE, move: null};
        }
        else {
            return {value: CHECKMATE, move: null};
        }
    }
    if (time_cutoff) {
        return {value: 0, move: null};
    }

    if (position.player === 'white') {
        let value = -INFINITY;
        let top_move = null;
        for (var x = 0; x < moves.length; x ++) {
            let current_move = moves[x];
            let current_position = make_move(position, current_move);
            value = Math.max(value, alphabeta(current_position, depth - 1, alpha, beta).value);
            if (value > alpha) {
                alpha = value;
                //best_moves[] = best_moves[depth].concat(current_move);
                top_move = current_move;
            }
            if (alpha >= beta) {
                break;
            }
        }
        if ((performance.now() - start_time) >= time_limit ) {
            time_cutoff = true;
            return {value:0,move:null};
        }
        return {value: value, move:top_move};
    }
    else {
        let value = INFINITY;
        let top_move = null;
        for (var k = 0; k < moves.length; k ++) {
            let current_move = moves[k];
            let current_position = make_move(position, current_move);
            value = Math.min(value, alphabeta(current_position, depth - 1, alpha, beta).value);
            if (value < beta) {
                beta = value;
                //best_moves[depth] = best_moves[depth].concat(current_move);
                top_move = current_move;
            }
            if (alpha >= beta) {
                break;
            }
        }
        if ((performance.now() - start_time) >= time_limit ) {
            time_cutoff = true;
            return {value:0,move:null};

        }
        return {value: value, move: top_move};
    }
}
// Alpha Beta using Game Object
function game_alphabeta(game, depth, alpha, beta) {
    let position = game.position;
    if (depth === 0) {
        return { value: position.material_balance, move: null};
    }
    let moves = legal_moves(position);
    //Checkmate
    if (moves.length === 0) {
        if (position.player === 'white') {
            return {value: -CHECKMATE, move: null};
        }
        else {
            return {value: CHECKMATE, move: null};
        }
    }
    if (time_cutoff) {
        return {value: 0, move: null};
    }

    if (position.player === 'white') {
        let value = -INFINITY;
        let top_move = null;
        for (var x = 0; x < moves.length; x ++) {
            let current_move = moves[x];
            game.make_move(current_move);
            value = Math.max(value, game_alphabeta(game, depth - 1, alpha, beta).value);
            game.take_move();
            if (value > alpha) {
                alpha = value;
                //best_moves[] = best_moves[depth].concat(current_move);
                top_move = current_move;
            }
            if (alpha >= beta) {
                break;
            }
        }
        if ((performance.now() - start_time) >= time_limit ) {
            time_cutoff = true;
            return {value:0,move:null};
        }
        return {value: value, move:top_move};
    }
    else {
        let value = INFINITY;
        let top_move = null;
        for (var k = 0; k < moves.length; k ++) {
            let current_move = moves[k];
            game.make_move(current_move);
            value = Math.min(value, game_alphabeta(game, depth - 1, alpha, beta).value);
            game.take_move();
            if (value < beta) {
                beta = value;
                //best_moves[depth] = best_moves[depth].concat(current_move);
                top_move = current_move;
            }
            if (alpha >= beta) {
                break;
            }
        }
        if ((performance.now() - start_time) >= time_limit ) {
            time_cutoff = true;
            return {value:0,move:null};

        }
        return {value: value, move: top_move};
    }
}

/*Give Max Depth and max search time*/
function alphabeta_search(position, max_depth, max_time) {
    set_variables(max_time);
    let value_move = {value: 0, move: null};
    for (var depth = 1; depth <= max_depth; depth++) {
        let search_move = alphabeta(position,depth,-INFINITY, INFINITY);

        if (search_move.move !== null) {
            value_move = search_move
            depth_searched = depth
        }
    }
    console.log("depth searched:", depth_searched)
    return value_move;
}

/*Give Max Depth and max search time*/
function game_alphabeta_search(game, max_depth, max_time) {
    set_variables(max_time);
    let value_move = {value: 0, move: null};
    for (var depth = 1; depth <= max_depth; depth++) {
        let search_move = game_alphabeta(game,depth,-INFINITY, INFINITY);

        if (search_move.move !== null) {
            value_move = search_move
            depth_searched = depth
        }
    }
    console.log("depth searched:", depth_searched)
    return value_move;
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

export {alphabeta_search, alphabeta, breadth_search, game_alphabeta_search}