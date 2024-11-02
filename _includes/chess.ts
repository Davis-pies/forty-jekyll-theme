const prompt = require("prompt-sync")();

class Piece {
    X: number;
    Y: number;
    Name: string;
    Color: string;
    Symbol: string;
    Selected: boolean;
    Movement: Movement[];
    HasMoved: boolean;
    BoardRows: number;
    BoardColumns: number;

    constructor(type: string, color: string) {
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
        const symbols: { [key: string]: string } = {
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

    move(x: number, y: number) {
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
    X: number;
    Y: number;
    Type: string;
    Attack: boolean;
    AttackOnly: boolean;

    constructor(x = 0, y = 0, type = "int", attack = true, attackOnly = false) {
        this.X = x;
        this.Y = y;
        this.Type = type;
        this.AttackOnly = attackOnly;
        this.Attack = attack;
    }
    static MovementFromArray(movementArray: number[][], type = "int", attack = true, attackOnly = false): Movement[] {
        let returnArray: Movement[] = [];
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
    X: number;
    Y: number;
    Color: string;
    Piece: Piece | "none";
    Target: boolean;
    Occupied: boolean;
    BoardRows: number;
    BoardColumns: number;
    EnPassant: boolean;

    constructor(color: string, x: number, y: number, boardRows: number, boardColumns: number) {
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

    placePiece(piece: Piece) {
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
    rows: number;
    columns: number;
    Cells: Cell[][];
    flatCells: Cell[];
    SelectedPiece: Piece | "none";
    Check: string;
    Kings: Piece[];
    SelectedPieceMovement: number[][];

    constructor(numRows: number, numCols: number) {
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

    createArray(length: number, ...args: any[]): any[] {
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

    placePiece(piece: Piece, x: number, y: number) {
        this.Cells[x][y].placePiece(piece);
    }

    logBoardTargets() {
        console.log(this.Cells.map(row => row.map(cell => cell.Target ? `[T]` : "[ ]").join("")).join("\n"));
    }

    autoPlace() {
        const placeMainPieces = (row: number, color: string) => {
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

        const placePawns = (row: number, color: string) => {
            for (let col = 0; col < this.columns; col++) {
                this.Cells[row][col].placePiece(new Piece("pawn", color));
            }
        };

        placeMainPieces(0, "black");
        placePawns(1, "black");

        placePawns(this.rows - 2, "white");
        placeMainPieces(this.rows - 1, "white");
    }

    selectPiece(Cell: Cell) {
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
        this.SelectedPieceMovement = [];
        this.SelectedPiece.Movement.forEach((movementObject) => {
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
    handleIntMovement(movementObject: Movement) {
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

    handleDirMovement(movementObject: Movement) {
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
    isInBounds(x: number, y: number) {
        return x >= 0 && x < this.columns && y >= 0 && y < this.rows;
    }
    isValidPlacement(movementObject: Movement, x: number, y: number) {
        console.log(`x: ${x}, y: ${y}`);
        console.log(`is valid placement called`);
        let targetCell = this.cellFromXY(x, y);
        let targetPiece = targetCell.Piece;
        let selectedPieceName = this.SelectedPiece.Name;
        console.log(`selected piece: ${selectedPieceName}`);
        let result = false;
        if (targetCell.Occupied && movementObject.Attack && targetPiece.Color != this.SelectedPiece.Color) {
            console.log("space occupied, different color, and piece attacks");
            result = true;
            return result;
        } else if (!targetCell.Occupied && !movementObject.AttackOnly) {
            console.log("unoccupied and not exclusive attack");
            result = true;
