import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ItemTypes } from './Constants';
import { DragSource } from 'react-dnd';
import './App.css';

class DropSquare extends React.Component {
    render() {
        var style = this.props.style;
        var class_name = this.props.class_name;
        return <div className={class_name} style={style} onClick={() => this.props.onClick()}> </div>
    }
}

export default (DropSquare);