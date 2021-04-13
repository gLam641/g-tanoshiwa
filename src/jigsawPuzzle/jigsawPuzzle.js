import React from 'react'; import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import * as io from 'socket.io-client';
import {
    Grid,
    TextField,
    Button,
    Snackbar,
    Dialog,
    DialogTitle,
    Divider,
    Select,
    MenuItem,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';
import SettingsIcon from '@material-ui/icons/Settings';
import PersonIcon from '@material-ui/icons/Person';

import { serverEndPoint } from '../config.js';
import { throttle } from '../utils/throttle.js';
import defaultImg from '../assets/pekora.png';

// Temporary image
const img = new Image();
let isImageReady = false;
img.src = defaultImg;
img.addEventListener('load', (e) => {
    isImageReady = true;
});

// Constants
const orientations = makeEnum(['VERTICAL_UP', 'VERTICAL_DOWN', 'HORIZONTAL_RIGHT', 'HORIZONTAL_LEFT']);
const roundTypes = makeEnum(['INWARD', 'OUTWARD', 'FLAT']);

function makeEnum(arr) {
    let obj = {};
    for (let v of arr) {
        obj[v] = Symbol(v);
    }
    return Object.freeze(obj);
}

// Returns the linear interpolated distance between 2 points
// Input:
//      start : { x: number, y: number }
//      end   : { x: number, y: number }
//      perent: number
// Output:
//      { x: number, y: number }
function lerp(start, end, percent) {
    const yDelta = start.y - end.y;
    const yLerp = start.y - yDelta * percent;
    if (end.x === start.x) {
        return {
            x: start.x,
            y: yLerp
        };
    } else {
        const m = (end.y - start.y) / (end.x - start.x);
        let xLerp;
        if (m === 0) {
            const xDelta = start.x - end.x;
            xLerp = start.x - xDelta * percent;
            return {
                x: xLerp,
                y: start.y
            };
        } else {
            xLerp = start.x + (start.y - yLerp) / m;
        }
        return {
            x: xLerp,
            y: yLerp
        };
    }
}

// Returns the orientation of the line between the start and end points
// Input:
//      start : { x: number, y: number }
//      end   : { x: number, y: number }
// Output:
//      number
function getOrientation(start, end) {
    if (start.x === end.x && start.y === end.y) return false;
    if (start.x === end.x) {
        if (start.y < end.y) return orientations.VERTICAL_DOWN;
        else return orientations.VERTICAL_UP;
    } else {
        if (start.x < end.x) return orientations.HORIZONTAL_RIGHT;
        else return orientations.HORIZONTAL_LEFT;
    }
}

// Returns parameters to generate a Canvas2D Path for a rounded path
// Input:
//      roundType: number
//      start    : { x: number, y: number }
//      end      : { x: number, y: number }
//      radius   : number
function generateRoundedPath(roundType, start, end, radius = 0) {
    const line1End = lerp(start, end, 2 / 5);
    const line2End = lerp(start, end, 3 / 5);
    if (radius === 0) {
        const distance = Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2));
        radius = distance / 3;
    }
    const radiusSmall = radius / 10;
    const center = {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2
    };
    const orient = getOrientation(start, end);
    const roundModifier = roundType === roundTypes.INWARD ? 1 : -1;

    let arcCtrl, arc1End;
    switch (orient) {
        case orientations.HORIZONTAL_RIGHT:
            arcCtrl = {
                x: center.x,
                y: center.y + (roundModifier * radiusSmall),
            };
            arc1End = {
                x: line1End.x,
                y: line1End.y + (roundModifier * radiusSmall * 2),
            };
            break;
        case orientations.HORIZONTAL_LEFT:
            arcCtrl = {
                x: center.x,
                y: center.y - (roundModifier * radiusSmall),
            };
            arc1End = {
                x: line1End.x,
                y: line1End.y - (roundModifier * radiusSmall * 2),
            };
            break;
        case orientations.VERTICAL_DOWN:
            arcCtrl = {
                x: center.x - (roundModifier * radiusSmall),
                y: center.y,
            };
            arc1End = {
                x: line1End.x - (roundModifier * radiusSmall * 2),
                y: line1End.y,
            };
            break;
        case orientations.VERTICAL_UP:
            arcCtrl = {
                x: center.x + (roundModifier * radiusSmall),
                y: center.y,
            };
            arc1End = {
                x: line1End.x + (roundModifier * radiusSmall * 2),
                y: line1End.y,
            };
            break;
        default:
            console.log('Invalid orientation detected');
    }

    const arc1 = {
        c1: arcCtrl,
        c2: arc1End,
        radius: radiusSmall
    };
    const arc2 = {
        c1: arcCtrl,
        c2: line2End,
        radius: radiusSmall
    };

    let bezier;
    switch (orient) {
        case orientations.HORIZONTAL_RIGHT:
            bezier = {
                c1: {
                    x: center.x - radius,
                    y: center.y + (roundModifier * radius),
                },
                c2: {

                    x: center.x + radius,
                    y: center.y + (roundModifier * radius),
                },
                end: {
                    x: line2End.x,
                    y: arc1.c2.y,
                }
            };
            break;
        case orientations.HORIZONTAL_LEFT:
            bezier = {
                c1: {
                    x: center.x + radius,
                    y: center.y - (roundModifier * radius),
                },
                c2: {
                    x: center.x - radius,
                    y: center.y - (roundModifier * radius),
                },
                end: {
                    x: line2End.x,
                    y: arc1.c2.y,
                }
            };
            break;
        case orientations.VERTICAL_DOWN:
            bezier = {
                c1: {
                    x: center.x - (roundModifier * radius),
                    y: center.y - radius,
                },
                c2: {
                    x: center.x - (roundModifier * radius),
                    y: center.y + radius,
                },
                end: {
                    x: arc1.c2.x,
                    y: line2End.y,
                }
            };
            break;
        case orientations.VERTICAL_UP:
            bezier = {
                c1: {
                    x: center.x + (roundModifier * radius),
                    y: center.y + radius,
                },
                c2: {
                    x: center.x + (roundModifier * radius),
                    y: center.y - radius,
                },
                end: {
                    x: arc1.c2.x,
                    y: line2End.y,
                }
            };
            break;
        default:
            console.log('Invalid orientation detected');
    }

    return {
        line1End,
        arc1,
        bezier,
        arc2,
    };
}

