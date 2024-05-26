const prompt = require("prompt-sync")();

class Piece {
	constructor(type, color) {
		this.X = -1;
		this.Y = -1;
		this.Name = type;
		this.Color = color;
		this.Symbol = " ";
		this.Selected = false;
		this.Movement = [];
		this.HasMoved = false;
		this.BoardRows = 8;
		this.BoardColumns = 8;
		this.assignSymbol();
	}

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
	}

	move(x, y) {
		this.X += x;
		this.Y += y;
	}

	select() {
		this.Selected ? console.log("Piece already selected") : this.Selected = true;
	}

	deselect() {
		this.Selected ? this.Selected = false : console.log("Piece not selected");
	}

	setMovement() {
		console.log("set movement called");
		this.Movement = [];
		switch (this.Name) {
			case "pawn":
				console.log("case Pawn");
				this.setPawnMovement();
				break;
			case "knight":
				console.log("case Knight");
				this.setKnightMovement();
				break;
			case "king":
				console.log("case King");
				this.setKingMovement();
				break;
			case "queen":
				console.log("case Queen");
				this.setQueenMovement();
				break;
			case "bishop":
				console.log("case Bishop");
				this.setBishopMovement();
				break;
			case "rook":
				console.log("case Rook");
				this.setRookMovement();
				break;
			default:
				break;
		}
	}

	setPawnMovement() {
		let direction = this.Color === "black" ? 1 : -1;
		let step1 = new Movement(0, direction, "int", false);
		this.Movement.push(step1);
		if ((this.Color === "black" && this.Y === 1) || (this.Color === "white" && this.Y === this.BoardRows - 2)) {
			let step2 = new Movement(0, direction * 2, "int", false);
			this.Movement.push(step2);
		}
		for (let x of [-1, 1]) {
			let cornerAttack = new Movement(x, direction, "int", true, true);
			this.Movement.push(cornerAttack);
		}
	}

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
		let movements = Movement.MovementFromArray(knightMoves);
		this.Movement.push(...movements);
	}

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
		let movements = Movement.MovementFromArray(kingMoves);
		this.Movement.push(...movements);
	}
	setBishopMovement() {
		const bishopMoves = [
			[1, 1],
			[1, -1],
			[-1, 1],
			[-1, -1]
		];
		let movements = Movement.MovementFromArray(bishopMoves, "dir");
		this.Movement.push(...movements);
	}
	setRookMovement() {
		const rookMoves = [
			[0, 1],
			[1, 0],
			[-1, 0],
			[0, -1]
		];
		let movements = Movement.MovementFromArray(rookMoves, "dir");
		this.Movement.push(...movements);
	}
	setQueenMovement() {
		const queenMoves = [
			[0, 1],
			[1, 0],
			[-1, 0],
			[0, -1],
			[1, 1],
			[1, -1],
			[-1, 1],
			[-1, -1]

		];
		let movements = Movement.MovementFromArray(queenMoves, "dir");
		this.Movement.push(...movements);
	}


}

class Movement {
	constructor(x = 0, y = 0, type = "int", attack = true, attackOnly = false) {
		this.X = x;
		this.Y = y;
		this.Type = type;
		this.AttackOnly = attackOnly;
		this.Attack = attack;
	}
	static MovementFromArray(movementArray, type = "int", attack = true, attackOnly = false) {
		let returnArray = [];
		for (let pair of movementArray) {
			let x = pair[0];
			let y = pair[1];
			let newMovement = new Movement(x, y, type, attack, attackOnly);
			returnArray.push(newMovement);
		}
		return returnArray;
	}


}


class Cell {
	constructor(color, x, y, boardRows, boardColumns) {
		this.X = x;
		this.Y = y;
		this.Color = color;
		this.Piece = "none";
		this.Target = false;
		this.Occupied = false;
		this.BoardRows = boardRows;
		this.BoardColumns = boardColumns;
		this.EnPassant = false;
	}

	placePiece(piece) {
		this.Piece = piece;
		this.Occupied = true;
		piece.X = this.X;
		piece.Y = this.Y;
		piece.BoardRows = this.BoardRows;
		piece.BoardColumns = this.BoardColumns;
		piece.setMovement();
		console.log(piece);
	}

	removePiece() {
		this.Piece = "none";
		this.Occupied = false;
	}

	resetTarget() {
		this.Target = false;
	}

