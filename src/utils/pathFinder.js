const isDebug = false;

/*
 *  Input:
 *      row:   int
 *      col:   int
 *      start: [row: int, col: int]
 *      end:   [row: int, col: int]
 */
export class Board {
    constructor(row, col, start, end) {
        this.row = row;
        this.col = col;
        this.start = start;
        this.end = end;
        this.obstacles = [];
        this.tiles = [...Array(row)].map(e => Array(col));

        if (!this.isValid(this.start) || !this.isValid(this.end)) {
            throw new Error("Invalid start and/or end nodes: out of bounds");
        } else if (this.start[0] === this.end[0] && this.start[1] === this.end[1]) {
            throw new Error("Invalid start and/or end nodes: start cannot be the same as end");
        }

        this.obstacles = [];
        this.resetBoard();
    }

    resetBoard() {
        for (let r = 0; r < this.row; ++r) {
            for (let c = 0; c < this.col; ++c) {
                let val = '-';
                if (this.isStart([r, c])) {
                    val = 'S';
                } else if (this.isEnd([r, c])) {
                    val = 'E';
                }
                this.tiles[r][c] = val;
            }
        }

        for (let i = 0; i < this.obstacles.length; ++i) {
            const [obs_row, obs_col] = this.obstacles[i];
            this.tiles[obs_row][obs_col] = 'X';
        }
    }

    setTile(tile, val) {
        if (this.isValid(tile)) {
            let local_tile = this.tiles[tile[0]][tile[1]];
            if (local_tile !== 'S' &&
                local_tile !== 'E') {
                this.tiles[tile[0]][tile[1]] = val;
                return true;
            }
        }
        return false;
    }

    isWithinBounds(tile) {
        const [r, c] = tile;
        if (r >= 0 && r < this.row &&
            c >= 0 && c < this.col) {
            return true;
        }
        return false;
    }

    // Check if tile is within the boundaries of the board and is not an obstacle
    isValid(tile) {
        const [r, c] = tile;
        if (this.isWithinBounds(tile) &&
            this.tiles[r][c] !== 'X') {
            return true;
        }
        return false;
    }

    isStart(tile) {
        return this.start[0] === tile[0] && this.start[1] === tile[1];
    }

    isEnd(tile) {
        return this.end[0] === tile[0] && this.end[1] === tile[1];
    }

    setStart(tile) {
        if (this.isValid(tile)) {
            if (this.start) {
                this.tiles[this.start[0]][this.start[1]] = '-';
            }
            this.start = tile;
            this.setTile(tile, 'S');
            return true;
        }
        return false;
    }

    setEnd(tile) {
        if (this.isValid(tile)) {
            if (this.end) {
                this.tiles[this.end[0]][this.end[1]] = '-';
            }
            this.end = tile;
            this.setTile(tile, 'E');
            return true;
        }
        return false;
    }

    randomizeStartEnd() {
        const startRow = Math.floor(Math.random() * this.row);
        const startCol = Math.floor(Math.random() * this.col);
        let endRow = Math.floor(Math.random() * this.row);
        let endCol = Math.floor(Math.random() * this.col);

        while (startRow === endRow && startCol === endCol) {
            endRow = Math.floor(Math.random() * this.row);
            endCol = Math.floor(Math.random() * this.col);
        }

        this.setStart([startRow, startCol]);
        this.setEnd([endRow, endCol]);
    }

    resetObstacles() {
        for (let i = 0; i < this.obstacles.length; ++i) {
            const [obs_row, obs_col] = this.obstacles[i];
            this.tiles[obs_row][obs_col] = '-';
        }
        this.obstacles = [];
    }

