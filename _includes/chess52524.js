const prompt = require("prompt-sync")();

function Piece(type, color) {
	const piece = Object.create(piecePrototype);
	piece.Color = color;
	piece.Name = type;
	piece.assignSymbol();
	return piece;
}

const piecePrototype = {
	X: -1,
	Y: -1,
	Name: "none",
	Color: "none",
	Symbol: " ",
	Selected: false,
	Movement: [],
	HasMoved: false,
	BoardRows: 8,
	BoardColumns: 8,

	move(x, y) {
		this.X += x;
		this.Y += y;
	},

	assignSymbol() {
		const symbols = {
			"pawn": "p",
			"knight": "n",
			"king": "k",
			"queen": "q",
			"bishop": "b",
			"rook": "r"
		};
		this.Symbol = symbols[this.Name] || "x";
		if (this.Color === "white") {
			this.Symbol = this.Symbol.toUpperCase();
		}
	},

	select() {
		this.Selected ? console.log("Piece already selected") : this.Selected = true;
	},

	deselect() {
		this.Selected ? this.Selected = false : console.log("Piece not selected");
	},
	setMovement() {
		this.Movement = [];
		switch (this.Name) {
			case "pawn":
				this.setPawnMovement();
				break;
			case "knight":
				this.setKnightMovement();
				break;
			case "king":
				this.setKingMovement();
				break;
			case "queen":
				this.assignMovementForDirection("queen");
				break;
			case "bishop":
				this.assignMovementForDirection("bishop");
				break;
			case "rook":
				this.assignMovementForDirection("rook");
				break;
		}
	},
	setPawnMovement() {
		let direction = this.Color === "black" ? 1 : -1;
		this.Movement.push([0, direction]);
		if ((this.Color === "black" && this.Y === 1) || (this.Color === "white" && this.Y === this.BoardRows - 2)) {
			this.Movement.push([0, direction * 2]);
		}
	},

	setKnightMovement() {
		const knightMoves = [
			[2, 1],
			[2, -1],
			[-2, 1],
			[-2, -1],
			[1, 2],
			[1, -2],
			[-1, 2],
			[-1, -2]
		];
		this.Movement.push(...knightMoves);
	},

	setKingMovement() {
		const kingMoves = [
			[1, 1],
			[1, -1],
			[-1, 1],
			[-1, -1],
			[1, 0],
			[0, 1],
			[-1, 0],
			[0, -1]
		];
		this.Movement.push(...kingMoves);
	},

	assignMovementForDirection(type) {
		const directions = {
			"queen": [
				[1, 0],
				[0, 1],
				[-1, 0],
				[0, -1],
				[1, 1],
				[1, -1],
				[-1, 1],
				[-1, -1]
			],
			"bishop": [
				[1, 1],
				[1, -1],
				[-1, 1],
				[-1, -1]
			],
			"rook": [
				[1, 0],
				[0, 1],
				[-1, 0],
				[0, -1]
			]
		};
		this.Movement.push(...directions[type]);
	}
};

