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
		let n = "n"
		console.log(`setMovement called for ${this.Color} ${this.Name} at ${this.X}, ${this.Y}`);
		switch (this.Name) {
			case "pawn":
				console.log("case pawn");
				if (this.Color == "black") {
					console.log("case black");
					this.Movement.push([0, 1]);
					if (this.Y == 1) {
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
		piece.setMovement();
	},

	removePiece() {
		this.Piece = "none";
	},
	resetTarget() {
		this.Target = false;
	},
	setTarget() {
		this.Target = true;
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
	SelectedPieceMovement: [],
	logColors: function() {
		for (let i = 0; i < this.rows; i++) {
			let line = "";
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
			let line = "";
			for (let j = 0; j < this.columns; j++) {
				if (this.Cells[i][j].Piece != "none") {
					line += `[${this.Cells[i][j].Piece.Symbol}]`;
				} else {
					line += "[ ]";
				}

			}
			console.log(line);
		}
	},
	placePiece: function(piece, x, y) {
		console.log("Place Piece called");
		this.Cells[x][y].placePiece(piece);
	},
	logBoardTargets: function() {
		for (let i = 0; i < this.rows; i++) {
			let line = "";
			for (let j = 0; j < this.columns; j++) {
				if (this.Cells[i][j].Target == true) {
					line += `[T]`;
				} else {
					line += "[ ]";
				}

			}
			console.log(line);
		}
	},
	autoPlace: function() {
		for (let row = 0; row < this.rows; row++) {
			if (row == 0) {
				for (let col = 0; col < this.columns; col++) {
					if (col == this.columns / 2 || col == this.columns / 2 - .5) {
						let king = Piece("king", "black");
						this.Cells[row][col].placePiece(king)
					} else if (col == this.columns / 2 - 1 || col == this.columns / 2 - 1.5) {
						let queen = Piece("queen", "black");
						this.Cells[row][col].placePiece(queen)
					} else if (col == 0 || col == this.columns - 1) {
						let rook = Piece("rook", "black");
						this.Cells[row][col].placePiece(rook);
					} else if (col < this.columns / 2 && col % 2 == 0) {
						let bishop = Piece("bishop", "black");
						this.Cells[row][col].placePiece(bishop);
					} else if (col > this.columns / 2 && col % 2 == 1) {
						let bishop = Piece("bishop", "black");
						this.Cells[row][col].placePiece(bishop);
					} else {
						let knight = Piece("knight", "black");
						this.Cells[row][col].placePiece(knight);
					}
				}
			}
			if (row == 1) {
				for (let col = 0; col < this.columns; col++) {
					let pawn = Piece("pawn", "black");
					this.Cells[row][col].placePiece(pawn);
				}
				row = this.rows - 2;
			}
			if (row == this.rows - 2) {

				for (let col = 0; col < this.columns; col++) {
					let pawn = Piece("pawn", "white");
					this.Cells[row][col].placePiece(pawn);
				}
			}
			if (row == this.rows - 1) {
				for (let col = 0; col < this.columns; col++) {
					if (col == this.columns / 2 || col == this.columns / 2 - .5) {
						let king = Piece("king", "white");
						this.Cells[row][col].placePiece(king)
					} else if (col == this.columns / 2 - 1 || col == this.columns / 2 - 1.5) {
						let queen = Piece("queen", "white");
						this.Cells[row][col].placePiece(queen)
					} else if (col == 0 || col == this.columns - 1) {
						let rook = Piece("rook", "white");
						this.Cells[row][col].placePiece(rook);
					} else if (col < this.columns / 2 && col % 2 == 0) {
						let bishop = Piece("bishop", "white");
						this.Cells[row][col].placePiece(bishop);
					} else if (col > this.columns / 2 && col % 2 == 1) {
						let bishop = Piece("bishop", "white");
						this.Cells[row][col].placePiece(bishop);
					} else {
						let knight = Piece("knight", "white");
						this.Cells[row][col].placePiece(knight);
					}

				}
			}

		}
	},
	selectPiece: function(Cell) {
		try {
			if (Cell.Piece != "none") {
				this.SelectedPiece = Cell.Piece;
				this.calcMovement();
			}
		} catch (except) {
			console.log(except);
		}

	},
	resetTargets: function() {
		for (let cell of this.flatCells) {
			cell.Target = false;
		}
	},
	calcMovement: function() {
		this.SelectedPieceMovement = [];
		console.log(`calc movement for:${this.SelectedPiece.Color} ${this.SelectedPiece.Name} at ${this.SelectedPiece.X}, ${this.SelectedPiece.Y} `);
		console.log(JSON.stringify(this.SelectedPiece));
		let xi = this.SelectedPiece.X;
		let yi = this.SelectedPiece.Y;
		for (let pair of this.SelectedPiece.Movement) {
			let xf;
			let yf;
			const xfs = [];
			const yfs = [];
			if (Number.isInteger(pair[0])) {
				console.log(`pair[0] is int`);
				xf = xi + pair[0];
				xfs.push(xf);
				console.log(`xf: ${xf}`);
				console.log(`xfs: ${xfs}`);
			} else if (pair[0] == "n") {
				console.log(`pair[0] is n`);
				let i = 0;
				while (this.Cells[xf] != null) {
					xf = xi - i;
					xfs.push(xf);
				}
				i = 0;
				while (this.Cells[xf] != null) {
					xf = xi + i;
					xfs.push(xf);
				}
			}
			if (Number.isInteger(pair[1])) {
				console.log(`pair[1] is int`);
				yf = yi + pair[1];
				yfs.push(yf);
				console.log(`yf: ${yf}`);
			} else if (pair[1] == "n") {
				let i = 0;
				console.log(`pair[1] is n`);
				while (this.Cells[0][yf] != null) {
					yf = yi - i;
					yfs.push(yf);
				}
				i = 0;
				while (this.Cells[0][yf] != null) {
					yf = yi + i;
					yfs.push(yf);
				}
			}
			console.log(`xfs ${xfs}, yfs ${yfs}`);
			if (xfs.length == 1 && yfs.length == 1) {
				this.SelectedPieceMovement.push([xfs[0], yfs[0]]);
			} else if (xfs.length == 1) {
				for (let y of yfs) {
					this.SelectedPieceMovement.push([xfs[0], y])
				}
			} else if (yfs.length == 1) {
				for (let x of xfs) {
					this.SelectedPieceMovement.push([x, yfs[0]])
				}
			} else if (xfs.length == yfs.length) {
				for (let j = 0; j < xfs.length; j++) {
					this.SelectedPieceMovement.push([xfs[i], yfs[i]])
				}
			}
			console.log(this.SelectedPieceMovement);
			for (let pair of this.SelectedPieceMovement) {
				let x = pair[0];
				let y = pair[1];
				let cell = this.cellFromXY(x, y);
				cell.Target = true;
			}
		}

	},
	movePiece: function(sourceCell, destCell, freeMove) {
		if (freeMove) {
			if (sourceCell.Piece != "none") {
				let piece = sourceCell.Piece;
				sourceCell.removePiece();
				destCell.placePiece(piece);
			}
		} else if (sourceCell.Piece != "none") {
			this.selectPiece(sourceCell);
			let piece = sourceCell.Piece;
			sourceCell.removePiece();
			destCell.placePiece(piece);
		}
	},
	movePieceAt: function(sourceCoords, destCoords, freeMove) {
		let sourceCell = this.Cells[sourceCoords[1]][sourceCoords[0]];
		let destCell = this.Cells[destCoords[1]][destCoords[0]];
		this.selectPiece(sourceCell);
		this.movePiece(sourceCell, destCell, freeMove);
	},
	findKings: function() {
		this.Kings = [];
		for (let cellNum = 0; cellNum < this.rows * this.columns; cellNum++) {
			let cell = this.flatCells[cellNum];
			let piece = cell.Piece;
			if (piece.Name == "king") {
				this.Kings.push(piece);
			}
		}

	},
	cellFromXY: function(x, y) {
		try {
			return this.Cells[y][x];
		} catch (error) {
			console.log(error);
		}

	},
	dangerCheck: function() {
		this.findKings();
		console.log(this.Kings);
		let checkstring = "";
		for (let x = 0; x < this.Kings.length; x++) {
			console.log(x);
			let king = this.Kings[x];
			if (this.checkPieceTargeted(king)) {
				checkstring += `${this.Kings[x].Color} king is under attack!\n`;
			}
		}
		this.Check = checkstring;
	},
	checkPieceTargeted: function(piece) {
		let cell = this.cellFromXY(piece.X, piece.Y);
		cell.Target = false;
		for (let x = 0; x < this.flatCells.length; x++) {
			let otherPiece = this.flatCells[x].Piece;
			let otherCell = this.cellFromXY(otherPiece.X, otherPiece.Y);
			if (otherPiece.Color != piece.Color) {
				this.checkPieceAttackingSquares(otherCell);
				if (cell.Target) {
					return true;
				}
			}
		}
		return false;

	},
	checkPieceAttackingSquares: function(cell) {
		this.selectPiece(cell);
		this.calcMovement();
	},
	deselectPiece: function() {
		this.selectedPiece = "none";
		this.resetTargets();
	}
}

let timerPrototype = {
	Color: "white",
	StartQuantity: 600,
	CurrentQuantity: 600,
	IncrementQuantity: 0,
	StartTime: Date.now(),
	LastTime: Date.now(),
	UpdateInterval: 500,
	Interval: null,
	Pause: false,
	decrement: function(timer) {
		let CurrentTime = Date.now();
		console.log("Current Time: " + CurrentTime);
		if (!timer.Pause) {
			let actualElapsedTime = CurrentTime - timer.LastTime;
			timer.CurrentQuantity -= (actualElapsedTime / 1000);
			console.log("Actual elapsed time: " + actualElapsedTime);
			console.log("Decrement() StartQuantity: " + timer.StartQuantity);
			console.log("Current Quantity: " + timer.CurrentQuantity);
		}
		timer.LastTime = CurrentTime;
	},
	startTimer: function() {
		this.Interval = setInterval(this.decrement, this.UpdateInterval, this);
	},
	increment: function(){
		this.currentQuantity += this.IncrementQuantity;
	},
	pause: function() {
		this.Pause = true;
	},
	unpause: function() {
		this.Pause = false;
	}
}

function Timer(color = "white", startQuantity = 600, incrementQuantity = 0, updateInterval = 100, instaStart = false) {
	let timer = Object.create(timerPrototype);
	timer.Color = color;
	timer.StartQuantity = startQuantity;
	timer.CurrentQuantity = startQuantity;
	timer.IncrementQuantity = incrementQuantity;
	timer.UpdateInterval = updateInterval;
	if (instaStart) {
		timer.startTimer();
	}
	return timer;
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
	const board = Object.create(boardPrototype);
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
	piece.setMovement();
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

let gameControllerPrototype = {
	Mode: "normal",
	Turn: "white",
	Check: "none",
	Board: Board(8, 8),
	Play: true,
	TurnComplete: false,
	whiteTimer: Timer(),
	BlackTimer: Timer(color ="black"),
	selectPiece: function(cell) {
		let piece = cell.Piece;
		if (this.Turn == Piece.Color) {
			this.Board.selectPiece(cell);
		} else {
			console.log("incorrect color");
		}
	},
	placePiece: function(cell) {
		if (cell.Target) {
			let x = cell.X;
			let y = cell.Y;
			this.Board.placePiece(this.Board.SelectedPiece, x, y);
			this.endTurn;
		} 
		else{
			console.log("cell not a target");
			this.Board.deselectPiece();
		}
	},
	endTurn: function(){
		if (this.Turn == "white") {
			this.whiteTimer.pause();
			this.Turn = "black";
		}else{
			this.blackTimer.pause();
			this.Turn = "white";
		}
	}

}



function testBoard() {
	let play;
	play = true;
	const board = Board(8, 8);
	board.autoPlace();
	board.logBoard();
	while (play) {
		let selectedPiece = prompt("Select piece(0-7), (0-7)");
		let selectedPiecexy = selectedPiece.split(",");
		let x = selectedPiecexy[0];
		let y = selectedPiecexy[1];
		let cell = board.cellFromXY(x, y);
		board.selectPiece(cell);
		board.logBoardTargets();
		let placePiece = prompt("Place piece (0-7),(0-7)");
		let placePiecexy = placePiece.split(",");
		board.movePieceAt(selectedPiecexy, placePiecexy, true);
		board.logBoard();
		board.findKings();
		console.log(`checkstring: ${board.Check}`);
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}


testBoard();