    setObstacle(tile, isToggle = false) {
        if (isToggle) {
            const origVal = this.isWithinBounds(tile) ? this.tiles[tile[0]][tile[1]] : null;
            if (origVal === 'X') {
                this.tiles[tile[0]][tile[1]] = '-';
                this.obstacles = this.obstacles.filter((t) => {
                    return t[0] !== tile[0] || t[1] !== tile[1];
                });
                return true;
            }
        }
        if (this.setTile(tile, 'X')) {
            if (this.obstacles.find((obs) => { return obs[0] === tile[0] && obs[1] === tile[1] }) === undefined) {
                this.obstacles.push(tile);
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    setObstacles(tiles, isToggle = false) {
        let isSuccess = true;
        for (let i = 0; i < tiles.length; ++i) {
            isSuccess = isSuccess && this.setObstacle(tiles[i], isToggle);
        }
        return isSuccess;
    }

    randomizeObstacles(minObs = 0) {
        this.resetObstacles();
        let n = Math.floor(Math.random() * (this.row * this.col - minObs)) + minObs;
        // need to account for start and end
        n = Math.min(n, this.row * this.col - 2);

        while (n > 0) {
            const rand_row = Math.floor(Math.random() * this.row);
            const rand_col = Math.floor(Math.random() * this.col);
            if (this.setObstacle([rand_row, rand_col])) {
                --n;
            }
        }
    }

    print() {
        console.log('print');
        let output = [];
        for (let r = 0; r < this.row; ++r) {
            let row = [];
            for (let c = 0; c < this.col; ++c) {
                row.push(this.tiles[r][c]);
            }
            output.push(row.join(' '));
        }
        console.log(output.join("\n"));
    }

    isValidAndUnseen(tile) {
        if (this.isValid(tile) &&
            (this.tiles[tile[0]][tile[1]] === '-' ||
                this.tiles[tile[0]][tile[1]] === 'E')) {
            return true;
        }
        return false;
    }

    generateCurrentBoard() {
        return this.tiles.map(row => row.slice());
    }

    /*
        Algorithm:
            1. Begins with start node and 'open set' candidate nodes
            2. At each step, node with lowest distance from start is examined. The node is marked as closed and all nodes
            adjacent to it are added to open set if they have not been examined
            3. Once destination is found, it is the shortest path
    */
    findDijkstra = (cb) => {
        this.resetBoard();

        // Special case: if start === end
        if (this.start[0] === this.end[0] &&
            this.start[1] === this.end[1]) {
            if (cb) cb(this.generateCurrentBoard());
            return [true, [this.start]];
        } else {
            const open_set = [{ tile: this.start, prev: null }];
            const closed_set = [];

            while (open_set.length > 0) {
                const nearest_set = open_set[0];
                // Found end
                if (this.isEnd(nearest_set.tile)) {
                    const solution = [nearest_set];
                    let current_set = nearest_set;
                    while (current_set.prev !== null) {
                        current_set = closed_set[current_set.prev];
                        if (this.setTile(current_set.tile, 'P')) {
                            if (cb) cb(this.generateCurrentBoard());
                        }
                        solution.push(current_set);
                    }
                    return [true, solution.reverse()];
                } else {
                    if (this.setTile(nearest_set.tile, 'C')) {
                        if (cb) cb(this.generateCurrentBoard());
                    }
                    closed_set.push(open_set.shift());
                    const prev_index = closed_set.length - 1;
                    const up = [nearest_set.tile[0] - 1, nearest_set.tile[1]];
                    const right = [nearest_set.tile[0], nearest_set.tile[1] + 1];
                    const down = [nearest_set.tile[0] + 1, nearest_set.tile[1]];
                    const left = [nearest_set.tile[0], nearest_set.tile[1] - 1];

                    [up, right, down, left].forEach((set, i) => {
                        if (this.isValidAndUnseen(set)) {
                            if (this.setTile(set, 'O')) {
                                if (cb) cb(this.generateCurrentBoard());
                            }
                            open_set.push({ tile: set, prev: prev_index });
                        }
                    });

                }
            }

            // No solution
            return [false, null];
        }
    }

    /*
        Algorithm:
            1. Begins with start node and 'open set' candidate nodes
            2. At each step, node with lowest cost in the open set is checked. 
               Add nodes adjacent to lowest cost node to open set.
            3. Once destination is found, it is a valid path
    */
    findAStar = (cb) => {
        this.resetBoard();

        const generateCost = (node) => {
            return Math.abs(node[0] - this.end[0]) + Math.abs(node[1] - this.end[1]);
        }

        // Special case: if start === end
        if (this.start[0] === this.end[0] &&
            this.start[1] === this.end[1]) {
            if (cb) cb(this.generateCurrentBoard());
            return [true, [this.start]];
        } else {
            let open_set = [{ tile: this.start, prev: null, cost: generateCost(this.start) }];
            const closed_set = [];

            while (open_set.length > 0) {
                const astar_set = open_set[0];
                // Found end
                if (this.isEnd(astar_set.tile)) {
                    const solution = [astar_set];
                    let current_set = astar_set;
                    while (current_set.prev !== null) {
                        current_set = closed_set[current_set.prev];
                        if (this.setTile(current_set.tile, 'P')) {
                            if (cb) cb(this.generateCurrentBoard());
                        }
                        solution.push(current_set);
                    }
                    return [true, solution.reverse()];
                } else {
                    const new_set = [];
                    if (this.setTile(astar_set.tile, 'C')) {
                        if (cb) cb(this.generateCurrentBoard());
                    }
                    closed_set.push(astar_set);
                    const prev_index = closed_set.length - 1;
                    const up = [astar_set.tile[0] - 1, astar_set.tile[1]];
                    const right = [astar_set.tile[0], astar_set.tile[1] + 1];
                    const down = [astar_set.tile[0] + 1, astar_set.tile[1]];
                    const left = [astar_set.tile[0], astar_set.tile[1] - 1];

                    [up, right, down, left].forEach((set, i) => {
                        if (this.isValidAndUnseen(set)) {
                            if (this.setTile(set, 'O')) {
                                if (cb) cb(this.generateCurrentBoard());
                            }
                            new_set.push({ tile: set, prev: prev_index, cost: generateCost(set) });
                        }
                    });
                    new_set.sort((s1, s2) => s1.cost - s2.cost);

                    const new_open_set = [];
                    let i = 1;
                    let j = 0;

                    while (i < open_set.length && j < new_set.length) {
                        if (open_set[i].cost <= new_set[j].cost) {
                            new_open_set.push(open_set[i++]);
                        } else {
                            new_open_set.push(new_set[j++]);
                        }
                    }

                    open_set = new_open_set.concat(open_set.slice(i)).concat(new_set.slice(j));
                }
            }

            // No solution
            return [false, null];
        }
    }
}

if (isDebug) {
    const board = new Board(10, 10, [0, 0], [4, 3]);
    // const board = new Board(5, 5, [0, 0], [4, 3]);
    // const board = new Board(2, 2, [0, 0], [1, 1]);
    // board.print();

    board.randomizeStartEnd();
    board.randomizeObstacles();
    board.print();

    const [has_solution_dijkstra, sol_dijkstra] = board.findDijkstra();
    if (has_solution_dijkstra) {
        console.log('Solution dijkstra', sol_dijkstra);
    } else {
        console.log('No solution for dijkstra');
    }

    const board2 = new Board(10, 10, [0, 0], [4, 3]);
    board2.randomizeStartEnd();
    board2.randomizeObstacles();
    board2.print();

    const [has_solution_astar, sol_astar] = board2.findAStar();
    if (has_solution_astar) {
        console.log('Solution a*', sol_astar);
    } else {
        console.log('No solution for a*');
    }
}