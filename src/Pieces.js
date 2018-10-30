class Piece {
  constructor(player, img_url){
    this.player = player;
    this.style = {backgroundImage: "url('"+img_url+"')"};
  }
}

class Pawn extends Piece {
	constructor(player){
		var url='https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg'
		if (player == 'black') {
			url = 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt.svg'
		}
		super(player,url)
	}
}