	setTarget() {
		this.Target = true;
	}
}

class Board {
	constructor(numRows, numCols) {
		this.rows = numRows;
		this.columns = numCols;
		this.Cells = this.createArray(numRows, numCols);
		for (let y = 0; y < numRows; y++) {
			for (let x = 0; x < numCols; x++) {
				let color = (x + y) % 2 === 0 ? "white" : "black";
				this.Cells[y][x] = new Cell(color, x, y, numRows, numCols);
			}
		}
		this.flatCells = this.Cells.flat();
		this.SelectedPiece = "none";
		this.Check = "none";
		this.Kings = [];
		this.SelectedPieceMovement = [];
		this.autoPlace();
	}

	createArray(length, ...args) {
		return Array.from({
			length
		}, () => args.length ? this.createArray(...args) : undefined);
	}

	logColors() {
		console.log(this.Cells.map(row => row.map(cell => cell.Color[0]).join("")).join("\n"));
	}

	logBoard() {
		console.log(this.Cells.map(row => row.map(cell => cell.Piece.Symbol ? `[${cell.Piece.Symbol}]` : "[ ]").join("")).join("\n"));
	}

	placePiece(piece, x, y) {
		this.Cells[x][y].placePiece(piece);
	}

	logBoardTargets() {
		console.log(this.Cells.map(row => row.map(cell => cell.Target ? `[T]` : "[ ]").join("")).join("\n"));
	}

	autoPlace() {
		const placeMainPieces = (row, color) => {
			const columns = this.columns;
			const mid = Math.floor(columns / 2);

			for (let col = 0; col < columns; col++) {
				if (col === 0 || col === columns - 1) {
					this.Cells[row][col].placePiece(new Piece("rook", color));
				} else if (col === mid) {
					this.Cells[row][col].placePiece(new Piece("king", color));
				} else if (col === mid - 1) {
					this.Cells[row][col].placePiece(new Piece("queen", color));
				} else if ((col < mid && col % 2 === 0) || (col > mid && col % 2 === 1)) {
					this.Cells[row][col].placePiece(new Piece("bishop", color));
				} else {
					this.Cells[row][col].placePiece(new Piece("knight", color));
				}
			}
		};

		const placePawns = (row, color) => {
			for (let col = 0; col < this.columns; col++) {
				this.Cells[row][col].placePiece(new Piece("pawn", color));
			}
		};

		placeMainPieces(0, "black");
		placePawns(1, "black");

		placePawns(this.rows - 2, "white");
		placeMainPieces(this.rows - 1, "white");
	}

	selectPiece(Cell) {
		console.log("select piece called");
		if (Cell.Piece !== "none") {
			this.SelectedPiece = Cell.Piece;
			this.calcMovement();
		} else {
			console.log("no piece in cell");
		}
	}

	captureSelectedPiece() {
		if (this.SelectedPiece !== "none") {
			let x = this.SelectedPiece.X;
			let y = this.SelectedPiece.Y;
			let cell = this.cellFromXY(x, y);
			cell.Piece = "none";
		} else {
			console.log("No piece selected");
		}
	}

	resetTargets() {
		this.flatCells.forEach(cell => cell.resetTarget());
	}

	calcMovement() {
		//console.log("calc movement called");
		this.SelectedPieceMovement = [];
		//console.log(`Selected piece (${this.SelectedPiece.Name}) movement(x,y): ($${this.SelectedPiece.Movement.X}, ${this.SelectedPiece.Movement.Y}`);
		this.SelectedPiece.Movement.forEach((movementObject) => {
			//console.log(`Movement Object x: ${movementObject.X}, Movement Object y: ${movementObject.Y}`);
			switch (movementObject.Type) {
				case "int":
					console.log(`Case: int`);
					this.handleIntMovement(movementObject);
					break;
				case "dir":
					console.log(`Case: dir`);
					this.handleDirMovement(movementObject);
					break;
				default:
					break;
			}
		});

	}
	handleIntMovement(movementObject) {
		console.log("---handle int movement called---");
		let {
			X: xi,
			Y: yi
		} = this.SelectedPiece;

		let {
			X: dx,
			Y: dy,
		} = movementObject;
		let xf = xi + dx;
		let yf = yi + dy;
		if (this.isInBounds(xf, yf)) {
			console.log(`xf: ${xf}, yf: ${yf}`);
			console.log(`valid placement? ${this.isValidPlacement(movementObject,xf,yf)}`);
			console.log(`attack movement? ${movementObject.Attack}`);
			console.log(`unoccupied? ${!this.cellFromXY(xf, yf).Occupied}`);
			if (this.isValidPlacement(movementObject, xf, yf) && (movementObject.Attack ||
					!this.cellFromXY(xf, yf).Occupied)) {
				this.SelectedPieceMovement.push([xf, yf]);
				this.cellFromXY(xf, yf).setTarget();
			}
		}
	}

