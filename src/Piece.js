import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ItemTypes } from './Constants';
import { DragSource } from 'react-dnd';
import './App.css';

const pieceSource = {
  beginDrag(props) {
    return {};
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

class ReactPiece extends React.Component {
  render() {
    var url = this.props.url
    const { connectDragSource, isDragging } = this.props;
    return connectDragSource(
      <img src={url} alt ='' className="react_piece"/>
    );
  }
  }

ReactPiece.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired
};

export default DragSource(ItemTypes.PIECE, pieceSource, collect)(ReactPiece);