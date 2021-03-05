import React from 'react';
import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { Grid, Button, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Board } from '../utils/pathFinder.js';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

const Alert = React.forwardRef((props, ref) => {
    return <MuiAlert ref={ref} elevation={6} variant="filled" {...props} />;
});

const useStyles = makeStyles((theme) => ({
    root: {
        height: "100%",
    },
    controlClass: {
        background: 'DeepSkyBlue',
    },
    controlRowClass: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        '& *': {
            color: 'white'
        }
    },
    canvasGridClass: {
        width: "100%"
    }
}));

export default function PathFinder() {
    const classes = useStyles();
    const [snackBarMessage, setSnackBarMessage] = useState("");
    const [snackBarSeverity, setSnackBarSeverity] = useState("success");
    const canvasRef = useRef(null);

    const generateRandomStart = (row, col) => {
        const start_row = Math.floor(Math.random() * row);
        const start_col = Math.floor(Math.random() * col);
        return [start_row, start_col];
    }

    const generateRandomEnd = (row, col, start) => {
        let end_row = Math.floor(Math.random() * row);
        let end_col = Math.floor(Math.random() * col);
        while (start[0] === end_row && start[1] === end_col) {
            end_row = Math.floor(Math.random() * row);
            end_col = Math.floor(Math.random() * col);
        }
        return [end_row, end_col];
    };

    const [algorithm, setAlgorithm] = useState("dijkstra");
    const [stepper, setStepper] = useState(0);
    const stepperInput = useRef(null);
    const [runtime, setRuntime] = useState(0);

    const boardMemo = useRef([]);
    const [renderDelay, setRenderDelay] = useState(100);
    const [boardParams, setBoardParams] = useState(() => {
        const row = 5;
        const col = 5;
        const start = generateRandomStart(row, col);
        const end = generateRandomEnd(row, col, start);
        return {
            row,
            col,
            start,
            end
        }
    });
    const [board, setBoard] = useState(
        new Board(...Object.values(boardParams))
    );

    useEffect(() => {
        setBoard(new Board(...Object.values(boardParams)));
    }, [boardParams]);

    const renderBoard = useCallback((board) => {
        const { row, col, start, end } = boardParams;
        // A bit hacky since renderBoard is being called twice.
        // onBoardParamsChange -> boardParams -> LayoutEffect -> renderBoard
        //                     -> useEffect (setBoard) -> LayoutEffect -> renderBoard
        if (canvasRef && canvasRef.current &&
            board && row === board.length &&
            board[0] && col === board[0].length) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d')
            context.fillStyle = 'rgb(255, 255, 255)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            const rect_width = Math.round(canvas.width / col);
            const rect_height = Math.round(canvas.height / row);

            // static drawings
            const rect = new Path2D();
            rect.rect(0, 0, rect_width, rect_height);

            for (let r = 0; r < row; ++r) {
                for (let c = 0; c < col; ++c) {
                    const tileStatus = board[r][c];

                    context.save();
                    context.translate(c * rect_width, r * rect_height);
                    if (tileStatus && tileStatus !== '-') {
                        switch (tileStatus) {
                            case 'S':
                                context.fillStyle = 'rgb(255,0,0)';
                                break;
                            case 'E':
                                context.fillStyle = 'rgb(0,0,255)';
                                break;
                            case 'P':
                                context.fillStyle = 'rgb(0,255,0)';
                                break;
                            case 'O':
                                context.fillStyle = 'rgb(255, 210, 128)';
                                break;
                            case 'C':
                                context.fillStyle = 'rgb(255, 165, 0)';
                                break;
                            case 'X':
                                context.fillStyle = 'rgb(169,169,169)';
                                break;
                            default:
                        }
                        context.fill(rect);
                    }
                    context.stroke(rect);
                    context.restore();
                }
            }

            // Render start and end text
            context.save();
            context.fillStyle = 'rgb(255, 255, 255)';
            context.textAlign = "center";
            context.textBaseline = "middle"
            context.font = String(rect_height / 2) + 'px serif';
            [[start, 'S'], [end, 'E']].forEach(marker => {
                context.save();
                context.translate(marker[0][1] * rect_width + (rect_width / 2), marker[0][0] * rect_height + (rect_height / 2));
                context.fillText(marker[1], 0, 0);
                context.restore();
            });
            context.restore();
        }
    }, [boardParams]);

    const renderMemo = (renderIndex = 0) => {
        if (canvasRef && canvasRef.current) {
            stepperInput.current.value = renderIndex;
            renderBoard(boardMemo.current[renderIndex]);
            if (renderIndex < boardMemo.current.length - 1) {
                setTimeout(() => { renderMemo(renderIndex + 1) }, renderDelay);
            } else {
                setStepper(renderIndex);
            }
        } else {
            setTimeout(() => { renderMemo(renderIndex) }, renderDelay);
        }
    }

    const onRun = () => {
        const startTime = new Date();
        const newBoardMemo = [];
        let isSolutionFound = null;
        let algoPath = null;
        if (algorithm === 'dijkstra') {
            [isSolutionFound, algoPath] = board.findDijkstra((board) => {
                newBoardMemo.push(board);
            });
        } else if (algorithm === 'astar') {
            [isSolutionFound, algoPath] = board.findAStar((board) => {
                newBoardMemo.push(board);
            });
        }
        if (isSolutionFound) {
            setSnackBarMessage(`Solution found! Path has ${algoPath.length} steps.`);
            setSnackBarSeverity("success");
        } else {
            setSnackBarMessage(`No solution found!`);
            setSnackBarSeverity("error");
        }
        boardMemo.current = newBoardMemo;
        setRuntime(new Date() - startTime);
        renderMemo();
    }

    const resetValues = () => {
        boardMemo.current = [];
        setRuntime(0);
        setStepper(0);
        stepperInput.current.value = 0;
    };

    const onAlgorithmChange = (ev) => {
        resetValues();
        setAlgorithm(ev.target.value);
    }

    const onBoardParamsChange = (ev) => {
        if (ev.target.value) {
            let { row, col, start, end } = boardParams;
            switch (ev.target.name) {
                case 'startRow':
                    start = [ev.target.value, start[1]];
                    break;
                case 'startCol':
                    start = [start[0], ev.target.value];
                    break;
                case 'endRow':
                    end = [ev.target.value, end[1]];
                    break;
                case 'endCol':
                    end = [end[0], ev.target.value];
                    break;
                case 'row':
                    start = [Math.min(ev.target.value - 1, start[0]), start[1]];
                    end = [Math.min(ev.target.value - 1, end[0]), end[1]];
                    row = ev.target.value;
                    break;
                case 'col':
                    start = [start[0], Math.min(ev.target.value - 1, start[1])];
                    end = [end[0], Math.min(ev.target.value - 1, end[1])];
                    col = ev.target.value;
                    break;
                default:
            }
            // If start and stop have the same value, do not update 
            if (start[0] === end[0] && start[1] === end[1]) {
                setSnackBarMessage("Start and End must have a different row, col pair");
                setSnackBarSeverity("warning");
                return;
            }
            resetValues();
            setBoardParams({
                row,
                col,
                start,
                end
            });
        }
    }

    const onRandomizeStartEnd = () => {
        const row = boardParams.row;
        const col = boardParams.col;
        const start = generateRandomStart(row, col);
        const end = generateRandomEnd(row, col, start);
        resetValues();
        setBoardParams({
            row,
            col,
            start,
            end
        });
    }

    const onRenderDelayChange = (ev) => {
        setRenderDelay(ev.target.value);
    }

    const onPrev = (ev) => {
        if (stepper > 0) {
            let newStepperVal = stepper - 1;
            stepperInput.current.value = newStepperVal;
            setStepper(newStepperVal);
            renderBoard(boardMemo.current[newStepperVal]);
        }
    }

    const onNext = (ev) => {
        if (stepper < boardMemo.current.length - 1) {
            let newStepperVal = stepper + 1;
            stepperInput.current.value = newStepperVal;
            setStepper(newStepperVal);
            renderBoard(boardMemo.current[newStepperVal]);
        }
    }

    const onStepperChange = (ev) => {
        if (isNaN(ev.target.value)) {
            stepperInput.current.value = stepper ? stepper : 0;
        } else {
            let newStepperVal = Number(ev.target.value);
            newStepperVal = Math.max(0, newStepperVal);
            newStepperVal = Math.min(newStepperVal, boardMemo.current.length - 1);
            setStepper(newStepperVal);
            stepperInput.current.value = newStepperVal;
            renderBoard(boardMemo.current[newStepperVal]);
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        let canvasMouseCoord = { up: null, down: null };

        const handleMouseDown = (p) => {
            canvasMouseCoord.down = [p.offsetX, p.offsetY];
        };

        const handleMouseUp = (p) => {
            if (canvasRef && canvasRef.current && board) {
                const newObstacles = [];
                const rect_width = Math.round(canvas.width / boardParams.col);
                const rect_height = Math.round(canvas.height / boardParams.row);

                const minRow = Math.floor(Math.min(canvasMouseCoord.down[1], p.offsetY) / rect_height);
                const maxRow = Math.floor(Math.max(canvasMouseCoord.down[1], p.offsetY) / rect_height);
                const minCol = Math.floor(Math.min(canvasMouseCoord.down[0], p.offsetX) / rect_width);
                const maxCol = Math.floor(Math.max(canvasMouseCoord.down[0], p.offsetX) / rect_width);

                for (let r = minRow; r <= maxRow; r++) {
                    for (let c = minCol; c <= maxCol; c++) {
                        newObstacles.push([r, c]);
                    }
                }

                board.setObstacles(newObstacles, true);
                if (boardMemo && boardMemo.current.length > 0) {
                    board.resetBoard();
                    resetValues();
                }
                renderBoard(board.generateCurrentBoard());
            }
        };

        if (canvas) {
            canvas.addEventListener('mousedown', handleMouseDown, false);
            canvas.addEventListener('mouseup', handleMouseUp, false);
        }

        return (() => {
            if (canvas) {
                canvas.removeEventListener('mousedown', handleMouseDown, false);
                canvas.removeEventListener('mouseup', handleMouseUp, false);
            }
        });
    }, [canvasRef, board, boardParams, boardMemo, renderBoard]);


    useLayoutEffect(() => {
        const updateCanvasSize = () => {
            if (canvasRef && canvasRef.current !== null) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight - document.querySelector('#algo_controls').offsetHeight - document.querySelector('#app_bar').offsetHeight;
                if (boardMemo && boardMemo.current.length > 0) {
                    renderBoard(boardMemo.current[Number(stepperInput.current.value)]);
                } else if (board !== null) {
                    renderBoard(board.generateCurrentBoard());
                }
            }
        }
        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize();
        return () => window.removeEventListener('resize', updateCanvasSize);
    }, [renderBoard, board]);

    const closeSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackBarMessage("");
    };

    return (
        <Grid container className={classes.root}>
            <Snackbar open={snackBarMessage !== ""} autoHideDuration={2000} onClose={closeSnackbar}>
                <Alert onClose={closeSnackbar} severity={snackBarSeverity}>
                    {snackBarMessage}
                </Alert>
            </Snackbar>
            <Grid id="algo_controls" className={classes.controlClass} item xs={12}>
                <Grid className={classes.controlRowClass} container item>
                    <Grid container item xs={6} alignItems="center" justify="center">
                        <FormControl >
                            <Select
                                value={algorithm}
                                onChange={onAlgorithmChange}
                                name="algorithm"
                                inputProps={{ 'aria-label': 'algorithm' }}
                            >
                                <MenuItem value={"dijkstra"}>Dijkstra</MenuItem>
                                <MenuItem value={"astar"}>A*</MenuItem>
                            </Select>
                            <FormHelperText>Algorithm</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid container item xs={6} alignItems="center" justify="center">
                        <Grid container item xs={4} justify="center">
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={onPrev}
                            >Prev</Button>

                        </Grid>
                        <Grid container item xs={4} justify="center">
                            <TextField
                                inputRef={stepperInput}
                                id="stepper"
                                label="Stepper"
                                onChange={onStepperChange}
                                helperText={(boardMemo && boardMemo.current && boardMemo.current.length > 0) ? `${stepper}/${boardMemo.current.length - 1}` : ' '}
                                defaultValue={stepper}
                            />
                        </Grid>
                        <Grid container item xs={4} justify="center">
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={onNext}
                            >Next</Button>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid className={classes.controlRowClass} container item>
                    <Grid container item xs={12} md={6} alignItems="center" justify="space-around">
                        <FormControl >
                            <Select
                                value={boardParams.row}
                                onChange={(ev) => onBoardParamsChange(ev)}
                                name="row"
                                inputProps={{ 'aria-label': 'row' }}
                            >
                                {
                                    Array.from([...Array(101).keys()]).map(i => {
                                        if (i === 0) return '';
                                        return <MenuItem key={'row_' + i} value={i}>{i}</MenuItem>
                                    })
                                }
                            </Select>
                            <FormHelperText>Row</FormHelperText>
                        </FormControl>
                        <FormControl >
                            <Select
                                value={boardParams.col}
                                onChange={(ev) => onBoardParamsChange(ev)}
                                name="col"
                                inputProps={{ 'aria-label': 'col' }}
                            >
                                {
                                    Array.from([...Array(101).keys()]).map(i => {
                                        if (i === 0) return '';
                                        return <MenuItem key={'col_' + i} value={i}>{i}</MenuItem>
                                    })
                                }
                            </Select>
                            <FormHelperText>Col</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid container item xs={12} md={6} alignItems="center" justify="space-around">
                        <FormControl >
                            <Select
                                value={boardParams.start[0]}
                                onChange={(ev) => onBoardParamsChange(ev)}
                                name="startRow"
                                inputProps={{ 'aria-label': 'startRow' }}
                            >
                                {
                                    Array.from([...Array(boardParams.row).keys()]).map(i => {
                                        return <MenuItem key={'start_' + i} value={i}>{i}</MenuItem>
                                    })
                                }
                            </Select>
                            <FormHelperText>Start Row</FormHelperText>
                        </FormControl>
                        <FormControl >
                            <Select
                                value={boardParams.start[1]}
                                onChange={(ev) => onBoardParamsChange(ev)}
                                name="startCol"
                                inputProps={{ 'aria-label': 'startCol' }}
                            >
                                {
                                    Array.from([...Array(boardParams.col).keys()]).map(i => {
                                        return <MenuItem key={'start_' + i} value={i}>{i}</MenuItem>
                                    })
                                }
                            </Select>
                            <FormHelperText>Start Col</FormHelperText>
                        </FormControl>
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={onRandomizeStartEnd}
                        >Randomize</Button>
                        <FormControl >
                            <Select
                                value={boardParams.end[0]}
                                onChange={(ev) => onBoardParamsChange(ev)}
                                name="endRow"
                                inputProps={{ 'aria-label': 'endRow' }}
                            >
                                {
                                    Array.from([...Array(boardParams.row).keys()]).map(i => {
                                        return <MenuItem key={'end_' + i} value={i}>{i}</MenuItem>
                                    })
                                }
                            </Select>
                            <FormHelperText>End Row</FormHelperText>
                        </FormControl>
                        <FormControl >
                            <Select
                                value={boardParams.end[1]}
                                onChange={(ev) => onBoardParamsChange(ev)}
                                name="endCol"
                                inputProps={{ 'aria-label': 'endCol' }}
                            >
                                {
                                    Array.from([...Array(boardParams.col).keys()]).map(i => {
                                        return <MenuItem key={'end_' + i} value={i}>{i}</MenuItem>
                                    })
                                }
                            </Select>
                            <FormHelperText>End Col</FormHelperText>
                        </FormControl>
                    </Grid>
                </Grid>
                <Grid className={classes.controlRowClass} container item alignItems="center">
                    <Grid container item xs={4} alignItems="center" justify="center">
                        <FormControl >
                            <Select
                                value={renderDelay}
                                onChange={onRenderDelayChange}
                                name="renderDelay"
                                inputProps={{ 'aria-label': 'renderDelay' }}
                            >
                                {
                                    [0, 5, 20, 50, 100, 200, 400, 1000].map(i => {
                                        return <MenuItem key={'delay_' + i} value={i}>{i}</MenuItem>
                                    })
                                }
                            </Select>
                            <FormHelperText>Delay (ms)</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid container item xs={4} justify="center">
                        <TextField
                            label="Runtime (ms)"
                            value={runtime}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Grid>
                    <Grid container item xs={4} justify="center">
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={onRun}
                        >Run</Button>
                    </Grid>
                </Grid>
            </Grid>
            <Grid className={classes.canvasGridClass} container item>
                <canvas ref={canvasRef} />
            </Grid>
        </Grid >
    );
};
