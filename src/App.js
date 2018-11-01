import React, { Component } from 'react';
import './App.css';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import ReactPiece from './Piece';
import DropSquare from './DropSquare';

class Chess extends Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{squares: initialize_board()}],
      player: 'white',
      drag_end: null
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
  handle_drop(id) {
    this.setState({drag_end: id});
  }

  handle_drag_end(id) {
    const history = this.state.history.slice();
    const squares = history[history.length - 1].squares.slice();
    let drag_start = id;
    let drag_end = this.state.drag_end;
    let piece_start = squares[drag_start];
    let player = this.state.player;

    /*Make it possible to castle (only move which moves 2 pieces at once)
    if (piece_start.name === 'King') {
      if (drag_start === 60 && (drag_end === 57 || drag_end == 62)) {
        
      }
    }*/

    squares[drag_start] = null;
    squares[drag_end] = piece_start;

    (player === 'white') ? player = 'black' : player = 'white';

    this.setState({
      history: history.concat([{
        squares: squares,
      }]),
      drag_end: null,
      player: player
    });
  };

  render() {
    let boards = this.state.history;
    var current_squares = boards[boards.length-1].squares;

    return (
    <div className = 'game_container'>
      <button 
      className = "back_button" 
      onClick={() => this.back()} > Back </button>
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


class Piece {
  constructor(player, img_url, name){
    this.player = player;
    this.style = {backgroundImage: "url('"+img_url+"')"};
    this.name = name;
    this.url = img_url;
  }
}

class Pawn extends Piece {
  constructor(player){
    var url='https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg'
    if (player === 'black') {
        url = 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg'
    }
    super(player,url,'Pawn')
  }
}

class Rook extends Piece {
    constructor(player) {
        var url = 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg'
        if (player === 'black') {
            url = 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg'
        }
        super(player, url,'Rook')
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

function initialize_board(){
  var board = Array(64).fill(null)
  for (var k = 0; k < 8; k++){
    board[k+8] = new Pawn ('black');
    board[k+48] = new Pawn ('white');
    };

  var color = 'black';
  for (var i = 0; i < 2; i++){
    if (i===1) {
      color = 'white'
    }
    board[i*56] = new Rook (color);
    board[i*56 + 7] = new Rook (color);
    board[i*56 + 1] = new Knight (color);
    board[i*56 + 6] = new Knight (color);
    board[i*56 + 2] = new Bishop (color);
    board[i*56 + 5] = new Bishop (color);
    board[i*56 + 3] = new Queen (color);
    board[i*56 + 4] = new King (color);
  }
  return board
}
export default DragDropContext(HTML5Backend)(Chess);
