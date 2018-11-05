import React, { Component } from 'react';
import './App.css';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import ReactPiece from './DragPiece';
import DropSquare from './DropSquare';
import { initialize_board, make_move, Knight, Bishop, Rook, Queen } from './Pieces.js';
import { legal_moves, is_legal } from './ChessMoves';
import { make_engine_move } from './Engine';
//import { test } from './Tests';

class Chess extends Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{squares: initialize_board()}],
      player: 'white',
      drag_end: null,
      promotion:{class:'hidden',start: null, end: null, player: null}
      //test:test()
    }
  }
  back() {
    const history = this.state.history.slice();
    let player = this.state.player;

    if (history.length === 1) {
      return;
    }
    history.pop();
    (player === 'white') ? player = 'black' : player = 'white';

    this.setState({
      history: history,
      player:player
    });
  }

  engine_move() {
    const history = this.state.history.slice();
    const squares = history[history.length - 1].squares.slice();
    let player = this.state.player;

    let possible_moves = legal_moves(squares, player);
    if (possible_moves.length === 0) {
      return;
    }
    let move = possible_moves[Math.floor(Math.random() * possible_moves.length)][1];
    let new_squares = make_engine_move(squares, move);

    (player === 'white') ? player = 'black' : player = 'white';

    this.setState({
      history: history.concat([{squares: new_squares}]),
      player:player
    });
  }

  handle_drop(id) {
    this.setState({drag_end: id});
  }

  handle_drag_end(id) {
    const history = this.state.history.slice();
    const squares = history[history.length - 1].squares.slice();
    let drag_start = id;
    let drag_end = this.state.drag_end;
    let player = this.state.player;
    /*Make copy of piece */
    let piece_copy = JSON.parse(JSON.stringify(squares[drag_start]));
    /* get legal moves */
    let possible_moves = legal_moves(squares, player);
    /* promotions */
    if ((drag_end < 8 || drag_end > 55) && piece_copy.name === 'Pawn'){
      let promotion = {class:'promotion_container',start: drag_start, end: drag_end, player: player}
      this.setState({promotion:promotion})
      return;
    }
    /* make move */
    make_move(drag_start, drag_end, squares, piece_copy);
    /*Make sure move was legal.*/
    if (is_legal(squares, possible_moves)){
      (player === 'white') ? player = 'black' : player = 'white';

      this.setState({
        history: history.concat([{squares: squares}]),
        drag_end: null,
        player: player
      });
    }
  };

  handle_promotion(piece) {
    const history = this.state.history.slice();
    const squares = history[history.length - 1].squares.slice();
    const promotion = this.state.promotion;

    let start = promotion['start'];
    let end = promotion['end'];
    let player = promotion['player'];

    let possible_moves = legal_moves(squares, player);
    make_move(start, end, squares, piece);

    if (is_legal(squares, possible_moves)){
      (player === 'white') ? player = 'black' : player = 'white';

      this.setState({
        history: history.concat([{squares: squares}]),
        drag_end: null,
        player: player
      });
    }
    this.setState({
      promotion:{class:'hidden',start: null, end: null, player: null}
    });

  }

  render() {
    let boards = this.state.history;
    let current_squares = boards[boards.length-1].squares;
    let player = this.state.player;
    let promotion_class = this.state.promotion['class'];

    return (
    <div className = 'game_container'>
      <Buttons 
      back = {() => this.back()}
      engine_move = {() => this.engine_move()}
      />
      <div className = 'board_container' >
        <Board 
          squares = {current_squares}
          onDragStart = {(id) => this.drag_start(id)}
          onDragEnd = {(id) => this.drag_end(id)}
          onDrop = {(id) => this.drop(id)}
          player = {this.state.player}
          handle_drop={(id) => this.handle_drop(id)}
          handle_drag_end = {(id) => this.handle_drag_end(id)}
        />
      </div>
      <Promotion
        className = {promotion_class}
        player = {player}
        handle_promotion = {(piece) => this.handle_promotion(piece)}
      />
    </div>
    );
  }
}

class Board extends React.Component {
  renderSquares() {
    var html_board = [];
    var color = false;
    for (var i = 0; i < 8; i ++){
    color = !color;
    var html_row = [];
      for (var k = 0; k < 8; k ++){
        let id = i*8 + k
        let current_square = <Square 
          value={this.props.squares[id]} 
          key={id} 
          color={color} 
          player = {this.props.player}
          handle_drop={() => this.props.handle_drop(id)}
          handle_drag_end = {(id) => this.props.handle_drag_end(id)}
          id = {id}
        />;
        html_row.push(current_square);
        color = !color
      }
      html_row = <div className = "board_row" key = {i}> {html_row} </div>
      html_board.push(html_row)
    }
    return html_board
  }
  render() {
  return (
    <div>
    {this.renderSquares()}
    </div>
  );
  }
}

class Square extends React.Component {
    renderSquare(color) {
        var class_name = "dark square"
        var style = null;
        var url = null;
        var player = null;

        if (color) {
            class_name = "light square"
        }
        if (this.props.value) {
            style = this.props.value.style;
            url = this.props.value.url;
            player = this.props.value.player;
        }
        if (this.props.player === player) {
          return (
          <div className={class_name}>
            <ReactPiece 
              url={url} 
              id = {this.props.id}
              handle_drag_end = {(id) => this.props.handle_drag_end(id)}
            /> 
          </div> );
        }
        else {
            return (
            <DropSquare 
              class_name={class_name} 
              style={style} 
              handle_drop={() => this.props.handle_drop()}
            /> );
        }
    }

  render() {
    var color = this.props.color;
    return (
    <React.Fragment>
      {this.renderSquare(color)}
    </React.Fragment>
    );
  }
}

function Buttons(props) {
  return (
    <div>
      <button 
      className = "back_button" 
      onClick={() => props.back()} > Back 
      </button>
      <button 
      className = "engine_button" 
      onClick={() => props.engine_move()} > Engine Move
      </button>
    </div>
  );
} 

class Promotion extends React.Component {
  render(){
    let knight_piece = new Knight(this.props.player);
    let bishop_piece = new Bishop(this.props.player);
    let rook_piece = new Rook(this.props.player);
    let queen_piece = new Queen(this.props.player);
    /*paranoia about freakish castling circumstances with promoted rook*/
    rook_piece.has_moved = true;

    return (
      <div className = {this.props.className}>
        <div className="promotion">
            <button className = {"promotion_button"} style = {knight_piece.style} onClick={() => this.props.handle_promotion(knight_piece)}></button>
            <button className = {"promotion_button"} style = {bishop_piece.style} onClick={() => this.props.handle_promotion(bishop_piece)}></button>
            <button className = {"promotion_button"} style = {rook_piece.style} onClick={() => this.props.handle_promotion(rook_piece)}></button>
            <button className = {"promotion_button"} style = {queen_piece.style} onClick={() => this.props.handle_promotion(queen_piece)}></button>
        </div>
      </div>
    );
  }
} 


export default DragDropContext(HTML5Backend)(Chess);
