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
		//console.log("set movement called");
		this.Movement = [];
		switch (this.Name) {
			case "pawn":
				//console.log("case Pawn");
				this.setPawnMovement();
				break;
			case "knight":
				//console.log("case Knight");
				this.setKnightMovement();
				break;
			case "king":
				//console.log("case King");
				this.setKingMovement();
				break;
			case "queen":
				//console.log("case Queen");
				this.setQueenMovement();
				break;
			case "bishop":
				//console.log("case Bishop");
				this.setBishopMovement();
				break;
			case "rook":
				//console.log("case Rook");
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
		//console.log(piece);
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
		//console.log("select piece called");
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
					//console.log(`Case: int`);
					this.handleIntMovement(movementObject);
					break;
				case "dir":
					//console.log(`Case: dir`);
					this.handleDirMovement(movementObject);
					break;
				default:
					break;
			}
		});
	}

	handleIntMovement(movementObject) {
		//console.log("---handle int movement called---");
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
			//console.log(`xf: ${xf}, yf: ${yf}`);
			//console.log(`valid placement? ${this.isValidPlacement(movementObject,xf,yf)}`);
			//console.log(`attack movement? ${movementObject.Attack}`);
			//console.log(`unoccupied? ${!this.cellFromXY(xf, yf).Occupied}`);
			if (this.isValidPlacement(movementObject, xf, yf) && (movementObject.Attack ||
					!this.cellFromXY(xf, yf).Occupied)) {
				this.SelectedPieceMovement.push([xf, yf]);
				this.cellFromXY(xf, yf).setTarget();
			}
		}
	}

	handleDirMovement(movementObject) {
		//console.log(`Handle dir movement called with x: ${movementObject.X}, y: ${movementObject.Y}`);
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
		//console.log(`x: ${x}, y: ${y}`);
		//console.log(`is valid placement called`);
		let targetCell = this.cellFromXY(x, y);
		let targetPiece = targetCell.Piece;
		let selectedPieceName = this.SelectedPiece.Name;
		//console.log(`selected piece: ${selectedPieceName}`);
		let result = false;
		if (targetCell.Occupied && movementObject.Attack && targetPiece.Color != this.SelectedPiece.Color) {
			//console.log("space occupied, different color, and piece attacks");
			//console.log(`Selected Piece Color ${this.SelectedPiece.Color}`);
			result = true;
		} else if (!targetCell.Occupied && !movementObject.AttackOnly) {
			//console.log("unoccupied and not exclusive attack");
			result = true;
		} else if (selectedPieceName === "pawn" && targetCell.EnPassant) {
			//console.log("en passant condition met in 'isValidPlacement'");
			result = true;
		}
		//console.log(`is valid placement: ${result}`);
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
		console.log(this.Check);
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
		this.Pause = true;
		if (instaStart) {
			this.startTimer();
		}
	}

	decrement() {
		let currentTime = Date.now();
		//console.log("decrement called");
		if (!this.Pause) {
			let elapsedTime = (currentTime - this.LastTime) / 1000;
			//console.log(elapsedTime);
			this.CurrentQuantity -= elapsedTime;
			//console.log(this.CurrentQuantity);
		}
		this.LastTime = currentTime;
	}

	startTimer() {
		console.log("startTimer called");
		this.LastTime = Date.now();
		this.Interval = setInterval(() => this.decrement(), this.UpdateInterval);
		console.log(this.Interval);
		this.Pause = false;
	}

	increment() {
		this.CurrentQuantity += this.IncrementQuantity;
	}

	pause() {
		console.log(`Pausing ${this.Color} Timer`);
		this.Pause = true;
	}

	unpause() {
		console.log(`Unpausing ${this.Color} Timer`);
		this.Pause = false;
	}

	log() {
		console.log(`Time Remaining: ${this.CurrentQuantity}`);
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
		//console.log(`selectPieceXY called with X: ${x}, Y: ${y}`);
		const cell = this.Board.cellFromXY(x, y);
		//console.log(`Cell has piece ${cell.Piece.Name}`);
		if (cell) this.selectPiece(cell);
	}

	placePiece(cell) {
		if (cell.Target) {
			this.clearEnPassant();
			let previousCell = this.Board.cellFromXY(this.Board.SelectedPiece.X, this.Board.SelectedPiece.Y);
			this.setEnPassantIfNeeded(previousCell, cell);
			cell.placePiece(this.Board.SelectedPiece);
			previousCell.removePiece();
		} else {
			//console.log("Cell not a target");
			this.Board.deselectPiece();
		}
	}

	setEnPassantIfNeeded(previousCell, cell) {
		//console.log("setEnPassantIfNeeded called");
		let selectedPiece = this.Board.SelectedPiece;
		let cellDiff = cell.Y - previousCell.Y;
		if (selectedPiece.Name == "pawn" && Math.abs(cellDiff == 2)) {
			let dir = cellDiff / 2;
			let midCellY = dir + previousCell.Y;
			let midCell = this.Board.cellFromXY(cell.X, midCellY);
			//console.log(`en Passant Condition Set for cell at ${midCell.X}, ${midCell.Y}`);
			midCell.EnPassant = true;
		}
	}

	clearEnPassant() {
		this.Board.flatCells.forEach((cell) => cell.EnPassant = false);
	}

	endTurn() {
		console.log("end turn called...");
		if (this.Turn === "white") {
			console.log("ending white turn");
			this.whiteTimer.pause();
			this.Turn = "black";
			this.blackTimer.unpause();
		} else {
			console.log("ending black turn");
			this.blackTimer.pause();
			this.Turn = "white";
			this.whiteTimer.unpause();
		}
	}

	logGame() {
		this.Board.logBoard();
	}

	startGame() {
		this.Play = true;
		this.whiteTimer.startTimer();
		this.blackTimer.startTimer();
		this.blackTimer.pause();
	}

	async CLI() {
		this.Board.deselectPiece();
		this.startGame();
		while (this.Play) {
			await this.playTurn();
			if (this.Play) {
				this.endTurn();
				// Add a small delay to allow for timer updates
				await new Promise(resolve => setTimeout(resolve, 100));
			}
		}
	}

	async playTurn() {
		console.log(`turn: ${this.Turn}`);
		console.log(`check: ${this.Check}`);
		console.log(`white timer quantity: ${this.whiteTimer.CurrentQuantity}`);
		console.log(`black timer quantity: ${this.blackTimer.CurrentQuantity}`);
		this.Board.logBoard();
		await this.getPieceSelection();
		if (this.Play) {
			await this.getPlacementSelection();
		}
	}

	async getPieceSelection() {
		this.pieceSelected = false;
		while (!this.pieceSelected && this.Play) {
			let userPieceSelection = await this.promptAsync(`Please select a piece (0-${this.Board.rows - 1}, 0-${this.Board.columns - 1})`);
			if (userPieceSelection === "q") {
				this.Play = false;
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
			// Add a small delay to allow for timer updates
			await new Promise(resolve => setTimeout(resolve, 100));
		}
	}

	async getPlacementSelection() {
		let piecePlaced = false;
		while (!piecePlaced && this.Play) {
			let userPlacementSelection = await this.promptAsync(`Please select where to place the piece (0-${this.Board.rows - 1}, 0-${this.Board.columns - 1}) or type 'q' to cancel:`);
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
						this.handlePlacement(cell)
					} else {
						console.log("Cell not a valid target. Try again.");
					}
				}
			} catch (err) {
				console.log(err);
				console.log("Please enter a valid placement position or 'q' to quit.");
			}
			// Add a small delay to allow for timer updates
			await new Promise(resolve => setTimeout(resolve, 100));
		}
	}
	// Helper method to promisify the prompt function
	promptAsync(message) {
		return new Promise((resolve) => {
			resolve(prompt(message));
		});
	}
	
	async testTimersInGame() {
		this.startGame();
		console.log("Game started. White timer running, Black timer paused.");

		// Log initial times
		console.log("Initial times:");
		this.logTimers();

		for (let i = 0; i < 6; i++) {
			// Wait for 2 seconds
			await new Promise(resolve => setTimeout(resolve, 2000));
			console.log(`\nAfter ${(i + 1) * 2} seconds:`);
			this.logTimers();

			// Switch turns
			this.endTurn();
			console.log(`Switched to ${this.Turn}'s turn.`);
		}

		// Stop the game
		this.Play = false;
		this.whiteTimer.pause();
		this.blackTimer.pause();
		console.log("\nGame stopped. Both timers paused.");
		this.logTimers();
	}

	logTimers() {
		console.log(`White timer: ${this.whiteTimer.CurrentQuantity.toFixed(2)}`);
		console.log(`Black timer: ${this.blackTimer.CurrentQuantity.toFixed(2)}`);
	}

	handlePlacement(cell) {
		if (this.enPassantCapture(cell)) {
			let capturePawnCell = this.Board.cellFromXY(cell.X, this.Board.SelectedPiece.Y);
			capturePawnCell.removePiece();
		}
		this.Board.captureSelectedPiece();
		this.placePiece(cell);
		this.Board.deselectPiece();
		console.log("Piece placed.");
	}
	enPassantCapture(cell) {
		if (this.Board.SelectedPiece.Name == "pawn" && !cell.Occupied) {
			return true;
		} else {
			return false;
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


async function testTimer() {
	const whiteTimer = new Timer();
	whiteTimer.startTimer();

	console.log("Initial time:");
	whiteTimer.log();

	await new Promise(resolve => setTimeout(resolve, 5000));
	whiteTimer.pause();
	console.log("After 5 seconds (paused):");
	whiteTimer.log();

	await new Promise(resolve => setTimeout(resolve, 2000));
	whiteTimer.unpause();
	console.log("After 7 seconds (unpaused):");
	whiteTimer.log();

	await new Promise(resolve => setTimeout(resolve, 3000));
	whiteTimer.increment();
	console.log("After 10 seconds (incremented):");
	whiteTimer.log();
}
async function runTimerTest() {
    const game = new GameController();
    await game.testTimersInGame();
}

runTimerTest();



//testTimer();
//let whiteTimer = new Timer("white", 600, 0, 100, true);
//whiteTimer.log();
//setTimeout(() => whiteTimer.pause(), 5000); // Pauses the timer after 5 seconds
//whiteTimer.log();
//setTimeout(() => whiteTimer.unpause(), 7000); // Unpauses the timer after 7 seconds
//whiteTimer.log();
//setTimeout(() => whiteTimer.increment(), 10000); // Increments the timer after 10 seconds
//whiteTimer.log();



let game = new GameController();
game.CLI();
//console.log(toAlgebraic(0, 0)); // should print "a1"
//console.log(toAlgebraic(3, 7)); // should print "d8"
//console.log(toAlgebraic(25, 0)); // should print "z1"
//console.log(toAlgebraic(26, 0)); // should print "aa1"
//console.log(fromAlgebraic("a1")); // should print [0, 0]
//console.log(fromAlgebraic("d8")); // should print [3, 7]
//console.log(fromAlgebraic("z1")); // should print [25, 0]
