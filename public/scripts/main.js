import { Chess } from "https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.13.4/chess.min.js";
import { Chessground } from "./chessground/dist/chessground.js";


// Initialize Chess.js
const chess = new Chess();

// Initialize Chessground.js
const boardElement = document.getElementById("board");
const cg = Chessground (document.getElementById("board"), {
    draggable: {
        enabled: true
    },
    movable: {
        free: false,
        color: 'both',
        dests: getValidMoves(),
        events: {
            after: handleMove
        }
    },
    highlight: {
        lastMove: true,
        check: true
    }
});

// Initialize Stockfish
const stockfish = new Worker("scripts/stockfish.js");
stockfish.onmessage = function (event) {
    let data = event.data;
    console.log("Stockfish says:", data);
    if (data.includes("bestmove")) {
        let bestMove = data.split("bestmove ")[1].split(" ")[0];
        document.getElementById("stockfishOutput").innerText = `Best Move: ${bestMove}`;
    }
};

// Get valid moves for each piece
function getValidMoves() {
    const moves = new Map();
    const squares = [
        'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1',
        'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
        'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
        'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
        'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
        'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
        'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
        'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8'
    ];
    
    squares.forEach(square => {    
        const legalMoves = chess.moves({ square, verbose: true });
        if (legalMoves.length) {
            moves.set(square, legalMoves.map(m => m.to));
        }
    });
    return moves;
}

// Handle move selection
function handleMove(origin, destination) {
    const move = chess.move({ from: origin, to: destination });
    if (move) {
        cg.set({ fen: chess.fen(), movable: { dests: getValidMoves() } });
        updateMoveHistory();
        analyzePosition();
    } else {
        console.log("Invalid move");
    }
}

// Update move history
function updateMoveHistory() {
    const moves = chess.history({ verbose: true });
    let historyHTML = "";
    for (let i = 0; i < moves.length; i += 2) {
        let moveNumber = Math.floor(i / 2) + 1;
        let whiteMove = moves[i] ? moves[i].san : "";
        let blackMove = moves[i + 1] ? moves[i + 1].san : "";
        historyHTML += `<tr>
                            <td>${moveNumber}.</td>
                            <td>${whiteMove}</td>
                            <td>${blackMove}</td>
                        </tr>`;
    }
    document.getElementById("historyTableBody").innerHTML = historyHTML;
}

// Analyze position with Stockfish
function analyzePosition() {
    const moves = chess.history({ verbose: true }).map(m => m.from + m.to).join(" ");
    stockfish.postMessage("position startpos moves " + moves);
    stockfish.postMessage("go depth 15");
}

// Set initial position
cg.set({ fen: chess.fen(), movable: { dests: getValidMoves() } });
