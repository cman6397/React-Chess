import React, { Component } from 'react';
import './App.css';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import ReactPiece from './DragPiece';
import DropSquare from './DropSquare';
import { Knight, Bishop, Rook, Queen} from './Pieces';
import { legal_moves, is_legal} from './EngineMoves';
import {normal_squares,coordinate_change, ParseFen} from './BoardFunctions';
import { create_move, Game, new_game} from './Game';
import { alphabeta_search, game_alphabeta_search} from './Search';
//import { game_test, perft_test } from './Tests';
import { train } from './Evaluation.js';

class Chess extends Component {
  constructor(props) {
    super(props);
    this.state = {
      game: new_game(),
      drag_end: null,
      promotion:{class:'hidden',start: null, end: null, player: null},
      status:null,
      click_start: null
    }
  }
  train() {
    const game = this.state.game
    //perft_test(position,4);
    train(game);
  };

  reset() {
    this.setState({
      game: new_game(),
      drag_end: null,
      promotion:{class:'hidden',start: null, end: null, player: null},
      status:null
    });
  }
  back() {
    const game = this.state.game
    game.take_move();

    this.setState({
      game: game,
      status:null
    });
    }

  setup_fen(value) {
      let position = ParseFen(value);
      if (position !== 'FEN Error') {
          let game = new Game(position, [], []);
          this.setState({
              game: game,
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
    const game = this.state.game
    let position = game.position;
    //Time in milliseconds
    let search_time = 1000;
    let engine_move = game_alphabeta_search(game,10,search_time);
    //console.log(engine_move.value)

    if (engine_move.move === null) {
        this.setState({
            status: 'Game Over',
        });
        return;
    }
    game.make_move(engine_move.move);

    this.setState({
        game: game,
    })
  }

  handle_drop(id) {
    this.setState({drag_end: id});
  }

  handle_click_start(id) {
    let start_square = coordinate_change(id);
    this.setState({click_start: start_square});
  }

  handle_click_end(id) {
    const game = this.state.game;
    const position = game.position;
    const click_start = this.state.click_start;

    let piece = position.squares[click_start];
    let click_end = coordinate_change(id);

    if ((click_end <= 28 || click_end >= 91) && piece.name === 'Pawn'){
      let promotion = {class:'promotion_container',start: click_start, end: click_end, player: position.player}
      this.setState({promotion:promotion})
      return;
    }
    else {
      this.change_states(game, click_start, click_end, null);
    }
  }

  handle_drag_end(id) {
    const game = this.state.game;
    const position = game.position;

    let drag_start = coordinate_change(id);
    let drag_end = coordinate_change(this.state.drag_end);
    let piece = position.squares[drag_start];
    /* promotions */
    if ((drag_end <= 28 || drag_end >= 91) && piece.name === 'Pawn'){
      let promotion = {class:'promotion_container',start: drag_start, end: drag_end, player: position.player}
      this.setState({promotion:promotion})
      return;
    }
    this.change_states(game, drag_start, drag_end, null);
  };

  handle_promotion(piece) {
    const game = this.state.game;
    const position = game.position;
    const promotion = this.state.promotion;

    let start = promotion['start'];
    let end = promotion['end'];

    this.change_states(game, start, end, piece)

    this.setState({
      promotion:{class:'hidden',start: null, end: null, player: null}
    });
  }

  change_states(game, start, end, promotion_piece) {
      let possible_moves = legal_moves(game.position);
      let move = create_move(start, end, game.position, promotion_piece);
      let status = null;

      if (is_legal(move, possible_moves)) {
        game.make_move(move);
        let new_moves = legal_moves(game.position);
    
        if (new_moves.length === 0) {
            status = 'Game Over'
        }
        setTimeout( () => {
          this.setState({
            game: game,
            drag_end: null,
            status: status,
          })
        }, 10);
        if (game.position.player === 'black') {
          setTimeout(this.engine_move.bind(this), 50);
        }
    }
  }

    render() {
    const game = this.state.game;
    let current_position = game.position
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
          handle_click_start = {(id) => this.handle_click_start(id)}
          handle_click_end = {(id) => this.handle_click_end(id)}
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
          id = {id}
          handle_drop={() => this.props.handle_drop(id)}
          handle_drag_end = {(id) => this.props.handle_drag_end(id)}
          handle_click_start = {() => this.props.handle_click_start(id)}
          handle_click_end = {() => this.props.handle_click_end(id)}
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
              handle_click_start = {() => this.props.handle_click_start()}
            /> 
          </div> );
        }
        else {
            return (
            <DropSquare 
              class_name={class_name} 
              style={style} 
              handle_drop={() => this.props.handle_drop()}
              handle_click_end = {() => this.props.handle_click_end()}
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