	handleDirMovement(movementObject) {
		console.log(`Handle dir movement called with x: ${movementObject.X}, y: ${movementObject.Y}`);

		let {
			X: xi,
			Y: yi
		} = this.SelectedPiece;
		let {
			X: dx,
			Y: dy
		} = movementObject;
		let xf = xi + dx;
		let yf = yi + dy;
		let unblocked = true;

		while (this.isInBounds(xf, yf) && this.isValidPlacement(movementObject, xf, yf) &&
			unblocked) {
			this.SelectedPieceMovement.push([xf, yf]);
			this.cellFromXY(xf, yf).setTarget();
			if (this.cellFromXY(xf, yf).Occupied) {
				console.log(`cell at ${xf}, ${yf} is occupied`);
				unblocked = false;
			}
			xf += dx;
			yf += dy;
		}

	}
	isInBounds(x, y) {
		return x >= 0 && x < this.columns && y >= 0 && y < this.rows;
	}
	isValidPlacement(movementObject, x, y) {
		console.log(`x: ${x}, y: ${y}`);
		console.log(`is valid placement called`);
		let targetCell = this.cellFromXY(x, y);
		let targetPiece = targetCell.Piece;
		let selectedPieceName = this.SelectedPiece.Name;
		console.log(`selected piece: ${selectedPieceName}`);
		let result = false;
		if (targetCell.Occupied && movementObject.Attack && targetPiece.color != this.SelectedPiece.Color) {
			console.log("space occupied, different color, and piece attacks");
			result = true;
			return result;
		} else if (!targetCell.Occupied && !movementObject.AttackOnly) {
			console.log("unoccupied and not exclusive attack");
			result = true;
			return result;
		} else if (selectedPieceName == "pawn" && targetCell.EnPassant) {
			console.log("en passant condition met in 'isValidPlacement'");
			result = true;
			return result;
		}
		console.log(`is valid placement: ${result}`);
		return result;
	}
	findKings() {
		this.Kings = this.flatCells.filter(cell => cell.Piece.Name === "king").map(cell => cell.Piece);
	}

	cellFromXY(x, y) {
		return this.isInBounds(x, y) ? this.Cells[y][x] : null;
	}

	dangerCheck() {
		this.findKings();
		this.Check = this.Kings.filter(king => this.isPieceTargeted(king)).map(king => `${king.Color} king is under attack!`).join('\n');
	}

	isPieceTargeted(piece) {
		let cell = this.cellFromXY(piece.X, piece.Y);
		cell.resetTarget();
		return this.flatCells.some(otherCell => otherCell.Piece.Color !== piece.Color && this.cellFromXY(otherCell.Piece.X, otherCell.Piece.Y).Target);
	}

	deselectPiece() {
		this.SelectedPiece = "none";
		this.resetTargets();
	}
}

class Timer {
	constructor(color = "white", startQuantity = 600, incrementQuantity = 0, updateInterval = 100, instaStart = false) {
		this.Color = color;
		this.StartQuantity = startQuantity;
		this.CurrentQuantity = startQuantity;
		this.IncrementQuantity = incrementQuantity;
		this.UpdateInterval = updateInterval;
		this.Interval = null;
		this.Pause = false;
		if (instaStart) {
			this.startTimer();
		}
	}

	decrement(timer) {
		let currentTime = Date.now();
		if (!timer.Pause) {
			let elapsedTime = (currentTime - timer.LastTime) / 1000;
			timer.CurrentQuantity -= elapsedTime;
		}
		timer.LastTime = currentTime;
	}

	startTimer() {
		this.LastTime = Date.now();
		this.Interval = setInterval(this.decrement, this.UpdateInterval, this);
	}

	increment() {
		this.CurrentQuantity += this.IncrementQuantity;
	}

	pause() {
		this.Pause = true;
	}

