const prompt = require("prompt-sync")();
let piecePrototype = {
	X: -1,
	Y: -1,
	Name: "none",
	Color: "none",
	Symbol: " ",
	Selected: false,
	Movement: [],
	move: function(x, y) {
		this.X += x;
		this.Y += y;
	},
	assignSymbol: function() {
		//console.log(`assignSymbol called for ${this.Name}`);
		this.Symbol = "x";
		switch (this.Name) {
			case "pawn":
				this.Symbol = "p";
				break;
			case "knight":
				this.Symbol = "n";
				break;
			case "king":
				this.Symbol = "k";
				break;
			case "queen":
				this.Symbol = "q";
				break;
			case "bishop":
				this.Symbol = "b";
				break;
			case "rook":
				this.Symbol = "r";
				break;
		}
		if (this.Color == "white") {
			this.Symbol = this.Symbol.toUpperCase();
		}
	},
	select: function() {
		if (!this.Selected) {
			this.Selected = true;
		} else {
			console.log("Piece already selected")
		}
	},
	deselect: function() {
		if (this.Selected) {
			this.Selected = false;
		} else {
			console.log("piece not selected");
		}
	},
	setMovement: function() {
		this.Movement = [];
		n = "n"
		console.log(`setMovement called for ${this.Color} ${this.Name} at ${this.X}, ${this.Y}`);
		switch (this.Name) {
			case "pawn":
				console.log("case pawn");
				if (this.Color == "black") {
					console.log("case black");
					this.Movement.push([0, 1]);
					if (this.Y === 1) {
						console.log("Y=1");
						this.Movement.push([0, 2]);
						console.log(this.Movement);
					}
				} else if (this.Color == "white") {
					this.Movement.push([0, -1]);
					if (this.Y == this.rows - 2) {
						this.Movement.push([0, -2]);
					}
				}
				break;
			case "knight":
				for (let x = 1; x <= 2; x++)
					for (let y = 1; y <= 2; y++) {
						if (Math.abs(x) != Math.abs(y)) {
							this.Movement.push([x, y]);
							this.Movement.push([x, -y]);
							this.Movement.push([-x, -y]);
							this.Movement.push([-x, y]);
						}


					}
				break;
			case "king":
				for (let x = 0; x <= 1; x++) {
					for (let y = 0; y <= 1; y++) {
						if (!0 == x == y) {
							this.Movement.push([x, y]);
							this.Movement.push([-x, y]);
							this.Movement.push([x, -y]);
							this.Movement.push([-x, -y]);
						}
					}
				}
				break;
			case "queen":
				this.Movement.push([n, 0]);
				this.Movement.push([n, n]);
				this.Movement.push([0, n]);
				break;
			case "bishop":
				this.Movement.push([n, n]);
				break;
			case "rook":
				this.Movement.push([0, n]);
				this.Movement.push([n, 0]);
				break;

		}
	}
}

let cellPrototype = {
	X: 0,
	Y: 0,
	Color: "NA",
	Piece: "none",
	Target: false,
	placePiece(piece) {
		this.Piece = piece;
		piece.X = this.X;
		piece.Y = this.Y;
	},

	removePiece() {
		this.Piece = "none";
	},
	resetTarget(){
		this.Target= false;
	}
}

let gameControllerPrototype = {
	Mode: "none",
	Turn: "white",
	Check: "none",
	Board: "none",
	Play: true,
	play: function() {
		while (Play) {
			this.playerTurn();
		}
	},
	playerTurn: function() {


	}

}