// Adds a rounded path to the provided Path
// Input:
//      path     : Path2D
//      roundType: number
//      start    : { x: number, y: number }
//      end      : { x: number, y: number }
function addRoundedPath(path, roundType, start, end) {
    const { line1End, arc1, bezier, arc2 } = generateRoundedPath(roundType, start, end);
    path.lineTo(line1End.x, line1End.y);
    path.arcTo(arc1.c1.x, arc1.c1.y, arc1.c2.x, arc1.c2.y, arc1.radius);
    path.bezierCurveTo(bezier.c1.x, bezier.c1.y, bezier.c2.x, bezier.c2.y, bezier.end.x, bezier.end.y);
    path.arcTo(arc2.c1.x, arc2.c1.y, arc2.c2.x, arc2.c2.y, arc2.radius);
    path.lineTo(end.x, end.y);
}

// Adds a path (one edge of puzzle piece) to the provided Path
// Input:
//      path     : Path2D
//      roundType: number
//      start    : { x: number, y: number }
//      end      : { x: number, y: number }
//      scale    : { x: number, y: number }
function addPath(path, roundType, start, end, scale = { x: 1, y: 1 }) {
    const scaled_start = { x: Math.floor(start.x * scale.x), y: Math.floor(start.y * scale.y) };
    const scaled_end = { x: Math.floor(end.x * scale.x), y: Math.floor(end.y * scale.y) };
    if (roundType === roundTypes.FLAT) {
        path.lineTo(scaled_end.x, scaled_end.y);
    } else {
        addRoundedPath(path, roundType, scaled_start, scaled_end);
    }
}

const Alert = React.forwardRef((props, ref) => {
    return <MuiAlert ref={ref} elevation={6} variant="filled" {...props} />;
});

const useStyles = makeStyles((theme) => ({
    root: {
        height: "100%",
        position: "relative",
    },
    settingsButtonClass: {
        position: "absolute",
        top: theme.spacing(2),
        right: theme.spacing(2)
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
        width: "100%",
        justifyContent: "center"
    },
    dialogMarginClass: {
        marginTop: theme.spacing(3),
    },
}));

