import { King, Rook, Pawn, Knight, Bishop, Queen } from './Pieces';
import { make_move, Position, Game} from './Game';
import { breadth_search, alphabeta_search } from './Search';
import { legal_moves, engine_squares} from './EngineMoves';
import { ParseFen, evaluate_material, initialize_engine_board } from './BoardFunctions';

var perft_table = [
    [6,'8/8/4k3/8/2p5/8/B2P2K1/8 w - - 0 1',0,0,0,0,0, 1015133],
    [6,'3k4/3p4/8/K1P4r/8/8/8/8 b - - 0 1', 0,0,0,0,0, 1134888],
    [5, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 ", 20, 400, 8902, 197281, 4865609, 119060324],
    [4, "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1 ", 48, 2039, 97862, 4085603, 193690690],
    [6, "4k3/8/8/8/8/8/8/4K2R w K - 0 1 ", 15, 66, 1197, 7059, 133987, 764643],
    [6, "4k3/8/8/8/8/8/8/R3K3 w Q - 0 1 ", 16, 71, 1287, 7626, 145232, 846648],
    [6, "4k2r/8/8/8/8/8/8/4K3 w k - 0 1 ", 5, 75, 459, 8290, 47635, 899442],
    [6, "r3k3/8/8/8/8/8/8/4K3 w q - 0 1 ", 5, 80, 493, 8897, 52710, 1001523],
    [6, "4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1 ", 26, 112, 3189, 17945, 532933, 2788982],
    [6, "r3k2r/8/8/8/8/8/8/4K3 w kq - 0 1 ", 5, 130, 782, 22180, 118882, 3517770],
    [6, "8/8/8/8/8/8/6k1/4K2R w K - 0 1 ", 12, 38, 564, 2219, 37735, 185867],
    [6, "8/8/8/8/8/8/1k6/R3K3 w Q - 0 1 ", 15, 65, 1018, 4573, 80619, 413018],
    [6, "4k2r/6K1/8/8/8/8/8/8 w k - 0 1 ", 3, 32, 134, 2073, 10485, 179869],
    [6, "r3k3/1K6/8/8/8/8/8/8 w q - 0 1 ", 4, 49, 243, 3991, 20780, 367724],
    [5, "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1 ", 26, 568, 13744, 314346, 7594526, 179862938],
    [5, "r3k2r/8/8/8/8/8/8/1R2K2R w Kkq - 0 1 ", 25, 567, 14095, 328965, 8153719, 195629489],
    [5, "r3k2r/8/8/8/8/8/8/2R1K2R w Kkq - 0 1 ", 25, 548, 13502, 312835, 7736373, 184411439],
    [5, "r3k2r/8/8/8/8/8/8/R3K1R1 w Qkq - 0 1 ", 25, 547, 13579, 316214, 7878456, 189224276],
    [5, "1r2k2r/8/8/8/8/8/8/R3K2R w KQk - 0 1 ", 26, 583, 14252, 334705, 8198901, 198328929],
    [5, "2r1k2r/8/8/8/8/8/8/R3K2R w KQk - 0 1 ", 25, 560, 13592, 317324, 7710115, 185959088],
    [5, "r3k1r1/8/8/8/8/8/8/R3K2R w KQq - 0 1 ", 25, 560, 13607, 320792, 7848606, 190755813],
    [6, "4k3/8/8/8/8/8/8/4K2R b K - 0 1 ", 5, 75, 459, 8290, 47635, 899442],
    [6, "4k3/8/8/8/8/8/8/R3K3 b Q - 0 1 ", 5, 80, 493, 8897, 52710, 1001523],
    [6, "4k2r/8/8/8/8/8/8/4K3 b k - 0 1 ", 15, 66, 1197, 7059, 133987, 764643],
    [6, "r3k3/8/8/8/8/8/8/4K3 b q - 0 1 ", 16, 71, 1287, 7626, 145232, 846648],
    [6, "4k3/8/8/8/8/8/8/R3K2R b KQ - 0 1 ", 5, 130, 782, 22180, 118882, 3517770],
    [6, "r3k2r/8/8/8/8/8/8/4K3 b kq - 0 1 ", 26, 112, 3189, 17945, 532933, 2788982],
    [6, "8/8/8/8/8/8/6k1/4K2R b K - 0 1 ", 3, 32, 134, 2073, 10485, 179869],
    [6, "8/8/8/8/8/8/1k6/R3K3 b Q - 0 1 ", 4, 49, 243, 3991, 20780, 367724],
    [6, "4k2r/6K1/8/8/8/8/8/8 b k - 0 1 ", 12, 38, 564, 2219, 37735, 185867],
    [6, "r3k3/1K6/8/8/8/8/8/8 b q - 0 1 ", 15, 65, 1018, 4573, 80619, 413018],
    [5, "r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1 ", 26, 568, 13744, 314346, 7594526, 179862938],
    [5, "r3k2r/8/8/8/8/8/8/1R2K2R b Kkq - 0 1 ", 26, 583, 14252, 334705, 8198901, 198328929],
    [5, "r3k2r/8/8/8/8/8/8/2R1K2R b Kkq - 0 1 ", 25, 560, 13592, 317324, 7710115, 185959088],
    [5, "r3k2r/8/8/8/8/8/8/R3K1R1 b Qkq - 0 1 ", 25, 560, 13607, 320792, 7848606, 190755813],
    [5, "1r2k2r/8/8/8/8/8/8/R3K2R b KQk - 0 1 ", 25, 567, 14095, 328965, 8153719, 195629489],
    [5, "2r1k2r/8/8/8/8/8/8/R3K2R b KQk - 0 1 ", 25, 548, 13502, 312835, 7736373, 184411439],
    [5, "r3k1r1/8/8/8/8/8/8/R3K2R b KQq - 0 1 ", 25, 547, 13579, 316214, 7878456, 189224276],
    [6, "8/1n4N1/2k5/8/8/5K2/1N4n1/8 w - - 0 1 ", 14, 195, 2760, 38675, 570726, 8107539],
    [6, "8/1k6/8/5N2/8/4n3/8/2K5 w - - 0 1 ", 11, 156, 1636, 20534, 223507, 2594412],
    [5, "8/8/4k3/3Nn3/3nN3/4K3/8/8 w - - 0 1 ", 19, 289, 4442, 73584, 1198299, 19870403],
    [6, "K7/8/2n5/1n6/8/8/8/k6N w - - 0 1 ", 3, 51, 345, 5301, 38348, 588695],
    [6, "k7/8/2N5/1N6/8/8/8/K6n w - - 0 1 ", 17, 54, 835, 5910, 92250, 688780],
    [6, "8/1n4N1/2k5/8/8/5K2/1N4n1/8 b - - 0 1 ", 15, 193, 2816, 40039, 582642, 8503277],
    [6, "8/1k6/8/5N2/8/4n3/8/2K5 b - - 0 1 ", 16, 180, 2290, 24640, 288141, 3147566],
    [6, "8/8/3K4/3Nn3/3nN3/4k3/8/8 b - - 0 1 ", 4, 68, 1118, 16199, 281190, 4405103],
    [6, "K7/8/2n5/1n6/8/8/8/k6N b - - 0 1 ", 17, 54, 835, 5910, 92250, 688780],
    [6, "k7/8/2N5/1N6/8/8/8/K6n b - - 0 1 ", 3, 51, 345, 5301, 38348, 588695],
    [5, "B6b/8/8/8/2K5/4k3/8/b6B w - - 0 1 ", 17, 278, 4607, 76778, 1320507, 22823890],
    [5, "8/8/1B6/7b/7k/8/2B1b3/7K w - - 0 1 ", 21, 316, 5744, 93338, 1713368, 28861171],
    [5, "k7/B7/1B6/1B6/8/8/8/K6b w - - 0 1 ", 21, 144, 3242, 32955, 787524, 7881673],
    [5, "K7/b7/1b6/1b6/8/8/8/k6B w - - 0 1 ", 7, 143, 1416, 31787, 310862, 7382896],
    [5, "B6b/8/8/8/2K5/5k2/8/b6B b - - 0 1 ", 6, 106, 1829, 31151, 530585, 9250746],
    [5, "8/8/1B6/7b/7k/8/2B1b3/7K b - - 0 1 ", 17, 309, 5133, 93603, 1591064, 29027891],
    [5, "k7/B7/1B6/1B6/8/8/8/K6b b - - 0 1 ", 7, 143, 1416, 31787, 310862, 7382896],
    [5, "K7/b7/1b6/1b6/8/8/8/k6B b - - 0 1 ", 21, 144, 3242, 32955, 787524, 7881673],
    [5, "7k/RR6/8/8/8/8/rr6/7K w - - 0 1 ", 19, 275, 5300, 104342, 2161211, 44956585],
    [5, "R6r/8/8/2K5/5k2/8/8/r6R w - - 0 1 ", 36, 1027, 29215, 771461, 20506480, 525169084],
    [5, "7k/RR6/8/8/8/8/rr6/7K b - - 0 1 ", 19, 275, 5300, 104342, 2161211, 44956585],
    [4, "R6r/8/8/2K5/5k2/8/8/r6R b - - 0 1 ", 36, 1027, 29227, 771368, 20521342, 524966748],
    [6, "6kq/8/8/8/8/8/8/7K w - - 0 1 ", 2, 36, 143, 3637, 14893, 391507],
    [6, "6KQ/8/8/8/8/8/8/7k b - - 0 1 ", 2, 36, 143, 3637, 14893, 391507],
    [6, "K7/8/8/3Q4/4q3/8/8/7k w - - 0 1 ", 6, 35, 495, 8349, 166741, 3370175],
    [6, "6qk/8/8/8/8/8/8/7K b - - 0 1 ", 22, 43, 1015, 4167, 105749, 419369],
    [6, "6KQ/8/8/8/8/8/8/7k b - - 0 1 ", 2, 36, 143, 3637, 14893, 391507],
    [6, "K7/8/8/3Q4/4q3/8/8/7k b - - 0 1 ", 6, 35, 495, 8349, 166741, 3370175],
    [6, "8/8/8/8/8/K7/P7/k7 w - - 0 1 ", 3, 7, 43, 199, 1347, 6249],
    [6, "8/8/8/8/8/7K/7P/7k w - - 0 1 ", 3, 7, 43, 199, 1347, 6249],
    [6, "K7/p7/k7/8/8/8/8/8 w - - 0 1 ", 1, 3, 12, 80, 342, 2343],
    [6, "7K/7p/7k/8/8/8/8/8 w - - 0 1 ", 1, 3, 12, 80, 342, 2343],
    [6, "8/2k1p3/3pP3/3P2K1/8/8/8/8 w - - 0 1 ", 7, 35, 210, 1091, 7028, 34834],
    [6, "8/8/8/8/8/K7/P7/k7 b - - 0 1 ", 1, 3, 12, 80, 342, 2343],
    [6, "8/8/8/8/8/7K/7P/7k b - - 0 1 ", 1, 3, 12, 80, 342, 2343],
    [6, "K7/p7/k7/8/8/8/8/8 b - - 0 1 ", 3, 7, 43, 199, 1347, 6249],
    [6, "7K/7p/7k/8/8/8/8/8 b - - 0 1 ", 3, 7, 43, 199, 1347, 6249],
    [6, "8/2k1p3/3pP3/3P2K1/8/8/8/8 b - - 0 1 ", 5, 35, 182, 1091, 5408, 34822],
    [6, "8/8/8/8/8/4k3/4P3/4K3 w - - 0 1 ", 2, 8, 44, 282, 1814, 11848],
    [6, "4k3/4p3/4K3/8/8/8/8/8 b - - 0 1 ", 2, 8, 44, 282, 1814, 11848],
    [6, "8/8/7k/7p/7P/7K/8/8 w - - 0 1 ", 3, 9, 57, 360, 1969, 10724],
    [6, "8/8/k7/p7/P7/K7/8/8 w - - 0 1 ", 3, 9, 57, 360, 1969, 10724],
    [6, "8/8/3k4/3p4/3P4/3K4/8/8 w - - 0 1 ", 5, 25, 180, 1294, 8296, 53138],
    [6, "8/3k4/3p4/8/3P4/3K4/8/8 w - - 0 1 ", 8, 61, 483, 3213, 23599, 157093],
    [6, "8/8/3k4/3p4/8/3P4/3K4/8 w - - 0 1 ", 8, 61, 411, 3213, 21637, 158065],
    [6, "k7/8/3p4/8/3P4/8/8/7K w - - 0 1 ", 4, 15, 90, 534, 3450, 20960],
    [6, "8/8/7k/7p/7P/7K/8/8 b - - 0 1 ", 3, 9, 57, 360, 1969, 10724],
    [6, "8/8/k7/p7/P7/K7/8/8 b - - 0 1 ", 3, 9, 57, 360, 1969, 10724],
    [6, "8/8/3k4/3p4/3P4/3K4/8/8 b - - 0 1 ", 5, 25, 180, 1294, 8296, 53138],
    [6, "8/3k4/3p4/8/3P4/3K4/8/8 b - - 0 1 ", 8, 61, 411, 3213, 21637, 158065],
    [6, "8/8/3k4/3p4/8/3P4/3K4/8 b - - 0 1 ", 8, 61, 483, 3213, 23599, 157093],
    [6, "k7/8/3p4/8/3P4/8/8/7K b - - 0 1 ", 4, 15, 89, 537, 3309, 21104],
    [6, "7k/3p4/8/8/3P4/8/8/K7 w - - 0 1 ", 4, 19, 117, 720, 4661, 32191],
    [6, "7k/8/8/3p4/8/8/3P4/K7 w - - 0 1 ", 5, 19, 116, 716, 4786, 30980],
    [6, "k7/8/8/7p/6P1/8/8/K7 w - - 0 1 ", 5, 22, 139, 877, 6112, 41874],
    [6, "k7/8/7p/8/8/6P1/8/K7 w - - 0 1 ", 4, 16, 101, 637, 4354, 29679],
    [6, "k7/8/8/6p1/7P/8/8/K7 w - - 0 1 ", 5, 22, 139, 877, 6112, 41874],
    [6, "k7/8/6p1/8/8/7P/8/K7 w - - 0 1 ", 4, 16, 101, 637, 4354, 29679],
    [6, "k7/8/8/3p4/4p3/8/8/7K w - - 0 1 ", 3, 15, 84, 573, 3013, 22886],
    [6, "k7/8/3p4/8/8/4P3/8/7K w - - 0 1 ", 4, 16, 101, 637, 4271, 28662],
    [6, "7k/3p4/8/8/3P4/8/8/K7 b - - 0 1 ", 5, 19, 117, 720, 5014, 32167],
    [6, "7k/8/8/3p4/8/8/3P4/K7 b - - 0 1 ", 4, 19, 117, 712, 4658, 30749],
    [6,"k7/8/8/7p/6P1/8/8/K7 b - - 0 1 ", 5, 22, 139, 877, 6112, 41874],
    [6, "k7/8/7p/8/8/6P1/8/K7 b - - 0 1 ", 4, 16, 101, 637, 4354, 29679],
    [6, "k7/8/8/6p1/7P/8/8/K7 b - - 0 1 ", 5, 22, 139, 877, 6112, 41874],
    [6, "k7/8/6p1/8/8/7P/8/K7 b - - 0 1 ", 4, 16, 101, 637, 4354, 29679],
    [6, "k7/8/8/3p4/4p3/8/8/7K b - - 0 1 ", 5, 15, 102, 569, 4337, 22579],
    [6, "k7/8/3p4/8/8/4P3/8/7K b - - 0 1 ", 4, 16, 101, 637, 4271, 28662],
    [6, "7k/8/8/p7/1P6/8/8/7K w - - 0 1 ", 5, 22, 139, 877, 6112, 41874],
    [6, "7k/8/p7/8/8/1P6/8/7K w - - 0 1 ", 4, 16, 101, 637, 4354, 29679],
    [6, "7k/8/8/1p6/P7/8/8/7K w - - 0 1 ", 5, 22, 139, 877, 6112, 41874],
    [6, "7k/8/1p6/8/8/P7/8/7K w - - 0 1 ", 4, 16, 101, 637, 4354, 29679],
    [6, "k7/7p/8/8/8/8/6P1/K7 w - - 0 1 ", 5, 25, 161, 1035, 7574, 55338],
    [6, "k7/6p1/8/8/8/8/7P/K7 w - - 0 1 ", 5, 25, 161, 1035, 7574, 55338],
    [6, "3k4/3pp3/8/8/8/8/3PP3/3K4 w - - 0 1 ", 7, 49, 378, 2902, 24122, 199002],
    [6, "7k/8/8/p7/1P6/8/8/7K b - - 0 1 ", 5, 22, 139, 877, 6112, 41874],
    [6, "7k/8/p7/8/8/1P6/8/7K b - - 0 1 ", 4, 16, 101, 637, 4354, 29679],
    [6, "7k/8/8/1p6/P7/8/8/7K b - - 0 1 ", 5, 22, 139, 877, 6112, 41874],
    [6, "7k/8/1p6/8/8/P7/8/7K b - - 0 1 ", 4, 16, 101, 637, 4354, 29679],
    [6, "k7/7p/8/8/8/8/6P1/K7 b - - 0 1 ", 5, 25, 161, 1035, 7574, 55338],
    [6, "k7/6p1/8/8/8/8/7P/K7 b - - 0 1 ", 5, 25, 161, 1035, 7574, 55338],
    [6, "3k4/3pp3/8/8/8/8/3PP3/3K4 b - - 0 1 ", 7, 49, 378, 2902, 24122, 199002],
    [6, "8/Pk6/8/8/8/8/6Kp/8 w - - 0 1 ", 11, 97, 887, 8048, 90606, 1030499],
    [5, "n1n5/1Pk5/8/8/8/8/5Kp1/5N1N w - - 0 1 ", 24, 421, 7421, 124608, 2193768, 37665329],
    [5, "8/PPPk4/8/8/8/8/4Kppp/8 w - - 0 1 ", 18, 270, 4699, 79355, 1533145, 28859283],
    [5, "n1n5/PPPk4/8/8/8/8/4Kppp/5N1N w - - 0 1 ", 24, 496, 9483, 182838, 3605103, 71179139],
    [6, "8/Pk6/8/8/8/8/6Kp/8 b - - 0 1 ", 11, 97, 887, 8048, 90606, 1030499],
    [5, "n1n5/1Pk5/8/8/8/8/5Kp1/5N1N b - - 0 1 ", 24, 421, 7421, 124608, 2193768, 37665329],
    [5, "8/PPPk4/8/8/8/8/4Kppp/8 b - - 0 1 ", 18, 270, 4699, 79355, 1533145, 28859283],
    [5, "n1n5/PPPk4/8/8/8/8/4Kppp/5N1N b - - 0 1 ", 24, 496, 9483, 182838, 3605103, 71179139]
    ];
    
function perft_testing(){
    let perft_passed = true;
    for (var x = 0; x < 3; x++) {
        let depth = perft_table[x][0];
        let current_fen = perft_table[x][1];
        let current_position = ParseFen(current_fen);
        let total_positions = perft(depth,current_position);
        let correct_positions = perft_table[x][depth+1];

        if (correct_positions === total_positions){
            console.log("PASSED", "Generated Positions:", total_positions, "Correct Positions:", correct_positions)
        }
        else {
            perft_passed = false;
            console.log("FAILED", "Generated Positions:", total_positions, "Correct Positions:", correct_positions)
        }
    }
    if (perft_passed) {
        console.log('PASSED ALL')
    }
}

function game_test(position) {
    let initial_position = new Position('white', initialize_engine_board(), [95, 25], [1,1,1,1], 0);
    let chess_game = new Game(initial_position, [initial_position]);

    if (position !== null) {
        chess_game = new Game(position, [position]);
    }
    while (chess_game.history.length < 50) {
        let moves = chess_game.moves();
        let move = moves[Math.floor(Math.random() * moves.length)]
        chess_game.make_move(move);
        console.log(move)
    }
}











/* Compare possible move generation to known possible move generation.  */
function test() {
    //test_position_class();
    //test_positions();
    test_pieces();
    //test_evaluation();
    perft_test();
   
}
/*Check number of positions found.  1) 20, 2) 400, 3) 8902, 4) 197281 for starting position */
function test_positions() {
    var t0 = performance.now();
    let depth = 4; 

    let chess_position = new Position('white', initialize_engine_board(), [95, 25], [1,1,1,1], 0);

    let positions = breadth_search(depth, [chess_position]);
    let total_positions = positions.length

    var t1 = performance.now();
    console.log('nodes per second', total_positions / ((t1 - t0) / 1000), 'total_positions:', total_positions, 'depth:', depth);

    t0 = performance.now();
    let move_count = breadth_search_moves(5, [chess_position]);
    t1 = performance.now();

    console.log('move count',move_count, 'moves per second', (move_count*1000)/(t1-t0), 'depth:', 5);

    t0 = performance.now();
    let evaluation = alphabeta_search(chess_position, depth,-10000, 10000, null);
    t1 = performance.now();

    console.log("Alpha-Beta nodes per second", total_positions/((t1-t0)/1000), evaluation)
}

/*Test Piece Moves */
function test_pieces() {
    let test_results = [];
    test_results.push(test_king());
    test_results.push(test_pawn());
    test_results.push(test_knight());
    test_results.push(test_bishop());
    test_results.push(test_rook());
    test_results.push(test_queen());

    console.log(test_results);
}

/*Test King Moves*/
function test_king() {
    let passed=true;

    let pieces = [new King('white'), new King('black')];
    let locations = [60, 4];

    /*edge of board*/
    if (!test_num_moves(pieces, locations, 'white',[0,0,0,0],5)) {
        passed = false;
    }
    /* middle of board*/
    pieces = [new King('white'), new King('black')];
    locations = [45, 4];

    if (!test_num_moves(pieces, locations, 'white',[0,0,0,0],8)) {
        passed = false;
    }
    /*castle*/
    pieces = [new King('white'), new Rook('white'), new Pawn('white'), new King('black')];
    locations = [60, 63, 55, 4];

    if (!test_num_moves(pieces, locations, 'white',[1,0,0,0],10)) {
        passed = false;
    }

    if (passed) {
        return 'PASSED'
    }
    else {
        return 'KING FAILED'
    }
}
/*Test Pawn Moves*/
function test_pawn() {
    let passed=true;

    /*start move test*/
    let pieces = [new King('white'), new King('black'), new Pawn('white')];
    let locations = [60, 4, 55];

    if (!test_num_moves(pieces, locations, 'white',[0,0,0,0],7)) {
        passed = false;
    }

    /*move with capture test*/
    let white_pawn = new Pawn('white');
    white_pawn.has_moved = true;

    let black_pawn = new Pawn('black');
    black_pawn.has_moved = true;

    pieces = [new King('white'), new King('black'), white_pawn, black_pawn];
    locations = [60, 4, 27, 18];

    if (!test_num_moves(pieces, locations, 'white', [0, 0, 0, 0], 7)) {
        passed = false;
    }

    /*promotion test*/
    white_pawn = new Pawn('white');
    white_pawn.has_moved = true;

    let black_rook = new Rook('black');

    pieces = [new King('white'), new King('black'), white_pawn, black_rook];
    locations = [60, 4, 14, 7];

    if (!test_num_moves(pieces, locations, 'white', [0, 0, 0, 0], 13)) {
        passed = false;
    }

    if (passed) {
        return 'PASSED'
    }
    else {
        return 'PAWN FAILED'
    }

}

/*Test Knight Moves*/
function test_knight() {
    let passed = true;

    /*start move test*/
    let pieces = [new King('white'), new King('black'), new Knight('white')];
    let locations = [60, 4, 35];

    if (!test_num_moves(pieces, locations, 'white', [0, 0, 0, 0], 13)) {
        passed = false;
    }

    if (passed) {
        return 'PASSED'
    }
    else {
        return 'KNIGHT FAILED'
    }
}

/*Test Bishop Moves*/
function test_bishop() {
    let passed = true;

    /*start move test*/
    let pieces = [new King('white'), new King('black'), new Bishop('white')];
    let locations = [60, 4, 35];

    if (!test_num_moves(pieces, locations, 'white', [0, 0, 0, 0], 18)) {
        passed = false;
    }

    if (passed) {
        return 'PASSED'
    }
    else {
        return 'BISHOP FAILED'
    }
}

/*Test Rook Moves*/
function test_rook() {
    let passed = true;

    /*start move test*/
    let pieces = [new King('white'), new King('black'), new Rook('white')];
    let locations = [60, 4, 35];

    if (!test_num_moves(pieces, locations, 'white', [0, 0, 0, 0], 19)) {
        passed = false;
    }

    if (passed) {
        return 'PASSED'
    }
    else {
        return 'ROOK FAILED'
    }
}
/* Test Queen Moves */
function test_queen() {
    let passed = true;

    /*start move test*/
    let pieces = [new King('white'), new King('black'), new Queen('white')];
    let locations = [60, 4, 35];

    if (!test_num_moves(pieces, locations, 'white', [0, 0, 0, 0], 32)) {
        passed = false;
    }

    if (passed) {
        return 'PASSED'
    }
    else {
        return 'QUEEN FAILED'
    }
}


/*See how move generation functions and move making functions are doing speed wise*/
function test_position_class() {
    let chess_position = new Position('white', initialize_engine_board(), [95, 25], [1, 1, 1, 1]);
    let moves = legal_moves(chess_position);

    let positions = [];
    let total_moves = 100000;
    let total_positions = 20000; 

    var m0 = performance.now();
    for (var x = 0; x < total_moves; x++) {
        let new_position = make_move(chess_position, moves[0]);
        positions.push(new_position);
    }
    var m1 = performance.now();

    var p0 = performance.now();
    for (x = 0; x < total_positions; x++) {
        legal_moves(chess_position);
    }
    var p1 = performance.now();

    console.log('made moves per second', total_moves / ((m1 - m0) / 1000), 'total_moves:', total_moves);
    console.log('moves_generated_per_second', (total_positions * legal_moves(chess_position).length) / ((p1 - p0) / 1000), 'total_moves_generated:', (total_positions * legal_moves(chess_position).length));
}

function test_evaluation(){
    let num_positions = 1000000
    let chess_position = new Position('white', initialize_engine_board(), [95, 25], [1, 1, 1, 1]);

    if (evaluate_material(chess_position.squares) !== 0){
        console.log('EVALUATION FAILED')
    }

    var t1 = performance.now();
    for (var k = 0; k < num_positions; k++) {
        evaluate_material(chess_position.squares)
    }
    var t2 = performance.now();

    console.log("Evaluations Per Second:", num_positions*1000/(t2-t1))
}

function test_num_moves(pieces, locations, player, castle_state, num_moves){
    let passed = true;
    let squares = Array(64).fill(null);

    for (var x = 0; x< pieces.length; x++){
        squares[locations[x]] = pieces[x];
    }
    
    squares = engine_squares(squares);
    let king_locations = get_king_locations(squares);
    let chess_position = new Position(player, squares, king_locations, castle_state, null, null);

    let moves = legal_moves(chess_position);

    if (moves.length !== num_moves ){
        passed = false;
    }
    return passed;
}

function get_king_locations(squares) {
    /*White King Location & Black King location*/
    let wk_location = null;
    let bk_location = null;

    for (var k = 0; k < squares.length; k++) {
        let current_square = squares[k];
        if (current_square !== null && current_square !== 'boundary') {
            if (current_square.name === 'King') {
                if (current_square.player === 'white') {
                    wk_location = k;
                }
                else {
                    bk_location = k;
                }
            }
        }
    }
    let king_locations = [wk_location, bk_location]
    return king_locations;
}

function perft_search(chess, depth) {
    if (depth === 0) {
        return 1;
    }
    else {
        let moves = chess.moves();
        let nodes = 0;
        for (var x = 0; x < moves.length; x++){
            chess.move(moves[x]);
            nodes = nodes + perft_search(chess, depth-1);
            chess.undo();
        }
        return nodes;
    }
}

function perft_test(position, depth) {
    if (position === null) {
        position = ParseFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    }
    if (depth === null) {
        depth = 3;
    }
    let t1 = performance.now();
    /*
    let moves = legal_moves(position);
    for (var x =0; x < moves.length; x ++){
        let new_position = make_move(position, moves[x]);
        console.log(moves[x], perft(1, new_position));
    }
    */
    let position_count =perft(depth, position);
    let t2 = performance.now();
    /*

    var chess = new Chess('8/1k1p4/8/2P4r/2K5/8/8/8 b - - 4 3');
    moves = chess.moves();
    for (var x =0; x < moves.length; x ++){
        chess.move(moves[x]);
        console.log(moves[x], perft_search(chess, 1));
        chess.undo();
    }

    */
    console.log('positions per second', position_count*1000/(t2-t1), "total positions", position_count)

}

/* Breadth First Search.*/
function breadth_search_moves(depth, positions) {
    if (depth === 1) {
        let move_count = 0;
        for (var k = 0; k < positions.length; k++) {
            let current_position = positions[k];
            let moves = legal_moves(current_position);
            move_count = move_count + moves.length;
        }
        return move_count
    }
    else {
        let new_positions = [];
        for (var j = 0; j < positions.length; j++) {
            let current_position = positions[j];
            let moves = legal_moves(current_position);

            for (var i = 0; i < moves.length; i++) {
                let current_move = moves[i];
                let next_position = make_move(current_position, current_move)
                new_positions.push(next_position);
            }
        }
        return breadth_search_moves(depth - 1, new_positions);
    }
}

function perft(depth, position) {
    if (depth === 0) {
        return 1;
    }
    else {
        let nodes = 0;
        let moves = legal_moves(position);
        for (var i = 0; i < moves.length; i++) {
            let current_move = moves[i];
            let next_position = make_move(position, current_move);
            nodes = nodes + perft(depth-1, next_position);

        }
        return nodes;
    }
}


export { test, perft_test, ParseFen, perft_testing, game_test }