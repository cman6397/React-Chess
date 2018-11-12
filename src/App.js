import React, { Component } from 'react';
import './App.css';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import ReactPiece from './DragPiece';
import DropSquare from './DropSquare';
import { Knight, Bishop, Rook, Queen} from './Pieces';
import { legal_moves, is_legal} from './EngineMoves';
import {normal_squares,coordinate_change, ParseFen, initialize_engine_board} from './BoardFunctions';
import { make_move, Position, create_move, Game} from './Game';
import { alphabeta_search} from './Search';
import { game_test } from './Tests';

class Chess extends Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{ position: new Position('white', initialize_engine_board(), [95, 25], [1, 1, 1, 1], 0) }],
      drag_end: null,
      promotion:{class:'hidden',start: null, end: null, player: null},
      status:null,
    }
  }
  train() {
    const history = this.state.history.slice();
    const position = history[history.length - 1].position;
    
    let chess_game = new Game(position, history);
    while (chess_game.history.length < 100) {
      let moves = chess_game.moves();
      if (moves.length === 0) {
        break;
      }
      let move = moves[Math.floor(Math.random() * moves.length)]
      chess_game.make_move(move);
      this.setState({
        history: history.concat([{position: chess_game.position}])
      });
    }
    

  };

  reset() {
    this.setState({
      history: [{ position: new Position('white', initialize_engine_board(), [95, 25], [1, 1, 1, 1], 0)}],
      drag_end: null,
      promotion:{class:'hidden',start: null, end: null, player: null},
      status:null
    });
  }
  back() {
    const history = this.state.history.slice();
    if (history.length === 1) {
      return;
    }
    history.pop();

    this.setState({
      history: history,
      status:null
    });
    }

  setup_fen(value) {
      let position = ParseFen(value);
      if (position !== 'FEN Error') {
          this.setState({
              history: [{ position: position }],
              drag_end: null,
              promotion: { class: 'hidden', start: null, end: null, player: null },
              status: null
          });
      }
      else {
          alert('FEN ERROR');
      }
  }

  engine_move() {
    const history = this.state.history.slice();
    const position = history[history.length - 1].position;
    //Time in milliseconds
    let search_time = 1000;
    let engine_move = alphabeta_search(position,10,search_time);
    console.log(engine_move.value)

    if (engine_move.move === null) {
        this.setState({
            status: 'Game Over',
        });
        return;
    }

    let new_position = make_move(position, engine_move.move);
    this.setState({
      history: history.concat([{position: new_position}]),
      engine_turn: false
    });
  }

  handle_drop(id) {
    this.setState({drag_end: id});
  }

  handle_drag_end(id) {
    const history = this.state.history.slice();
    const position = history[history.length - 1].position;

    let drag_start = coordinate_change(id);
    let drag_end = coordinate_change(this.state.drag_end);
    let piece = position.squares[drag_start];
    /* promotions */
    if ((drag_end <= 28 || drag_end >= 91) && piece.name === 'Pawn'){
      let promotion = {class:'promotion_container',start: drag_start, end: drag_end, player: position.player}
      this.setState({promotion:promotion})
      return;
    }
    this.change_states(history, position, drag_start, drag_end, null);
  };

  handle_promotion(piece) {
    const history = this.state.history.slice();
    const position = history[history.length - 1].position;
    const promotion = this.state.promotion;

    let start = promotion['start'];
    let end = promotion['end'];

    this.change_states(history, position, start, end, piece)

    this.setState({
      promotion:{class:'hidden',start: null, end: null, player: null}
    });
  }

  change_states(history, position, start, end, promotion_piece) {
      let possible_moves = legal_moves(position);
      let move = create_move(start, end, position, promotion_piece);
      let status = null;
      if (is_legal(move, possible_moves)) {
        let new_position = make_move(position, move);
        let new_moves = legal_moves(new_position);
    
        if (new_moves.length === 0) {
            status = 'Game Over'
        }
        this.setState({
          history: history.concat([{position: new_position}]),
          drag_end: null,
          status: status,
        });
    }
  }

    render() {
    let history= this.state.history;
    let current_position = history[history.length - 1].position
    let current_squares = normal_squares(current_position.squares);
    let player = current_position.player;
    let promotion_class = this.state.promotion['class'];
    //let status = this.state.status;

    return (
    <div className = 'game_container'>
      <Buttons 
      back = {() => this.back()}
      reset = {() => this.reset()}
      engine_move = {() => this.engine_move()}
      train = {() => this.train()}
      />
      <div className = 'board_container' >
        <Board 
          squares = {current_squares}
          onDrop = {(id) => this.drop(id)}
          player = {player}
          handle_drop={(id) => this.handle_drop(id)}
          handle_drag_end = {(id) => this.handle_drag_end(id)}
        />
      </div>
      <FenPosition
      setup_fen={(value) => this.setup_fen(value)}
      />
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
   <div className = 'button_container'>
      <button  
      className = "button_element" 
      onClick={() => props.train()} > Train
      </button>
      <button 
      className = "button_element" 
      onClick={() => props.reset()} > Reset
      </button>
      <button 
      className = "button_element"  
      onClick={() => props.back()} > Back 
      </button>
      <button 
      className = "button_element" 
      onClick={() => props.engine_move()} > Engine Move
      </button>
    </div>
  );
} 

class FenPosition extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: '' };
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    submit(event) {
        event.preventDefault();
        this.props.setup_fen(this.state.value);
    }

    render() {
    return (
        <form onSubmit={(event) => this.submit(event)} className='fen_input'>
            <label>
                FEN String: &nbsp;
              <input type="text" className = 'input_box' value={this.state.value} onChange={(event) => this.handleChange(event)} />
            </label>
            <input type="submit" className = 'input_button' value="Set Position" />
        </form>
    );
    }

}

class Promotion extends React.Component {
  render(){
    let knight_piece = new Knight(this.props.player);
    let bishop_piece = new Bishop(this.props.player);
    let rook_piece = new Rook(this.props.player);
    let queen_piece = new Queen(this.props.player);

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