let boardPrototype = {
	rows: 0,
	columns: 0,
	Cells: null,
	flatCells: null,
	SelectedPiece: "none",
	Check: "none",
	Kings: [],
	logColors: function() {
		for (let i = 0; i < this.rows; i++) {
			line = "";
			for (let j = 0; j < this.columns; j++) {
				if (this.Cells[i][j].Color == "black") {
					line += "[b]";
				} else {
					line += "[w]";
				}
			}
			console.log(line);
		}
	},
	logBoard: function() {
		for (let i = 0; i < this.rows; i++) {
			line = "";
			for (let j = 0; j < this.columns; j++) {
				if (this.Cells[i][j].Piece != "none") {
					line += `[${this.Cells[i][j].Piece.Symbol}]`;
				} else {
					line += "[ ]";
				}

			}
			console.log(line);
		}
		placePiece = function(piece, x, y) {
			this.Cells[x][y].placePiece(piece)
		}
	},
	autoPlace: function() {
		for (let row = 0; row < this.rows; row++) {
			if (row == 0) {
				for (let col = 0; col < this.columns; col++) {
					if (col == this.columns / 2 || col == this.columns / 2 - .5) {
						king = Piece("king", "black");
						this.Cells[row][col].placePiece(king)
					} else if (col == this.columns / 2 - 1 || col == this.columns / 2 - 1.5) {
						queen = Piece("queen", "black");
						this.Cells[row][col].placePiece(queen)
					} else if (col == 0 || col == this.columns - 1) {
						rook = Piece("rook", "black");
						this.Cells[row][col].placePiece(rook);
					} else if (col < this.columns / 2 && col % 2 == 0) {
						bishop = Piece("bishop", "black");
						this.Cells[row][col].placePiece(bishop);
					} else if (col > this.columns / 2 && col % 2 == 1) {
						bishop = Piece("bishop", "black");
						this.Cells[row][col].placePiece(bishop);
					} else {
						knight = Piece("knight", "black");
						this.Cells[row][col].placePiece(knight);
					}
				}
			}
			if (row == 1) {
				for (let col = 0; col < this.columns; col++) {
					pawn = Piece("pawn", "black");
					this.Cells[row][col].placePiece(pawn);
				}
				row = this.rows - 2;
			}
			if (row == this.rows - 2) {

				for (let col = 0; col < this.columns; col++) {
					pawn = Piece("pawn", "white");
					this.Cells[row][col].placePiece(pawn);
				}
			}
			if (row == this.rows - 1) {
				for (let col = 0; col < this.columns; col++) {
					if (col == this.columns / 2 || col == this.columns / 2 - .5) {
						king = Piece("king", "white");
						this.Cells[row][col].placePiece(king)
					} else if (col == this.columns / 2 - 1 || col == this.columns / 2 - 1.5) {
						queen = Piece("queen", "white");
						this.Cells[row][col].placePiece(queen)
					} else if (col == 0 || col == this.columns - 1) {
						rook = Piece("rook", "white");
						this.Cells[row][col].placePiece(rook);
					} else if (col < this.columns / 2 && col % 2 == 0) {
						bishop = Piece("bishop", "white");
						this.Cells[row][col].placePiece(bishop);
					} else if (col > this.columns / 2 && col % 2 == 1) {
						bishop = Piece("bishop", "white");
						this.Cells[row][col].placePiece(bishop);
					} else {
						knight = Piece("knight", "white");
						this.Cells[row][col].placePiece(knight);
					}

				}
			}

		}
	},

	selectPiece: function(Cell) {
		if (Cell.Piece != "none") {
			this.SelectedPiece = Cell.Piece;
		}
	},
	resetTargets: function(){
		this.flatCells.forEach(cell.resetTargets(cell));
	},

	calcMovement: function() {
		if (this.SelectedPiece != "none") {
			for (let movement of this.SelectedPiece.Movement) {
				xi = this.SelectedPiece.X;
				yi = this.SelectedPiece.Y;
				if (Number.isInteger(movement[0])) {
					xf = movement[0] + xi;
				}
				if (Number.isInteger(movement[1])) {
					yf = movement[1] + yi;
				}
				if (Number.isInteger(movement[1]) && Number.isInteger(movement[0])) {
					this.Cells[xf][yf].Target = true;
				}
			}
		}
	},

	movePiece: function(sourceCell, destCell, freeMove) {
		if (freeMove) {
			if (sourceCell.Piece != "none") {
				piece = sourceCell.Piece;
				sourceCell.removePiece();
				destCell.placePiece(piece);
			}
		} else if (sourceCell.Piece != "none") {
			selectPiece(sourceCell);
			piece = sourceCell.Piece;
			sourceCell.removePiece();
			destCell.placePiece(piece);
		}
	},

	movePieceAt: function(sourceCoords, destCoords, freeMove) {
		sourceCell = this.Cells[sourceCoords[1]][sourceCoords[0]];
		destCell = this.Cells[destCoords[1]][destCoords[0]];
		this.selectPiece(sourceCell);
		this.calcMovement();
		this.movePiece(sourceCell, destCell, freeMove);
	},

	findKings: function() {
		for (let cellNum = 0; cellNum < this.rows * this.columns; cellNum++) {
			cell = this.flatCells[cellNum];
			piece = cell.Piece;
			if (piece.Name == "king") {
				this.Kings.push(piece);
			}
		}

	},

	cellFromXY: function(x, y) {
		return this.Cells[y][x];
	},

	dangerCheck: function() {
		this.findKings();
		checkstring = "";
		for (let x =0; x< this.Kings.length;x++){
			if (this.checkPieceTargeted(this.Kings[x])){
				checkstring += `${this.Kings[x].Color} king is under attack!\n`;
			}
		}
		this.Check = checkstring;
	},
	checkPieceTargeted: function(piece) {
		cell = this.cellFromXY(piece.X, piece.Y);
		cell.Target = false;
		for (let x =0; x<flatCells;x++){
			otherPiece = flatCells[x].Piece;
			otherCell = this.cellFromXY(otherPiece.X, otherPiece.Y);
			if(otherPiece.Color !=piece.Color){
				checkPieceAttackingSquares(otherCell);
				if (cell.Target){
					return true;
				}
			}
		}
		return false;
		
	},
	checkPieceAttackingSquares: function(cell){
		this.selectPiece(cell);
		this.calcMovement();
	},
	deselectPiece: function(){
		this.selectPiece = "none";
		this.resetTargets();
	}
}