	unpause() {
		this.Pause = false;
	}
}

class GameController {
	constructor() {
		this.Mode = "normal";
		this.Turn = "white";
		this.Check = "none";
		this.Board = new Board(8, 8);
		this.Play = false;
		this.TurnComplete = false;
		this.whiteTimer = new Timer();
		this.blackTimer = new Timer("black");
		this.pieceSelected = false;
	}

	selectPiece(cell) {
		if (cell.Piece.Color === this.Turn) {
			this.Board.selectPiece(cell);
			return true;
		} else {
			console.log("Incorrect color");
			return false;
		}
	}

	selectPieceXY(x, y) {
		console.log(`selectPieceXY called with X: ${x}, Y: ${y}`);
		const cell = this.Board.cellFromXY(x, y);
		console.log(`Cell has piece ${cell.Piece.Name}`);
		if (cell) this.selectPiece(cell);
	}

	placePiece(cell) {
		if (cell.Target) {
			this.clearEnPassant();
			let previousCell = this.Board.cellFromXY(this.Board.SelectedPiece.X, this.Board.SelectedPiece.Y);
			this.setEnPassantIfNeeded(previousCell, cell);
			cell.placePiece(this.Board.SelectedPiece);
			previousCell.removePiece();
			this.endTurn();
		} else {
			console.log("Cell not a target");
			this.Board.deselectPiece();
		}
	}
	setEnPassantIfNeeded(previousCell, cell) {
		console.log("setEnPassantIfNeeded called");
		let selectedPiece = this.Board.SelectedPiece;
		let cellDiff = cell.Y - previousCell.Y;
		if (selectedPiece.Name == "pawn" && Math.abs(cellDiff == 2)) {
			let dir = cellDiff / 2;
			let midCellY = dir + previousCell.Y;
			let midCell = this.Board.cellFromXY(cell.X, midCellY);
			console.log(`en Passant Condition Set for cell at ${midCell.X}, ${midCell.Y}`);
			midCell.EnPassant = true;
		}
	}
	clearEnPassant() {
		this.Board.flatCells.forEach((cell) => cell.EnPassant = false);
	}

	endTurn() {
		if (this.Turn === "white") {
			this.whiteTimer.pause();
			this.Turn = "black";
			this.blackTimer.unpause();
		} else {
			this.blackTimer.pause();
			this.Turn = "white";
			this.whiteTimer.unpause();
		}
	}

	logGame() {
		console.log(JSON.stringify(this, null, 1));
		this.Board.logBoard();
	}

	startGame() {
		this.Play = true;
		this.whiteTimer.startTimer();
	}

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
	}
	getPieceSelection() {
		this.pieceSelected = false;
		while (!this.pieceSelected) {
			let userPieceSelection = prompt(`Please select a piece (0-${this.Board.rows - 1}, 0-${this.Board.columns - 1})`);
			if (userPieceSelection === "q") {
				this.pieceSelected = true;
				return;
			}
			try {
				console.log("trying to parse user input");
				let [pieceX, pieceY] = userPieceSelection.split(",").map(Number);
				console.log(`piece X: ${pieceX}, piece Y: ${pieceY}`);
				this.selectPieceXY(pieceX, pieceY);
				if (this.Board.SelectedPiece !== "none") {
					this.pieceSelected = true;
					this.Board.logBoardTargets();
				}
			} catch (err) {
				console.log("Please enter a valid piece\n" + err);
			}
		}
	}
	getPlacementSelection() {
		let piecePlaced = false;
		while (!piecePlaced) {
			let userPlacementSelection = prompt(`Please select where to place the piece (0-${this.Board.rows - 1}, 0-${this.Board.columns - 1}) or type 'q' to cancel:`);
			if (userPlacementSelection.toLowerCase() === "q") {
				console.log("Placement canceled.");
				this.Board.deselectPiece();
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

let game = new GameController();
game.CLI();
console.log(toAlgebraic(0, 0)); // should print "a1"
console.log(toAlgebraic(3, 7)); // should print "d8"
console.log(toAlgebraic(25, 0)); // should print "z1"
console.log(toAlgebraic(26, 0)); // should print "aa1"
console.log(fromAlgebraic("a1")); // should print [0, 0]
console.log(fromAlgebraic("d8")); // should print [3, 7]
console.log(fromAlgebraic("z1")); // should print [25, 0]
