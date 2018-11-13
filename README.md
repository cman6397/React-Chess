

# React Chess
  React Chess is a chess engine built from scratch using javascript on the backend and react for the UI.  
  https://chrisatkeson.com/Deploy-React-Chess/
  
## Objects and Representations

All the information needed to identify a given chess position is wrapped in the "Position" object.  The Position object includes the following attributes below: 

#### The Board:
  The game board is represented by a 120 length array.  This coressponds to a 10x12 board with the middle 8x8 squares representing the playable board and the outer squares representing boundaries.  The reason that the board is represented with boundaries is to simplify the logic for move generation.  If we represent the board as 64 squares, we have to incoroporate logic to make sure that our moves are not wrapping around to the next row on the board or landing on squares that are outside of the indices of the array (Especially for knights). 
  
#### Pieces:
  Pieces are objects with a display image and an attribute indicating whether or not the given piece has moved.  This attribute is utilized for pawn moves to check if they can move ahead two squares.  I may remove this state and just check the position of the pawn on the board to see if it is on a starting square or not.  Pieces are placed in the Board array at indices corresponding to their location on the board.  
  
#### Additional States:
  In addition to the actual game board with pieces, I keep track of the castling permissions, the En Passant capture square, and the King locations.  En Passant and Castling permissions are essential for the position representation and King locations save me time in the legal move generation since I use king locations to calculate pins and checks.  I also lifted material balance to the position state to shorten the evaluation function.  After every move material balance is updated accordingly.  I will remove this state when I incorporate the neural network evaluation function which will use the game board itself as an input.  
 
## Move Generation
  The move generation functions can be found in the EngineMoves.js function.  There are two general types of move generation techniques, Pseudo legal move generation and legal move generation.  Pseudo legal move generation generates all possible moves given the peices on the board and then at the end removes moves which are illegal (King in check).  Legal move generation checks for legality conditions before it generates moves so that it only generates legal moves.  Legal move generation is much faster than pseudo legal move generation because it is very expensive to check if a given position is legal. However, legal move generation is much more difficult to implement since it requires identification of pinned pieces and check moves, which is the most difficult part of the move generation function.  
  
  I initially intended to implement pseudo legal move generation but ended up writing legal move generation since I did not like the idea of having to run an expensive legality check for every move I generated.  The key for legal move generation for me was coming up with efficient ways to identify pinned pieces, attacked squares, and possible moves when the king is in check.  
  
#### Find Attacked Squares: 
   The only squares that I care about for attacks is the square that the king is on and the squares that the king can move to since I need to know if the king is in check and I need to know what squares the king can legally move to.  The way I identify if a square is attacked is a I start at the square and work diagonally, horizontally, and vertically outward until I encounter a boundary or another piece.  If I encounter a bishop or queen at the end of a diagonal or a rook or queen at the end of a vertical/horizontal, I add that piece to a list of attacking pieces and return that the square is attacked.  I also check if knight or pawns are attacking the square by checking if knights or pawns are on squares that would attack the king.  
  
#### Pinned Piece Strategy:
  The pinned piece method is similar to the Attacked Squares method. It starts off expanding vertically, horizontally, and diagonally from the players king location until it reaches a boundary or a piece.  If the piece belongs to the player, it continues past the piece in the same direction until it reaches a piece or a boundary.  If an opponent piece is encountered which attacks in the direction that the expansion is going, then the player's piece is pinned.  The piece and the direction which it is pinned from is then added to a dictionary.  Before move generation, all pinned pieces are identified in this manner.  If a piece is pinned, the legal move generation function only allows that piece to move in the direction that the piece is pinned in (towards or away from the king towards the pinning piece).  
  
#### King in Check Moves:
  Finding in check moves was the hardest one for me to figure out and the one that I am most proud of.  When the king is in check, it is very hard to figure out how to efficiently generate moves which block the check, move the king, or eliminate the attacking piece.  The solution I came up with was an adaptation of the attacking piece method, except I returned all the squares which the attack crosses over from the piece to the king and the square for the piece which is attacking.  When the king is in check, non king piece moves can only land in one of these squares, blocking the pin or elminating the attacking piece! 

#### En Passant Pin Exception:
  The En Passant pin exception is an incredibly rare situation where taking En Passant moves two pawns off an attacking direction leaving the king in check.  It occurs when the rook is in line horizontally with the opposing king and there are two pawns inbetween the rook and the king, one white and one black where the kings color pawn can take the other pawn En Passant.  This removes both pawns from the horizontal direction and leaves the king in check.  I implemented a special function for En Passant Pins which is only triggered when the En Passant move is available.  It removes the pawn that can be taken en_passant and calculates pawn pins after removing the pawn.  I only identified this rare situation through rigourous Perft Testing.  
  
## User Interface 
  The user interface is written in React and is contained in the App.js file, the DragPiece and DropSquare files.  The interface is pretty straightforward with a Game component, Board component, Square component, and Piece compponent. I implemented drag and drop using React-dnd.  Pieces are only rendered for the player whos turn it is to move.  The opposing players pieces are actually just squares with background images as the pieces.  This allows these squares to be treated as drop targets to enable captures.  If pieces are used for both sides then pieces would have to be drag and drop targets which is a little bit less convenient.   

## The Engine

  The Engine is simply iterative deepening using Alpha Beta Pruning on the Game tree with respect to a material and checkmate evaluation function.  Each piece is given a score for how valuable it is and checkmates are evaluated with very high scores.  The engine can evaluate about 100,000 positions per second and reaches depths of about 4-5 given one second to search.  I would estimate the current strength of the engine to be about 1000. The engine is still under active development.  I plan to implement a nueral network evaluation function and move ordering which will greatly improve pruning.  I'm hoping to routinely reach depths of 6-8 and exceed a 2000 Elo skill level.  
  
#### Engine Notes
Training Data: https://www.kaggle.com/c/finding-elo/data
Papers: 
-- https://int8.io/chess-position-evaluation-with-convolutional-neural-networks-in-julia/
-- http://www.ai.rug.nl/~mwiering/GROUP/ARTICLES/ICPRAM_CHESS_DNN_2018.pdf
  
  
## Testing

The move generation function is tested using about 100 Perft Test positions, which can be found in the Tests.js file.  Perft testing works by comparing the total positions found at given depths with the known number of positions at those depths.  I identified the En Passant Pin Exception using Perft testing and now pass all the perft tests.  



    
  
