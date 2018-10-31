import React, { Component } from 'react';
import './App.css';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import ReactPiece from './Piece';

class Chess extends Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{squares: initialize_board()}],
      player: 'white',
      click_start: null
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
  drag_start(id) {
    this.setState({click_start: id})
  }
  drop(id) {
    const history = this.state.history.slice();
    const squares = history[history.length - 1].squares.slice();
    let piece_start = squares[this.state.click_start];
    let player = this.state.player;

    squares[this.state.click_start] = null;
    squares[id] = piece_start;

    (player === 'white') ? player = 'black' : player = 'white';

    this.setState({
      history: history.concat([{
        squares: squares,
      }]),
      click_start: null,
      player: player
    });
  }
  drag_end(id) {
    this.setState({click_start: null})
  }
  handle_click(i) {
    const history = this.state.history.slice();
    const squares = history[history.length - 1].squares.slice();
    let click_start = this.state.click_start;
    let piece_start = null;
    let current_piece = squares[i];
    let player = this.state.player;

    //Set clicked piece to the piece to move if clicked square is a piece and no piece has been clicked
    if (click_start == null & current_piece != null) {
      this.setState({click_start: i});
    }
    // valid click set up
    else if (click_start != null) {
      piece_start = squares[click_start];
      squares[click_start] = null;
      squares[i] = piece_start;

      (player === 'white') ? player = 'black' : player = 'white';

      this.setState({
        history: history.concat([{
          squares: squares,
        }]),
        click_start: null,
        player: player
      });
    }
    else {
      this.setState({click_start: null});
    }
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
          onClick = {(i) => this.handle_click(i)}
          onDragStart = {(id) => this.drag_start(id)}
          onDragEnd = {(id) => this.drag_end(id)}
          onDrop = {(id) => this.drop(id)}
          player = {this.state.player}
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
          onClick={() => this.props.onClick(id)} 
          onDragStart={(event) => this.props.onDragStart(id)} 
          onDragEnd = {(event) => this.props.onDragEnd(id)} 
          onDrop = {(event) => this.props.onDrop(id)}
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
  drag_start(event){
    console.log('start')
  }
  drag_end(event){
    console.log('end')
  }
  renderSquare(color){
    var class_name = "dark square"
    var style = null;
    var url = null;
    var player = null;

    if (this.props.value) {
      style = this.props.value.style;
      url = this.props.value.url;
      player = this.props.value.player;
    }
    if (color) {
        class_name = "light square"
    }
    if (style !== null ){
      if (this.props.player !== player){
        return <button className={class_name} onClick={() => this.props.onClick()} style = {style}> </button>
      }
      else {
        return <button className={class_name} onClick={() => this.props.onClick()}>  <ReactPiece url = {url}/> </button>
      }
    }
    else {
      return <button className={class_name} onClick={() => this.props.onClick()}> </button>
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