function Board(numRows, numCols) {
	let Cells = createArray(numRows, numCols);
	for (let y = 0; y < numCols; y++) {
		for (let x = 0; x < numRows; x++) {
			let color = "white";
			if (isOdd(x + y)) {
				color = "black";
			}
			Cells[x][y] = Cell(color, y, x);
		}
	}
	flatCells = Cells.flat();
	board = Object.create(boardPrototype);
	board.rows = numRows;
	board.columns = numCols;
	board.Cells = Cells;
	board.flatCells = flatCells;
	return board;
}

function DefaultGame() {
	game = Object.create(gameControllerPrototype);
	board = Board(8, 8);
	game.mode = "normal";
	game.Board = board;
}


function Cell(color, x, y) {
	cell = Object.create(cellPrototype);
	cell.Color = color;
	cell.X = x;
	cell.Y = y;
	return cell;
}

function Piece(type, color) {
	piece = Object.create(piecePrototype);
	piece.Color = color;
	piece.Name = type;
	piece.assignSymbol();
	return piece;
}


function isOdd(num) {
	return num % 2;
}

function createArray(length) {
	var arr = new Array(length || 0),
		i = length;
	if (arguments.length > 1) {
		var args = Array.prototype.slice.call(arguments, 1);
		while (i--) arr[length - 1 - i] = createArray.apply(this, args);
	}
	return arr;
}

function testBoard() {
	play = true;
	const board = Board(8, 8);
	board.autoPlace();
	while (play) {
		selectedPiece = prompt("Select piece(0-7), (0-7)");
		selectedPiecexy = selectedPiece.split(",");
		placePiece = prompt("Place piece (0-7),(0-7)");
		placePiecexy = placePiece.split(",");
		board.movePieceAt(selectedPiecexy, placePiecexy, true);
		board.logBoard();
		board.findKings();
		board.dangerCheck();
		console.log(`checkstring: ${board.Check}`);
	}
}



const newBoard = Board(8, 9);

newBoard.logColors();
newBoard.autoPlace();
newBoard.logBoard();
newBoard.findKings();
newBoard.cellFromXY(newBoard.Kings[0].X, newBoard.Kings[0].Y);

newBoard.dangerCheck();
testBoard();
console.log(newBoard.Kings);
