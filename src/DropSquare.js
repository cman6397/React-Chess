import React from 'react';
import { ItemTypes } from './Constants';
import { DropTarget } from 'react-dnd';
import './App.css';

const squareTarget = {
    drop(props) {
      return props.handle_drop();
    }
};

function collect(connect, monitor) {
    return {
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver()
    };
}

class DropSquare extends React.Component {
    render() {
        var style = this.props.style;
        var class_name = this.props.class_name;
        const connectDropTarget = this.props.connectDropTarget;
        return connectDropTarget(
            <div className={class_name} style={style} onClick = {() => this.props.handle_click_end()}> </div>
        )
    }
}
  

export default DropTarget(ItemTypes.PIECE, squareTarget, collect)(DropSquare);