export default function JigsawPuzzle() {
    const classes = useStyles();
    const containerRef = useRef(null);

    const [lobby, setLobby] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [isGeneralDialogOpen, setIsGeneralDialogOpen] = useState(true);
    const [isSettingDialogOpen, setIsSettingDialogOpen] = useState(false);
    const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

    const [name, setName] = useState();
    const [image, setImage] = useState();
    const [joinID, setJoinID] = useState();
    const [rowCol, setRowCol] = useState(5);

    const canvasRef = useRef(null);
    const [gameState, setGameState] = useState();
    const [selectedPieceID, setSelectedPieceId] = useState(null);
    const [snackBarMessage, setSnackBarMessage] = useState("");
    const [snackBarSeverity, setSnackBarSeverity] = useState("success");
    const [puzzlePaths, setPuzzlePaths] = useState({});
    const [socket, setSocket] = useState();
    const [roomID, setRoomID] = useState();

    const mouseMoveInterval = 50;

    const getLocalScale = useCallback((state = gameState) => {
        if (canvasRef && canvasRef.current && state) {
            const canvas = canvasRef.current;
            return {
                x: canvas.width / state.gameWidth,
                y: canvas.height / state.gameHeight
            };
        } else {
            return {
                x: 1,
                y: 1
            }
        }
    }, [gameState]);

    const renderPuzzle = useCallback(() => {
        if (canvasRef && canvasRef.current && gameState) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            const localScale = getLocalScale();

            // Draw frame
            // note: Opt not to apply localScale to strokeRect since it also affect stroke width
            context.save();
            context.translate(gameState.frameOffset.x * localScale.x, gameState.frameOffset.y * localScale.y);
            context.strokeStyle = 'black';
            context.strokeRect(0, 0, gameState.frameWidth * localScale.x, gameState.frameHeight * localScale.y);
            context.restore();

            // Draw pieces
            // note: Opt not to apply localScale to clip and drawImage since it also affect stroke width
            if (isImageReady) {
                gameState.pieces.forEach((piece) => {
                    const path = puzzlePaths[piece.id];
                    context.save();
                    context.translate(piece.translate.x * localScale.x, piece.translate.y * localScale.y);
                    context.save();
                    context.clip(path);
                    context.scale(localScale.x, localScale.y);
                    context.drawImage(
                        img,
                        -piece.relativeImageTranslation.x,
                        -piece.relativeImageTranslation.y,
                        gameState.frameWidth,
                        gameState.frameHeight);
                    context.restore();
                    if (piece.isLocked) {
                        context.strokeStyle = 'red';
                    } else if (piece.selectedClient === socket.id) {
                        context.strokeStyle = 'lime';
                    }
                    context.stroke(path);
                    context.restore();
                });
            }

            // Render player names
            if (lobby) {
                context.save();
                context.fillStyle = 'blue';
                context.font = "1.3em Arial";
                lobby.forEach(client => {
                    if (client.id !== socket.id) {
                        context.fillText(client.name, client.x * localScale.x, client.y * localScale.y);
                    }
                });
                context.restore();
            }
        }
    }, [gameState, puzzlePaths, socket, getLocalScale, lobby]);

    useEffect(() => {
        const newSocket = io(serverEndPoint, {
            withCredentials: true,
        });

        const initPuzzlePieces = (state) => {
            const newPuzzlePaths = [];

            const localScale = {
                x: 1,
                y: 1
            }
            if (canvasRef && canvasRef.current && state) {
                const canvas = canvasRef.current;
                localScale.x = canvas.width / state.gameWidth;
                localScale.y = canvas.height / state.gameHeight;
            }

            state.pieces.forEach((piece) => {
                const path = new Path2D();
                path.moveTo(0, 0);
                addPath(path, roundTypes[piece.strPathTypes.top], { x: 0, y: 0 }, { x: piece.width, y: 0 }, localScale);
                addPath(path, roundTypes[piece.strPathTypes.right], { x: piece.width, y: 0 }, { x: piece.width, y: piece.height }, localScale);
                addPath(path, roundTypes[piece.strPathTypes.bottom], { x: piece.width, y: piece.height }, { x: 0, y: piece.height }, localScale);
                addPath(path, roundTypes[piece.strPathTypes.left], { x: 0, y: piece.height }, { x: 0, y: 0 }, localScale);
                newPuzzlePaths[piece.id] = path;
            });
            setPuzzlePaths(newPuzzlePaths);
            setGameState(state);
        }

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log(newSocket.id, newSocket.connected);
        });

        newSocket.on('disconnect', (reason) => {
            console.log(`Disconnected: ${reason}`);
        });

        newSocket.on('createdRoom', (roomID, lobby) => {
            setRoomID(roomID);
            setLobby(lobby);
            setIsHost(true);
            hideAllDialogs();
            setIsSettingDialogOpen(true);
        });

        newSocket.on('joinedRoom', (roomID, lobby, name, userID, state) => {
            console.log(`Joined room: ${roomID}`);
            if (roomID) {
                setRoomID(roomID);
                setLobby(lobby);
                if (newSocket.id === userID) {
                    setIsHost(false);
                    initPuzzlePieces(state);
                    hideAllDialogs();
                    setIsRoomDialogOpen(true);
                }
            } else {
                setSnackBarSeverity("warning");
                setSnackBarMessage(`Join room error: '${name}' is already taken. Please choose a different name`);
            }
        });

        newSocket.on('joinRoomError', (errMsg) => {
            setSnackBarSeverity("warning");
            setSnackBarMessage(errMsg);
        });

        newSocket.on('leftRoom', (lobby, userName) => {
            if (userName !== '') {
                console.log(`User ${userName} left the room`);
            }
            setLobby(lobby);
        });

        newSocket.on('initializedGame', (newState) => {
            initPuzzlePieces(newState);
            hideAllDialogs();
            setIsRoomDialogOpen(true);
        });

        newSocket.on('serverError', (errMsg) => {
            setSnackBarSeverity("error");
            setSnackBarMessage(errMsg);
        });

        newSocket.on('permissionError', (errMsg) => {
            setSnackBarSeverity("warning");
            setSnackBarMessage(errMsg);
        });

        newSocket.on('restartedGame', (newState) => {
            setGameState(newState);
        });

        newSocket.on('selectedPiece', (newState, pieceID) => {
            setSelectedPieceId(pieceID);
            setGameState(newState);
        });

        newSocket.on('mouseMove', (lobby, newState) => {
            setLobby(lobby);
            if (newState) {
                setGameState(newState);
            }
        });

        return () => {
            newSocket.emit('jigsaw:leaveRoom');
        };
    }, [setGameState, setPuzzlePaths]);

    useEffect(() => {
        const canvas = canvasRef.current;

        const handleClick = (e) => {
            if (gameState &&
                puzzlePaths.length > 0 &&
                socket &&
                roomID &&
                canvas) {

                const context = canvas.getContext('2d');

                const localScale = getLocalScale();

                let selectedPiece = null;
                gameState.pieces.forEach((piece) => {
                    const path = puzzlePaths[piece.id];
                    context.save();
                    context.translate(piece.translate.x * localScale.x, piece.translate.y * localScale.y);
                    if (!piece.isLocked &&
                        (piece.selectedClient === null || piece.selectedClient === socket.id) &&
                        context.isPointInPath(path, e.offsetX, e.offsetY)) {
                        if (selectedPiece === null || selectedPiece.lastSelectedTime < piece.lastSelectedTime) {
                            selectedPiece = piece;
                        }
                    }
                    context.restore();
                });

                if (selectedPiece) {
                    socket.emit('jigsaw:click', roomID, selectedPiece.id);
                }
            }
        };

        const handleMouseMove = (e) => {
            if (socket && roomID) {
                const localScale = getLocalScale();
                const posX = e.offsetX / localScale.x;
                const posY = e.offsetY / localScale.y;

                socket.emit('jigsaw:mouseMove', roomID, selectedPieceID, posX, posY);
            }
        };

        const throttledMouseHandler = throttle(handleMouseMove, mouseMoveInterval);

        if (canvas) {
            canvas.addEventListener('click', handleClick);
            canvas.addEventListener('mousemove', throttledMouseHandler);
        }

        return (() => {
            if (canvas) {
                canvas.removeEventListener('click', handleClick);
                canvas.removeEventListener('mousemove', throttledMouseHandler);
            }
        });
    }, [canvasRef, gameState, puzzlePaths, socket, roomID, selectedPieceID, getLocalScale]);

    useLayoutEffect(() => {
        const updateCanvasSize = () => {
            if (canvasRef && canvasRef.current !== null) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight - document.querySelector('#app_bar').offsetHeight;
                // todo: need to regenerate puzzle pieces with the updated canvas size. This appears to be the only 'true'
                // way to keep the stroke width as desired
                renderPuzzle();
            }
        }
        window.addEventListener('resize', updateCanvasSize);
        updateCanvasSize();
        return () => window.removeEventListener('resize', updateCanvasSize);
    }, [renderPuzzle]);

    function closeSnackbar(event, reason) {
        if (reason === 'clickaway') {
            return;
        }

        setSnackBarMessage("");
    };

    // Todo: actually upload an image
    function validateImage() {
        return true;
    };

    function validateRoomID() {
        if (roomID && roomID !== '') {
            return true;
        }

        setSnackBarSeverity("error");
        setSnackBarMessage('RoomID is invalid');
        return false;
    };

    function handleCreateRoom() {
        if (validateSocket('Create room') && validateRoomID() && validateImage()) {
            // todo: upload image and set to url
            const imgUrl = '';
            socket.emit('jigsaw:initGame', roomID, imgUrl, rowCol);
        }
    };

    function handleCancel() {
        hideAllDialogs();
        setIsGeneralDialogOpen(true);
    };

    function handleHostRoom() {
        if (validateName() && validateSocket('Host room')) {
            socket.emit('jigsaw:createRoom', name);
        }
    };

    function handleJoinRoom() {
        if (validateName()) {
            setIsHost(false);
            hideAllDialogs();
            setIsJoinDialogOpen(true);
        }
    };

    function handlePlay() {
        hideAllDialogs();
    };

    function handleRestartGame() {
        if (validateSocket('RestartGame') && validateRoomID()) {
            socket.emit('jigsaw:restartGame', roomID);
        }
    };

    function handleLeaveRoom() {
        if (socket && roomID) socket.emit('jigsaw:leaveRoom', roomID);
        setRoomID(null);
        setIsHost(false);
        hideAllDialogs();
        setIsGeneralDialogOpen(true);
    };

    function validateName() {
        if (name && name !== '') {
            return true;
        }

        setSnackBarSeverity("warning");
        setSnackBarMessage('Please enter a name');
        return false;
    };

    function validateSocket(errType) {
        if (!socket) {
            setSnackBarSeverity("error");
            setSnackBarMessage(errType + ' error: Failed to communicate with the server');
            return false;
        }
        return true;
    };

    function handleJoin() {
        if (validateJoinID() && validateSocket('Join')) {
            socket.emit('jigsaw:joinRoom', joinID, name);
        }
    };

    function validateJoinID() {
        if (joinID && joinID !== '') {
            return true;
        }

        setSnackBarSeverity("warning");
        setSnackBarMessage('Please enter a room id');
        return false;
    };

    function hideAllDialogs() {
        setIsGeneralDialogOpen(false);
        setIsSettingDialogOpen(false);
        setIsRoomDialogOpen(false);
        setIsJoinDialogOpen(false);
    }

    return (
        <Grid ref={containerRef} container className={classes.root}>
            <Snackbar open={snackBarMessage !== ""} autoHideDuration={2000} onClose={closeSnackbar}>
                <Alert onClose={closeSnackbar} severity={snackBarSeverity}>
                    {snackBarMessage}
                </Alert>
            </Snackbar>
            <IconButton
                className={classes.settingsButtonClass}
                aria-label="settings"
                color="primary"
                onClick={() => { hideAllDialogs(); setIsRoomDialogOpen(true); }}>
                <SettingsIcon />
            </IconButton>
            <Grid className={classes.canvasGridClass} container item>
                <canvas ref={canvasRef} />
                <Dialog
                    disableBackdropClick={true}
                    disableEscapeKeyDown={true}
                    open={isGeneralDialogOpen}>
                    <DialogTitle>General Settings</DialogTitle>
                    <Divider />
                    <form noValidate autoComplete="off">
                        <TextField
                            className={classes.dialogMarginClass}
                            label="Name"
                            variant="outlined"
                            fullWidth
                            defaultValue={name}
                            onChange={(e) => { setName(e.target.value) }}
                        />
                        <Button
                            className={classes.dialogMarginClass}
                            variant="contained"
                            fullWidth
                            color="primary"
                            onClick={handleHostRoom}>
                            Host Room
                        </Button>
                        <Button
                            className={classes.dialogMarginClass}
                            variant="contained"
                            fullWidth
                            color="primary"
                            onClick={handleJoinRoom}>
                            Join Room
                        </Button>
                    </form>
                </Dialog>
                <Dialog
                    disableBackdropClick={true}
                    disableEscapeKeyDown={true}
                    open={isSettingDialogOpen}>
                    <DialogTitle>Game Settings</DialogTitle>
                    <Divider />
                    <form noValidate autoComplete="off">
                        <Grid className={classes.dialogMarginClass} container item>
                            <TextField
                                label="Image"
                                variant="outlined"
                                defaultValue={image}
                                onChange={(e) => { setImage(e.target.value) }}
                            />
                            <Button
                                color="primary"
                                variant="contained">
                                Upload
                            </Button>
                            <Select
                                value={rowCol}
                                onChange={(e) => { setRowCol(e.target.value) }}
                                name="rowCol"
                                inputProps={{ 'aria-label': 'rowCol' }}
                            >
                                {
                                    [2, 5, 10, 15, 20, 25].map(i => {
                                        return <MenuItem key={'row_col_' + i} value={i}>{`${i} x ${i}`}</MenuItem>
                                    })
                                }
                            </Select>
                        </Grid>
                        <Button
                            className={classes.dialogMarginClass}
                            variant="contained"
                            fullWidth
                            color="primary"
                            onClick={handleCreateRoom}>
                            Create Room
                        </Button>
                        <Button
                            className={classes.dialogMarginClass}
                            variant="contained"
                            fullWidth
                            color="primary"
                            onClick={handleCancel}>
                            Cancel
                        </Button>
                    </form>
                </Dialog>
                <Dialog
                    open={isRoomDialogOpen}
                    onClose={hideAllDialogs}>
                    <DialogTitle>Room ID: {roomID}</DialogTitle>
                    <Divider />
                    <List component="nav" aria-label="lobby">
                        {
                            lobby.map(client => (
                                <ListItem key={`lobby_client_${client.name}`} button>
                                    <ListItemIcon>
                                        <PersonIcon color={client.role === "host" ? "primary" : "secondary"} />
                                    </ListItemIcon>
                                    <ListItemText primary={client.role === 'host' ? `${client.name} (host)` : client.name} />
                                </ListItem>
                            ))
                        }
                    </List>
                    <Divider />
                    <form noValidate autoComplete="off">
                        <Button
                            className={classes.dialogMarginClass}
                            variant="contained"
                            fullWidth
                            color="primary"
                            onClick={handlePlay}>
                            Play
                        </Button>
                        {
                            isHost ?
                                <Button
                                    className={classes.dialogMarginClass}
                                    variant="contained"
                                    fullWidth
                                    color="primary"
                                    onClick={handleRestartGame}>
                                    Restart Game
                                </Button>
                                :
                                <></>
                        }
                        <Button
                            className={classes.dialogMarginClass}
                            variant="contained"
                            fullWidth
                            color="primary"
                            onClick={handleLeaveRoom}>
                            Leave Room
                        </Button>
                    </form>
                </Dialog>
                <Dialog
                    disableBackdropClick={true}
                    disableEscapeKeyDown={true}
                    open={isJoinDialogOpen}
                    onClose={hideAllDialogs}>
                    <DialogTitle>Join Room</DialogTitle>
                    <Divider />
                    <form noValidate autoComplete="off">
                        <TextField
                            className={classes.dialogMarginClass}
                            label="Room ID"
                            variant="outlined"
                            fullWidth
                            defaultValue={joinID}
                            onChange={(e) => { setJoinID(e.target.value) }}
                        />
                        <Button
                            className={classes.dialogMarginClass}
                            variant="contained"
                            fullWidth
                            color="primary"
                            onClick={handleJoin}>
                            Join
                        </Button>
                        <Button
                            className={classes.dialogMarginClass}
                            variant="contained"
                            fullWidth
                            color="primary"
                            onClick={handleCancel}>
                            Cancel
                        </Button>
                    </form>
                </Dialog>
            </Grid>
        </Grid >
    );
};
