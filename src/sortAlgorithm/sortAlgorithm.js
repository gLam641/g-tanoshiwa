import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { Grid, Button, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { COLOR_NETURAL, bubbleSort, insertionSort, selectionSort, mergeSort, quickSort } from '../utils/sort.js';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';

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

export default function Algorithm() {
    const classes = useStyles();
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [context, setContext] = useState(null);

    const [origArr, setOrigArr] = useState(null);
    const arrMax = useRef(0);
    const sortMemo = useRef([]);

    const [algorithm, setAlgorithm] = useState("bubble");
    const [renderDelay, setSortDelay] = useState(100);
    const [size, setSize] = useState(10);
    const [stepper, setStepper] = useState(0);
    const stepperInput = useRef(null);
    const [runtime, setRuntime] = useState(0);

    const renderArray = useCallback((array, max) => {
        const rect_width = Math.round(canvas.width / array.length);
        const rect_height = Math.round(canvas.height / max);
        context.fillStyle = 'rgb(255, 255, 255)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // static drawings
        const rect = new Path2D();
        rect.rect(0, 0, rect_width, rect_height);

        array.forEach((renderObj, i) => {
            context.save();
            context.fillStyle = renderObj.color;
            context.translate(rect_width * i, canvas.height - rect_height * renderObj.val);
            context.scale(1, renderObj.val);
            context.fill(rect);
            context.restore();
        });
    }, [canvas, context]);

    const renderMemo = (renderIndex = 0) => {
        if (canvas && context) {
            stepperInput.current.value = renderIndex;
            renderArray(sortMemo.current[renderIndex], arrMax.current);
            if (renderIndex < sortMemo.current.length - 1) {
                setTimeout(() => { renderMemo(renderIndex + 1) }, renderDelay);
            } else {
                setStepper(renderIndex);
            }
        } else {
            setTimeout(() => { renderMemo(renderIndex) }, renderDelay);
        }
    }

    const onRun = () => {
        let sortAlgoithm;
        switch (algorithm) {
            case 'bubble':
                sortAlgoithm = bubbleSort;
                break;
            case 'insertion':
                sortAlgoithm = insertionSort;
                break;
            case 'selection':
                sortAlgoithm = selectionSort;
                break;
            case 'merge':
                sortAlgoithm = mergeSort;
                break;
            case 'quick':
                sortAlgoithm = quickSort;
                break;
            default:
                sortAlgoithm = bubbleSort;
        }

        const sortMemoTemp = [];
        const lon = Array.from(origArr);
        const startTime = new Date();
        sortAlgoithm(lon, (list) => {
            sortMemoTemp.push(list);
        });
        setRuntime(new Date() - startTime);
        sortMemo.current = sortMemoTemp;

        renderMemo(0);
    }

    const resetValues = () => {
        sortMemo.current = [];
        setRuntime(0);
        setStepper(0);
        stepperInput.current.value = 0;
    };

    const onAlgorithmChange = (ev) => {
        setAlgorithm(ev.target.value);
        resetValues();
    }

    const onSizeChange = (ev) => {
        if (size !== ev.target.value) {
            setSize(ev.target.value);
            resetValues();
            const newArr = generateListOfNumber(Number(ev.target.value), 100);
            setOrigArr(newArr);
            renderArray(newArr.map(v => {
                return {
                    val: v,
                    color: COLOR_NETURAL,
                }
            }), arrMax.current);
        }
    }

    const onSortDelayChange = (ev) => {
        setSortDelay(ev.target.value);
    }

    const onPrev = (ev) => {
        if (stepper > 0) {
            let newStepperVal = stepper - 1;
            stepperInput.current.value = newStepperVal;
            setStepper(newStepperVal);
            renderArray(sortMemo.current[newStepperVal], arrMax.current);
        }
    }

    const onNext = (ev) => {
        if (stepper < sortMemo.current.length - 1) {
            let newStepperVal = stepper + 1;
            stepperInput.current.value = newStepperVal;
            setStepper(newStepperVal);
            renderArray(sortMemo.current[newStepperVal], arrMax.current);
        }
    }

    const onStepperChange = (ev) => {
        if (isNaN(ev.target.value)) {
            stepperInput.current.value = stepper ? stepper : 0;
        } else {
            let newStepperVal = Number(ev.target.value);
            newStepperVal = Math.max(0, newStepperVal);
            newStepperVal = Math.min(newStepperVal, sortMemo.current.length - 1);
            setStepper(newStepperVal);
            stepperInput.current.value = newStepperVal;
            renderArray(sortMemo.current[newStepperVal], arrMax.current);
        }
    }

    const generateListOfNumber = (n, max) => {
        const list_of_numbers = [];
        let highest_val = 0;
        for (let i = 0; i < n; ++i) {
            const new_val = Math.floor(Math.random() * max);
            if (highest_val < new_val) highest_val = new_val;
            list_of_numbers.push(new_val);
        }
        arrMax.current = highest_val;
        return list_of_numbers;
    }

    useEffect(() => {
        const newArr = generateListOfNumber(10, 100);
        setOrigArr(newArr);
    }, []);

    useEffect(() => {
        if (canvasRef && canvasRef.current !== null) {
            setCanvas(canvasRef.current);
            setContext(canvasRef.current.getContext('2d'));
        }
    }, [canvas, context]);

    useLayoutEffect(() => {
        const updateCanvasSize = () => {
            if (canvasRef && canvasRef.current !== null) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight - document.querySelector('#algo_controls').offsetHeight - document.querySelector('#app_bar').offsetHeight;
                if (sortMemo && sortMemo.current.length > 0) {
                    renderArray(sortMemo.current[Number(stepperInput.current.value)], arrMax.current);
                } else if (origArr !== null) {
                    renderArray(origArr.map(v => {
                        return {
                            val: v,
                            color: COLOR_NETURAL,
                        }
                    }), arrMax.current);
                }
            }
        }
        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize();
        return () => window.removeEventListener('resize', updateCanvasSize);
    }, [renderArray, origArr, stepperInput]);

    return (
        <Grid container className={classes.root}>
            <Grid id="algo_controls" className={classes.controlClass} item xs={12}>
                <Grid className={classes.controlRowClass} container item>
                    <Grid container xs={4} alignItems="center" justify="center">
                        <FormControl >
                            <Select
                                value={algorithm}
                                onChange={onAlgorithmChange}
                                name="algorithm"
                                inputProps={{ 'aria-label': 'algorithm' }}
                            >
                                <MenuItem value={"bubble"}>Bubble</MenuItem>
                                <MenuItem value={"insertion"}>Insertion</MenuItem>
                                <MenuItem value={"selection"}>Selection</MenuItem>
                                <MenuItem value={"merge"}>Merge</MenuItem>
                                <MenuItem value={"quick"}>Quick</MenuItem>
                            </Select>
                            <FormHelperText>Algorithm</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid container item xs={4} alignItems="center" justify="center">
                        <FormControl >
                            <Select
                                value={size}
                                onChange={onSizeChange}
                                name="size"
                                inputProps={{ 'aria-label': 'size' }}
                            >
                                {
                                    Array.from([...Array(101).keys()]).map(i => {
                                        if (i === 0) return '';
                                        return <MenuItem key={'size_' + i} value={i}>{i}</MenuItem>
                                    })
                                }
                            </Select>
                            <FormHelperText>Size</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid container item xs={4} alignItems="center" justify="center">
                        <FormControl >
                            <Select
                                value={renderDelay}
                                onChange={onSortDelayChange}
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
                </Grid>
                <Grid className={classes.controlRowClass} container item alignItems="center">
                    <Grid container item xs={3} sm={4} justify="center" style={{ padding: "0 0.5em" }}>
                        <TextField
                            label="Runtime (ms)"
                            value={runtime}
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Grid>
                    <Grid container item xs={6} sm={4} alignItems="center" justify="center">
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
                    <Grid container item xs={3} ms={4} justify="center">
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