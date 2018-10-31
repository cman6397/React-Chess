class Square extends React.Component {

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
        return <div className={class_name} onClick={() => this.props.onClick()} style = {style}> </div>
      }
      else {
        return <div className={class_name} onClick={() => this.props.onClick()}>  <ReactPiece url = {url}/> </div>
      }
    }
    else {
      return <div className={class_name} onClick={() => this.props.onClick()}> </div>
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