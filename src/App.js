import React, { Component } from 'react';
import './App.css';

class Chess extends Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{squares: initialize_board()}],
      white_to_move: true,
    }
  }
  render() {
    let boards = this.state.history;
    var current_squares = boards[boards.length-1].squares;

    return (
    <div className = 'game_container'>
      <Board 
      squares = {current_squares} />
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
        let current_square = <Square value = {this.props.squares[id]} key={id} color = {color}/>;
        html_row.push(current_square);
        color = !color
      }
      html_row = <div className = "board_row" key = {i}> { html_row } </div>
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
  renderSquare(color){
    var style = {}
    if (this.props.value) {
      style = this.props.value.style
      console.log(style)
    }
    if (color) {
      return <button className = "light square" style = { style }> </button>
    }
    else {
      return <button className = "dark square" style = { style } > </button>
    }
  }
  render() {
    var color = this.props.color
    return (
    <React.Fragment>
      {this.renderSquare(color)}
    </React.Fragment>
    );
  }
}

class Piece {
  constructor(player, img_url){
    this.player = player;
    this.style = {backgroundImage: "url('"+img_url+"')"};
  }
}


function initialize_board(){
  var board = Array(64).fill(null)
  for (var k = 0; k < 8; k++){
    board[k+8] = new Piece ('black','https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg');
    board[k+8*6] = new Piece ('white','https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg');
  }
  /*
  for (var i=0; i < 2; i++){
    board[i*56 + 0] = 'r'
    board[i*56+ 1] = 'n'
    board[i*56 + 2] = 'b'
    board[i*56 + 3] = 'q'
    board[i*56 + 4] = 'k'
    board[i*56 + 5] = 'b'
    board[i*56 + 6] = 'n'
    board[i*56 + 7] = 'r'
  }*/
  return board
}



export default Chess;