const cellPrototype = {
	X: 0,
	Y: 0,
	Color: "NA",
	Piece: "none",
	Target: false,
	BoardRows: 8,
	BoardColumns: 8,

	placePiece(piece) {
		this.Piece = piece;
		piece.X = this.X;
		piece.Y = this.Y;
		piece.BoardRows = this.BoardRows;
		piece.BoardColumns = this.BoardColumns;
		piece.setMovement();
		console.log(piece);
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
};

const boardPrototype = {
	rows: 0,
	columns: 0,
	Cells: null,
	flatCells: null,
	SelectedPiece: "none",
	Check: "none",
	Kings: [],
	SelectedPieceMovement: [],
	logColors() {
		console.log(this.Cells.map(row => row.map(cell => cell.Color[0]).join("")).join("\n"));
	},

	logBoard() {
		console.log(this.Cells.map(row => row.map(cell => cell.Piece.Symbol ? `[${cell.Piece.Symbol}]` : "[ ]").join("")).join("\n"));
	},

	placePiece(piece, x, y) {
		this.Cells[x][y].placePiece(piece);
	},

	logBoardTargets() {
		console.log(this.Cells.map(row => row.map(cell => cell.Target ? `[T]` : "[ ]").join("")).join("\n"));
	},

	autoPlace: function() {
		const placeMainPieces = (row, color) => {
			const columns = this.columns;
			const mid = Math.floor(columns / 2);

			for (let col = 0; col < columns; col++) {
				if (col === 0 || col === columns - 1) {
					this.Cells[row][col].placePiece(Piece("rook", color));
				} else if (col === mid) {
					this.Cells[row][col].placePiece(Piece("king", color));
				} else if (col === mid - 1) {
					this.Cells[row][col].placePiece(Piece("queen", color));
				} else if ((col < mid && col % 2 === 0) || (col > mid && col % 2 === 1)) {
					this.Cells[row][col].placePiece(Piece("bishop", color));
				} else {
					this.Cells[row][col].placePiece(Piece("knight", color));
				}
			}
		};

		const placePawns = (row, color) => {
			for (let col = 0; col < this.columns; col++) {
				this.Cells[row][col].placePiece(Piece("pawn", color));
			}
		};

		placeMainPieces(0, "black");
		placePawns(1, "black");

		placePawns(this.rows - 2, "white");
		placeMainPieces(this.rows - 1, "white");
	},

	selectPiece(Cell) {
		if (Cell.Piece !== "none") {
			this.SelectedPiece = Cell.Piece;
			this.calcMovement();
		}
	},
	captureSelectedPiece() {
		if (this.SelectedPiece !== "none") {
			let x = this.SelectedPiece.X;
			let y = this.SelectedPiece.Y;
			let cell = this.cellFromXY(x, y);
			cell.Piece = "none";
		}
	},

	resetTargets() {
		this.flatCells.forEach(cell => cell.resetTarget());
	},

	calcMovement() {
		this.SelectedPieceMovement = [];
		let {
			X: xi,
			Y: yi
		} = this.SelectedPiece;

		this.SelectedPiece.Movement.forEach(([dx, dy]) => {
			if (dx === "n" || dy === "n") {
				this.calcSlidingMovement(dx === "n" ? "x" : "y", xi, yi, dx, dy);
			} else {
				let xf = xi + dx;
				let yf = yi + dy;
				if (this.isInBounds(xf, yf)) {
					this.SelectedPieceMovement.push([xf, yf]);
					this.cellFromXY(xf, yf).setTarget();
				}
			}
		});
	},
	calcSlidingMovement(axis, xi, yi) {
		["plus", "minus"].forEach(dir => {
			let i = 1;
			while (this.isInBounds(xi + (dir === "plus" ? i : -i) * (axis === "x" ? 1 : 0), yi + (dir === "plus" ? i : -i) * (axis === "y" ? 1 : 0))) {
				let xf = xi + (dir === "plus" ? i : -i) * (axis === "x" ? 1 : 0);
				let yf = yi + (dir === "plus" ? i : -i) * (axis === "y" ? 1 : 0);
				if (this.isInBounds(xf, yf)) {
					this.SelectedPieceMovement.push([xf, yf]);
					this.cellFromXY(xf, yf).setTarget();
				}
				i++;
			}
		});
	},
	isInBounds(x, y) {
		return x >= 0 && x < this.columns && y >= 0 && y < this.rows;
	},
	movePiece(sourceCell, destCell, freeMove) {
		if (freeMove || sourceCell.Piece !== "none") {
			this.selectPiece(sourceCell);
			if (this.SelectedPieceMovement.some(([x, y]) => destCell.X === x && destCell.Y === y)) {
				let piece = sourceCell.Piece;
				sourceCell.removePiece();
				destCell.placePiece(piece);
				return;
			}
		}
		console.log("Invalid move");
	},
	movePieceAt(sourceCoords, destCoords, freeMove) {
		let sourceCell = this.Cells[sourceCoords[1]][sourceCoords[0]];
		let destCell = this.Cells[destCoords[1]][destCoords[0]];
		this.movePiece(sourceCell, destCell, freeMove);
	},

	findKings() {
		this.Kings = this.flatCells.filter(cell => cell.Piece.Name === "king").map(cell => cell.Piece);
	},

	cellFromXY(x, y) {
		return this.isInBounds(x, y) ? this.Cells[y][x] : null;
	},

	dangerCheck() {
		this.findKings();
		this.Check = this.Kings.filter(king => this.isPieceTargeted(king)).map(king => `${king.Color} king is under attack!`).join('\n');
	},

	isPieceTargeted(piece) {
		let cell = this.cellFromXY(piece.X, piece.Y);
		cell.resetTarget();
		return this.flatCells.some(otherCell => otherCell.Piece.Color !== piece.Color && this.cellFromXY(otherCell.Piece.X, otherCell.Piece.Y).Target);
	},

	deselectPiece() {
		this.SelectedPiece = "none";
		this.resetTargets();
	}
}

const timerPrototype = {
	Color: "white",
	StartQuantity: 600,
	CurrentQuantity: 600,
	IncrementQuantity: 0,
	UpdateInterval: 500,
	Interval: null,
	Pause: false,

	decrement(timer) {
		let currentTime = Date.now();
		if (!timer.Pause) {
			let elapsedTime = (currentTime - timer.LastTime) / 1000;
			timer.CurrentQuantity -= elapsedTime;
		}
		timer.LastTime = currentTime;
	},

	startTimer() {
		this.LastTime = Date.now();
		this.Interval = setInterval(this.decrement, this.UpdateInterval, this);
	},

	increment() {
		this.CurrentQuantity += this.IncrementQuantity;
	},

	pause() {
		this.Pause = true;
	},

	unpause() {
		this.Pause = false;
	}
}

function Timer(color = "white", startQuantity = 600, incrementQuantity = 0, updateInterval = 100, instaStart = false) {
	const timer = Object.create(timerPrototype);
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
	const board = Object.create(boardPrototype);
	board.rows = numRows;
	board.columns = numCols;
	board.Cells = createArray(numRows, numCols);
	for (let y = 0; y < numRows; y++) {
		for (let x = 0; x < numCols; x++) {
			let color = (x + y) % 2 === 0 ? "white" : "black";
			board.Cells[y][x] = Cell(color, x, y, numRows, numCols);
		}
	}
	board.flatCells = board.Cells.flat();
	board.autoPlace();
	return board;
}

function DefaultGame() {
	let game = Object.create(gameControllerPrototype);
	game.Board = Board(8, 8);
	return game;
}

function Cell(color, x, y, boardRows, boardColumns) {
	let cell = Object.create(cellPrototype);
	cell.Color = color;
	cell.X = x;
	cell.Y = y;
	cell.BoardRows = boardRows;
	cell.BoardColumns = boardColumns;
	return cell;
}

function createArray(length, ...args) {
	return Array.from({
		length
	}, () => args.length ? createArray(...args) : undefined);
}

const gameControllerPrototype = {
	Mode: "normal",
	Turn: "white",
	Check: "none",
	Board: null,
	Play: false,
	TurnComplete: false,
	whiteTimer: Timer(),
	blackTimer: Timer("black"),
	pieceSelected: false,
	selectPiece(cell) {
		if (cell.Piece.Color === this.Turn) {
			this.Board.selectPiece(cell);
			return true;
		} else {
			console.log("Incorrect color");
			return false;
		}
	},

	selectPieceXY(x, y) {
		const cell = this.Board.cellFromXY(x, y);
		if (cell) this.selectPiece(cell);
	},

	placePiece(cell) {
		if (cell.Target) {
			cell.placePiece(this.Board.SelectedPiece);
			this.endTurn();
		} else {
			console.log("Cell not a target");
			this.Board.deselectPiece();
		}
	},

	endTurn() {
		console.log(`end turn called`);
		if (this.Turn === "white") {
			console.log(`Ending white turn`);
			this.whiteTimer.pause();
			this.Turn = "black";
			this.blackTimer.unpause();
		} else {
			this.blackTimer.pause();
			this.Turn = "white";
			this.whiteTimer.unpause();
		}
	},

	logGame() {
		console.log(JSON.stringify(this, null, 1));
		this.Board.logBoard();
	},

	startGame() {
		this.Play = true;
		this.whiteTimer.startTimer();
	},

	CLI() {
		this.Board.deselectPiece();
		this.startGame();
		while (this.Play) {
			console.log(`turn: ${this.Turn}`);
			this.Board.logBoard();
			this.getPieceSelection();
			this.getPlacementSelection();
		}
		this.Play = false;
	},
	getPieceSelection() {
		this.pieceSelected = false;
		while (!this.pieceSelected) {
			let userPieceSelection = prompt(`Please select a piece (0-${this.Board.rows - 1}, 0-${this.Board.columns - 1})`);
			if (userPieceSelection === "q") {
				this.pieceSelected = true;
				return;
			}
			try {
				let [pieceX, pieceY] = userPieceSelection.split(",").map(Number);
				this.selectPieceXY(pieceX, pieceY);
				if (this.Board.SelectedPiece !== "none") {
					this.pieceSelected = true;
					this.Board.logBoardTargets();
				}
			} catch (err) {
				console.log("Please enter a valid piece\n" + err);
			}
		}
	},
	getPlacementSelection() {
		let piecePlaced = false;
		while (!piecePlaced) {
			let userPlacementSelection = prompt(`Please select where to place the piece (0-${this.Board.rows - 1}, 0-${this.Board.columns - 1}) or type 'q' to cancel:`);
			if (userPlacementSelection.toLowerCase() === "q") {
				console.log("Placement canceled.");
				break;
			}
			try {
				const [placeX, placeY] = userPlacementSelection.split(",").map(Number);
				let cell = this.Board.cellFromXY(placeX, placeY);
				if (cell) {
					piecePlaced = cell.Target; // If the cell is a valid target, the piece is placed.
					if (piecePlaced) {
						this.Board.captureSelectedPiece();
						this.placePiece(cell);
						this.Board.deselectPiece();
						console.log("Piece placed.");
						break;
					} else {
						console.log("Cell not a valid target. Try again.");
					}
				}
			} catch (err) {
				console.log(err);
				console.log("Please enter a valid placement position or 'q' to quit.");
			}
		}
	}
}

function toAlgebraic(x, y) {
	const alphabet = "abcdefghijklmnopqrstuvwxyz";
	let col = '';
	while (x >= 0) {
		col = alphabet[x % 26] + col;
		x = Math.floor(x / 26) - 1;
	}
	return col + (y + 1);
}

function fromAlgebraic(algebraic) {
	const alphabet = "abcdefghijklmnopqrstuvwxyz";
	let x = 0,
		y = 0;
	for (let i = 0; i < algebraic.length; i++) {
		if (!isNaN(algebraic[i])) {
			y = parseInt(algebraic.slice(i)) - 1;
			break;
		}
		x = x * 26 + alphabet.indexOf(algebraic[i].toLowerCase()) + 1;
	}
	return [x - 1, y];
}


let game = DefaultGame();
game.CLI();
console.log(toAlgebraic(0, 0)); // should print "a1"
console.log(toAlgebraic(3, 7)); // should print "d8"
console.log(toAlgebraic(25, 0)); // should print "z1"
console.log(toAlgebraic(26, 0)); // should print "aa1"
console.log(fromAlgebraic("a1")); // should print [0, 0]
console.log(fromAlgebraic("d8")); // should print [3, 7]
console.log(fromAlgebraic("z1")); // should print [25, 0]
