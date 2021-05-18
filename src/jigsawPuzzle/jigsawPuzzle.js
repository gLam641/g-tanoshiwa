import React from 'react'; import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import * as io from 'socket.io-client';
import axios from 'axios';
import moment from 'moment';
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
    FormControl,
    FormHelperText,
    Table,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
    FormControlLabel,
    FormGroup,
    Switch,
    GridList,
    GridListTile,
    GridListTileBar
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';
import SettingsIcon from '@material-ui/icons/Settings';
import ImageIcon from '@material-ui/icons/Image';
import PersonIcon from '@material-ui/icons/Person';
import PublishIcon from '@material-ui/icons/Publish';

import { serverEndPoint } from '../config.js';
import { throttle } from '../utils/throttle.js';
import { debounce } from '../utils/debounce.js';
import { capitalizedWords } from '../utils/string.js';

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
function addRoundedPath(path, roundType, start, end, orthLength) {
    const { line1End, arc1, bezier, arc2 } = generateRoundedPath(roundType, start, end, orthLength / 3);
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
//      orthLength: number
function addPath(path, roundType, start, end, scale, orthLength) {
    const scaled_start = { x: Math.floor(start.x * scale.x), y: Math.floor(start.y * scale.y) };
    const scaled_end = { x: Math.floor(end.x * scale.x), y: Math.floor(end.y * scale.y) };
    if (roundType === roundTypes.FLAT) {
        path.lineTo(scaled_end.x, scaled_end.y);
    } else {
        addRoundedPath(path, roundType, scaled_start, scaled_end, orthLength);
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
    imageButtonClass: {
        position: "absolute",
        top: theme.spacing(8),
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
    imageClass: {
        objectFit: 'contain'
    },
    imageGridClass: props => ({
        display: props.isImageDialogOpen ? 'block' : 'none',
        width: "100%",
        justifyContent: "center"
    }),
    canvasGridClass: props => ({
        display: props.isImageDialogOpen ? 'none' : 'block',
        width: "100%",
        justifyContent: "center"
    }),
    dialogFormFieldClass: {
        display: 'block',
        margin: `${theme.spacing(3)}px auto`,
        width: "90%"
    },
    dialogFormGridClass: {
        margin: `${theme.spacing(3)}px auto`,
        width: "90%"
    },
    gridRootClass: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
    },
    gridListClass: {
        flexWrap: 'nowrap'
    },
    gridListTileBarTitleSelectedClass: {
        color: 'red',
    },
    gridListTileBarTitleClass: {
        color: 'white',
    },
    gridListTileBarClass: {
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
    }
}));

const stockImageDir = `${serverEndPoint}/images/jigsawPuzzles/default`;
const stockImages = [
    {
        url: `${stockImageDir}/fubuki.jpg`,
        title: 'Fubuki'
    },
    {
        url: `${stockImageDir}/pekora.png`,
        title: 'Pekora'
    },
    {
        url: `${stockImageDir}/praying_squirrel.jpg`,
        title: 'Praying Squirrel'
    },
];

export default function JigsawPuzzle() {
    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const [imageReady, setImageReady] = useState(false);
    const [useCustomImage, setUseCustomImage] = useState(true);
    const [stockImageSelected, setStockImageSelected] = useState();
    const [isRotation, setIsRotation] = useState(false);

    const [lobby, setLobby] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
    const [isGeneralDialogOpen, setIsGeneralDialogOpen] = useState(true);
    const [isSettingDialogOpen, setIsSettingDialogOpen] = useState(false);
    const [isAdvancedDialogOpen, setIsAdvancedDialogOpen] = useState(false);
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

    const [playTime, setPlayTime] = useState(0);

    const [name, setName] = useState();
    const [image, setImage] = useState(null);
    const [joinID, setJoinID] = useState();
    const [rowCol, setRowCol] = useState(5);

    const canvasRef = useRef(null);
    const [isGeneratePuzzlePieces, setIsGeneratePuzzlePieces] = useState(false);
    const [gameState, setGameState] = useState();
    const [selectedPieceID, setSelectedPieceId] = useState(null);
    const [snackBarMessage, setSnackBarMessage] = useState("");
    const [snackBarSeverity, setSnackBarSeverity] = useState("success");
    const [puzzlePaths, setPuzzlePaths] = useState([]);
    const [socket, setSocket] = useState();
    const [roomID, setRoomID] = useState();
    const [isShowMyPosition, setIsShowMyPosition] = useState(false);
    const [isShowPlayersPosition, setIsShowPlayersPosition] = useState(true);
    const [isMaintainAspectRatio, setIsMaintainAspectRatio] = useState(false);
    const [controlStyle, setControlStyle] = useState('click');

    const classes = useStyles({ isImageDialogOpen });

    const canvasResizeDelay = 50;
    const mouseMoveInterval = 30;

    const getLocalScale = useCallback(() => {
        if (canvasRef && canvasRef.current && gameState) {
            const canvas = canvasRef.current;
            return {
                x: canvas.width / gameState.gameWidth,
                y: canvas.height / gameState.gameHeight
            };
        } else {
            return {
                x: 1,
                y: 1
            }
        }
    }, [gameState]);

    const renderPuzzle = useCallback(() => {
        const localScale = getLocalScale();

        // Perhaps there's a better way to update puzzle paths without doing it in the render function, 
        // but the dependency on the frequently updated gameState causes issues
        if (isGeneratePuzzlePieces) {
            if (gameState) {
                const newPuzzlePaths = [];

                gameState.pieces.forEach((piece) => {
                    const path = new Path2D();
                    path.moveTo(0, 0);
                    addPath(path, roundTypes[piece.strPathTypes.top], { x: 0, y: 0 }, { x: piece.width, y: 0 }, localScale, piece.height * localScale.y);
                    addPath(path, roundTypes[piece.strPathTypes.right], { x: piece.width, y: 0 }, { x: piece.width, y: piece.height }, localScale, piece.width * localScale.x);
                    addPath(path, roundTypes[piece.strPathTypes.bottom], { x: piece.width, y: piece.height }, { x: 0, y: piece.height }, localScale, piece.height * localScale.y);
                    addPath(path, roundTypes[piece.strPathTypes.left], { x: 0, y: piece.height }, { x: 0, y: 0 }, localScale, piece.width * localScale.x);
                    newPuzzlePaths[piece.id] = path;
                });
                setIsGeneratePuzzlePieces(false);
                setPuzzlePaths(newPuzzlePaths);
            }
        } else if (canvasRef && canvasRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // Clear canvas
            context.save();
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.restore();

            if (gameState) {
                // Draw frame
                context.save();
                context.translate(gameState.frameOffset.x * localScale.x, gameState.frameOffset.y * localScale.y);
                context.strokeStyle = 'black';
                context.strokeRect(0, 0, gameState.frameWidth * localScale.x, gameState.frameHeight * localScale.y);
                context.restore();

                // Draw pieces
                if (imageReady) {
                    // Calculate image proportions to maintain aspect ratio
                    const { naturalWidth: imageSrcWidth, naturalHeight: imageSrcHeight } = imageRef.current;
                    let imageDestSize;
                    if (imageSrcWidth > imageSrcHeight) {
                        imageDestSize = [
                            gameState.frameWidth,
                            gameState.frameHeight * imageSrcHeight / imageSrcWidth
                        ];
                    } else {
                        imageDestSize = [
                            gameState.frameWidth * imageSrcWidth / imageSrcHeight,
                            gameState.frameHeight
                        ];
                    }
                    // Consider local scale aspect ratio
                    if (localScale.x > localScale.y) {
                        imageDestSize[1] *= localScale.x / localScale.y;
                    } else {
                        imageDestSize[0] *= localScale.y / localScale.x;
                    }
                    // Ensure final size is within bounds of frame
                    const boundingFactor = Math.max(1, imageDestSize[0] / gameState.frameWidth, imageDestSize[1] / gameState.frameHeight);
                    imageDestSize = imageDestSize.map(x => x / boundingFactor);

                    const imageDestOffset = {
                        x: (gameState.frameWidth - imageDestSize[0]) / 2,
                        y: (gameState.frameHeight - imageDestSize[1]) / 2,
                    };

                    gameState.pieces.forEach((piece) => {
                        const path = puzzlePaths[piece.id];
                        if (path) {
                            context.save();

                            // Rotate piece at its center
                            const pieceCenter = {
                                x: (piece.translate.x + piece.width / 2) * localScale.x,
                                y: (piece.translate.y + piece.height / 2) * localScale.y
                            };
                            context.translate(pieceCenter.x, pieceCenter.y);
                            context.rotate(piece.rotation * Math.PI / 180);
                            context.translate(-pieceCenter.x, -pieceCenter.y);

                            // Translate to correct position
                            context.translate(piece.translate.x * localScale.x, piece.translate.y * localScale.y);
                            context.save();

                            // Draw clipped image on piece
                            context.clip(path);
                            context.scale(localScale.x, localScale.y);
                            let imageDest = [];
                            if (isMaintainAspectRatio) {
                                imageDest = [
                                    -piece.relativeImageTranslation.x + imageDestOffset.x,
                                    -piece.relativeImageTranslation.y + imageDestOffset.y,
                                    ...imageDestSize
                                ];
                            } else {
                                imageDest = [
                                    -piece.relativeImageTranslation.x,
                                    -piece.relativeImageTranslation.y,
                                    gameState.frameWidth,
                                    gameState.frameHeight
                                ];
                            }
                            context.drawImage(
                                imageRef.current,
                                ...imageDest);
                            context.restore();
                            // Draw outline on piece
                            if (piece.isLocked) {
                                context.strokeStyle = 'red';
                            } else if (piece.selectedClient === socket.id) {
                                context.strokeStyle = 'lime';
                            } else if (piece.selectedClient) {
                                context.strokeStyle = 'violet';
                            }
                            context.stroke(path);

                            context.restore();
                        }
                    });
                }
            }

            // Render player names
            if (isShowPlayersPosition && lobby) {
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
    }, [gameState, isGeneratePuzzlePieces, isShowPlayersPosition, isMaintainAspectRatio, imageReady, puzzlePaths, socket, getLocalScale, lobby]);

    useEffect(() => {
        if (imageRef.current) {
            imageRef.current.addEventListener('load', (e) => {
                setImageReady(true);
            });
        }
    }, []);

    // Socket events
    useEffect(() => {
        let roomID;
        const newSocket = io(serverEndPoint, {
            withCredentials: true,
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connection to server established');
        });

        newSocket.on('disconnect', (reason) => {
            console.log(`Disconnected: ${reason}`);
        });

        newSocket.on('createdRoom', (newRoomID, lobby) => {
            roomID = newRoomID;
            setRoomID(newRoomID);
            setLobby(lobby);
            setIsHost(true);
            hideAllDialogs();
            setIsSettingDialogOpen(true);
        });

        newSocket.on('joinedRoom', (newRoomID, imgUrl, lobby, userName, userID, newState) => {
            if (newRoomID) {
                roomID = newRoomID;
                setRoomID(newRoomID);
                setLobby(lobby);
                if (newSocket.id === userID) {
                    setIsHost(false);
                    setIsGeneratePuzzlePieces(true);
                    setGameState(newState);
                    if (imageRef && imageRef.current) imageRef.current.src = imgUrl;
                    hideAllDialogs();
                    setIsRoomDialogOpen(true);
                } else {
                    setSnackBarSeverity('success');
                    setSnackBarMessage(`User ${userName} joined the room`);
                }
            } else {
                setSnackBarSeverity("warning");
                setSnackBarMessage(`Join room error: '${userName}' is already taken. Please choose a different name`);
            }
        });

        newSocket.on('finishedGame', (lobby, playTime) => {
            setLobby(lobby);
            const duration = moment.duration(playTime);
            let playTimeStr = '';
            if (duration.hours() > 0) playTimeStr += duration.hours() + 'h';
            if (duration.minutes() > 0) playTimeStr += duration.minutes() + 'm';
            playTimeStr += duration.seconds() + 's';
            setPlayTime(playTimeStr);
            setIsResultsDialogOpen(true);
        });

        newSocket.on('joinRoomError', (errMsg) => {
            setSnackBarSeverity("warning");
            setSnackBarMessage(errMsg);
        });

        newSocket.on('leftRoom', (lobby, userName, newState) => {
            if (newState) setGameState(newState);
            setSnackBarSeverity('success');
            setSnackBarMessage(`User ${userName} left the room`);
            setLobby(lobby);
        });

        newSocket.on('initializedGame', (newState) => {
            setImage(null);
            setIsGeneratePuzzlePieces(true);
            setGameState(newState);
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

        newSocket.on('selectedPiece', (newState, clientID, pieceID) => {
            if (newSocket && newSocket.id === clientID) setSelectedPieceId(pieceID);
            setGameState(newState);
        });

        newSocket.on('rotatedPiece', (newState) => {
            setGameState(newState);
        });

        newSocket.on('mouseMove', (lobby, newState) => {
            setLobby(lobby);
            if (newState) setGameState(newState);
        });

        newSocket.on('updatedPlayerPosition', (lobby) => {
            setLobby(lobby);
        });

        return () => {
            newSocket.emit('jigsaw:leaveRoom', roomID);
        };
    }, []);

    // Mouse / keyboard interactions
    useEffect(() => {
        const canvas = canvasRef.current;

        const handleClick = (e) => {
            if (((e.type === 'click' && controlStyle === 'click') ||
                ((e.type === 'mouseup' || e.type === 'mousedown') && controlStyle === 'drag & drop')) &&
                gameState &&
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
                    // Rotate piece at its center
                    const pieceCenter = {
                        x: (piece.translate.x + piece.width / 2) * localScale.x,
                        y: (piece.translate.y + piece.height / 2) * localScale.y
                    };
                    context.translate(pieceCenter.x, pieceCenter.y);
                    context.rotate(piece.rotation * Math.PI / 180);
                    context.translate(-pieceCenter.x, -pieceCenter.y);

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

        const handleRightClick = (e) => {
            e.preventDefault();
            if (selectedPieceID !== null &&
                socket &&
                roomID) {
                socket.emit('jigsaw:rotate', roomID, selectedPieceID)
            }
        };

        const handleMouseMove = (e) => {
            if (socket && roomID && (isShowMyPosition || selectedPieceID !== null)) {
                const localScale = getLocalScale();
                const posX = e.offsetX / localScale.x;
                const posY = e.offsetY / localScale.y;

                socket.emit('jigsaw:mouseMove', roomID, selectedPieceID, posX, posY, isShowMyPosition);
            }
        };

        const throttledMouseHandler = throttle(handleMouseMove, mouseMoveInterval);

        if (canvas) {
            canvas.addEventListener('click', handleClick);
            canvas.addEventListener('contextmenu', handleRightClick);
            canvas.addEventListener('mousemove', throttledMouseHandler);
            canvas.addEventListener('mouseup', handleClick);
            canvas.addEventListener('mousedown', handleClick);
        }

        return (() => {
            if (canvas) {
                canvas.removeEventListener('click', handleClick);
                canvas.removeEventListener('contextmenu', handleRightClick);
                canvas.removeEventListener('mousemove', throttledMouseHandler);
                canvas.removeEventListener('mouseup', handleClick);
                canvas.removeEventListener('mousedown', handleClick);
            }
        });
    }, [canvasRef, gameState, puzzlePaths, socket, roomID, selectedPieceID, getLocalScale, isShowPlayersPosition, isShowMyPosition, controlStyle]);

    // Canvas size changes
    useLayoutEffect(() => {
        const updateCanvasSize = () => {
            if (canvasRef && canvasRef.current !== null) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight - document.querySelector('#app_bar').offsetHeight;
                debounce(() => { setIsGeneratePuzzlePieces(true) }, canvasResizeDelay)();
            }
        };
        const updateImageDialogSize = () => {
            if (imageRef && imageRef.current !== null) {
                imageRef.current.width = window.innerWidth;
                imageRef.current.height = window.innerHeight - document.querySelector('#app_bar').offsetHeight;
            }
        };
        const updateLayouts = () => {
            updateCanvasSize();
            updateImageDialogSize();
        };
        window.addEventListener('resize', updateLayouts);
        updateLayouts();
        return () => window.removeEventListener('resize', updateLayouts);
    }, []);

    useEffect(() => {
        renderPuzzle();
    }, [renderPuzzle]);

    function closeSnackbar(event, reason) {
        if (reason === 'clickaway') {
            return;
        }

        setSnackBarMessage("");
    };

    function validateStockImage() {
        if (stockImageSelected) {
            return true;
        }
        setSnackBarSeverity('error');
        setSnackBarMessage('Must choose a stock image');
        return false;
    };

    function validateImage() {
        if (image) {
            return true;
        }
        setSnackBarSeverity('error');
        setSnackBarMessage('Image is missing');
        return false;
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
        if (validateRoomID()) {
            if (!useCustomImage && validateStockImage()) {
                if (imageRef && imageRef.current) imageRef.current.src = stockImageSelected;
                socket.emit('jigsaw:initGame', roomID, stockImageSelected, rowCol, isRotation);
            }
            if (useCustomImage && validateSocket('Create room') && validateImage()) {
                const method = 'post';
                const url = `${serverEndPoint}/jigsawPuzzle/`;
                const form = new FormData();
                form.append('roomID', roomID);
                form.append('image', image, image.name);
                axios({
                    method,
                    url,
                    data: form,
                    headers: {
                        'accept': 'application/json',
                        'Accept-Language': 'en-US,en;q=0.8',
                        'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
                    }
                }).then((resp) => {
                    if (resp.status === 200) {
                        const imgUrl = resp.data.imgUrl;
                        if (imageRef && imageRef.current) imageRef.current.src = imgUrl;
                        socket.emit('jigsaw:initGame', roomID, imgUrl, rowCol, isRotation);
                    }
                }).catch((err) => {
                    setSnackBarSeverity('error');
                    setSnackBarMessage(`Create room failed: image upload error: ${err}`);
                });
            }
        }
    };

    function handleCancel() {
        hideAllDialogs();
        setIsGeneralDialogOpen(true);
    };

    function handleAdvancedToggle(event, setFn) {
        if (event && event.target) setFn(event.target.checked);
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

    function handleAdvancedSaveAndClose(e) {
        if (validateSocket('AdvancedClose')) {
            const localScale = getLocalScale();
            const posX = e.offsetX / localScale.x;
            const posY = e.offsetY / localScale.y;

            socket.emit('jigsaw:updatePlayerPosition', roomID, posX, posY, isShowMyPosition);
        }
        handlePlay();
    };

    function handleAdvanced() {
        hideAllDialogs();
        setIsAdvancedDialogOpen(true);
    };

    function handleRestartGame() {
        if (validateSocket('RestartGame') && validateRoomID()) {
            socket.emit('jigsaw:restartGame', roomID);
        }
    };

    function handleLeaveRoom() {
        if (socket && roomID) socket.emit('jigsaw:leaveRoom', roomID);
        setImageReady(false);
        setLobby([]);
        setIsHost(false);
        setPlayTime(0);
        setGameState(null);
        setSelectedPieceId(null);
        setPuzzlePaths([]);
        setImage(null);
        setRoomID(null);
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
        setIsAdvancedDialogOpen(false);
        setIsRoomDialogOpen(false);
        setIsJoinDialogOpen(false);
        setIsImageDialogOpen(false);
    }

    function onImageUpload(e) {
        setImage(e.target.files[0]);
    }

    function handleStockImageClick(e) {
        setStockImageSelected(e.target.src);
    }

    return (
        <Grid ref={containerRef} container className={classes.root}>
            <Grid className={classes.imageGridClass} item>
                <img ref={imageRef} className={classes.imageClass} alt="uploaded_image"></img>
            </Grid>
            <Snackbar open={snackBarMessage !== ""} autoHideDuration={2000} onClose={closeSnackbar}>
                <Alert onClose={closeSnackbar} severity={snackBarSeverity}>
                    {snackBarMessage}
                </Alert>
            </Snackbar>
            <IconButton
                className={classes.settingsButtonClass}
                aria-label="settings"
                color={isRoomDialogOpen ? "secondary" : "primary"}
                onClick={() => { hideAllDialogs(); setIsRoomDialogOpen(true); }}>
                <SettingsIcon />
            </IconButton>
            <IconButton
                className={classes.imageButtonClass}
                aria-label="settings"
                color={isImageDialogOpen ? "secondary" : "primary"}
                onClick={() => { hideAllDialogs(); setIsImageDialogOpen(!isImageDialogOpen) }}>
                <ImageIcon />
            </IconButton>
            <Grid className={classes.canvasGridClass} container item>
                <canvas ref={canvasRef} />
                <Dialog
                    fullWidth
                    maxWidth={'sm'}
                    open={isResultsDialogOpen}
                    onClick={() => { setIsResultsDialogOpen(false) }}
                >
                    <DialogTitle>Results</DialogTitle>
                    <Divider />
                    <Grid className={classes.dialogFormGridClass} container item direction="column">
                        <Grid item>
                            <TextField
                                label="Play Time"
                                variant="outlined"
                                fullWidth
                                disabled
                                value={playTime}
                            />
                        </Grid>
                        <Grid item>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">Player</TableCell>
                                        <TableCell align="center">Score</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {lobby.map((client) => (
                                        <TableRow key={'player_' + client.id}>
                                            <TableCell align="center" component="th" scope="row">
                                                {client.name}
                                            </TableCell>
                                            <TableCell align="center">{`${client.score}/${gameState ? gameState.pieces.length : 0}`}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Grid>
                    </Grid>
                </Dialog>
                <Dialog
                    disableBackdropClick={true}
                    disableEscapeKeyDown={true}
                    fullWidth
                    maxWidth="xs"
                    open={isGeneralDialogOpen}>
                    <DialogTitle>General Settings</DialogTitle>
                    <Divider />
                    <form noValidate autoComplete="off">
                        <TextField
                            className={classes.dialogFormFieldClass}
                            label="Name"
                            variant="outlined"
                            fullWidth
                            defaultValue={name}
                            onChange={(e) => { setName(e.target.value) }}
                        />
                        <Button
                            className={classes.dialogFormFieldClass}
                            variant="contained"
                            color="primary"
                            onClick={handleHostRoom}>
                            Host Room
                            </Button>
                        <Button
                            className={classes.dialogFormFieldClass}
                            variant="contained"
                            color="primary"
                            onClick={handleJoinRoom}>
                            Join Room
                        </Button>
                    </form>
                </Dialog>
                <Dialog
                    disableBackdropClick={true}
                    disableEscapeKeyDown={true}
                    fullWidth
                    maxWidth="xs"
                    open={isSettingDialogOpen}>
                    <DialogTitle>Game Settings</DialogTitle>
                    <Divider />
                    <form noValidate autoComplete="off">
                        <Grid className={classes.dialogFormGridClass} container item>
                            <FormControlLabel
                                control={
                                    <Switch
                                        color='primary'
                                        checked={isRotation}
                                        onChange={(ev) => setIsRotation(ev.target.checked)}
                                        name="isRotation"
                                    />}
                                label={isRotation ? "Puzzle pieces can rotate" : "Puzzle pieces can not rotate"}
                            />
                        </Grid>
                        <Grid className={classes.dialogFormGridClass} container item>
                            <FormControlLabel
                                control={
                                    <Switch
                                        color='primary'
                                        checked={useCustomImage}
                                        onChange={(ev) => setUseCustomImage(ev.target.checked)}
                                        name="useCustomImage"
                                    />}
                                label={useCustomImage ? "Use custom image" : "Use stock image"}
                            />
                        </Grid>
                        {
                            useCustomImage ?
                                <Grid className={classes.dialogFormGridClass} container item>
                                    <Grid item xs={9}>
                                        <TextField
                                            label="Image"
                                            variant="outlined"
                                            disabled
                                            style={{ width: '90%' }}
                                            value={image ? image.name : ''}
                                        />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <input
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            type="file"
                                            onChange={onImageUpload}
                                            id="image-upload-file"
                                        />
                                        <label htmlFor="image-upload-file">
                                            <Button
                                                style={{ width: '100%', height: '100%' }}
                                                color="primary"
                                                component="span"
                                                aria-label="image upload"
                                                startIcon={<PublishIcon />}
                                                variant="contained">
                                                Upload
                                    </Button>
                                        </label>
                                    </Grid>
                                </Grid>
                                :
                                <div className={classes.gridRootClass}>
                                    <GridList className={classes.gridListClass} col={2.5}>
                                        {
                                            stockImages.map((si) => (
                                                <GridListTile key={si.url}>
                                                    <img
                                                        style={{
                                                            objectFit: 'contain',
                                                            height: '100%'
                                                        }}
                                                        src={si.url}
                                                        alt={si.title}
                                                        onClick={handleStockImageClick}
                                                    />
                                                    <GridListTileBar
                                                        title={si.title}
                                                        classes={{
                                                            root: classes.gridListTileBarClass,
                                                            title: stockImageSelected === si.url ?
                                                                classes.gridListTileBarTitleSelectedClass :
                                                                classes.gridListTileBarTitleClass,
                                                        }}
                                                    />
                                                </GridListTile>
                                            ))
                                        }
                                    </GridList>
                                </div>
                        }
                        <Grid className={classes.dialogFormFieldClass} container item>
                            <FormControl variant="outlined" style={{ width: '100%' }}>
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
                                <FormHelperText># of Puzzle Pieces (Row x Col)</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Button
                            className={classes.dialogFormFieldClass}
                            variant="contained"
                            fullWidth
                            color="primary"
                            onClick={handleCreateRoom}>
                            Create Room
                        </Button>
                        <Button
                            className={classes.dialogFormFieldClass}
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
                    fullWidth
                    maxWidth="xs"
                    onClose={hideAllDialogs}>
                    <DialogTitle>Room ID: {roomID}</DialogTitle>
                    <Divider />
                    <List className={classes.dialogFormFieldClass} component="nav" aria-label="lobby">
                        {
                            lobby.map(client => (
                                <ListItem style={{ padding: '0' }} key={`lobby_client_${client.name}`} button>
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
                            className={classes.dialogFormFieldClass}
                            variant="contained"
                            fullWidth
                            color="primary"
                            onClick={handlePlay}>
                            Play
                        </Button>
                        <Button
                            className={classes.dialogFormFieldClass}
                            variant="contained"
                            fullWidth
                            color="primary"
                            onClick={handleAdvanced}>
                            Advanced Settings
                        </Button>
                        {
                            isHost ?
                                <Button
                                    className={classes.dialogFormFieldClass}
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
                            className={classes.dialogFormFieldClass}
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
                    fullWidth
                    maxWidth="xs"
                    open={isAdvancedDialogOpen}
                    onClose={hideAllDialogs}>
                    <DialogTitle>Advanced Settings</DialogTitle>
                    <Divider />
                    <form noValidate autoComplete="off">
                        <FormGroup className={classes.dialogFormFieldClass}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        color='primary'
                                        checked={isShowMyPosition}
                                        onChange={(ev) => handleAdvancedToggle(ev, setIsShowMyPosition)}
                                        name="showMyPosition"
                                    />}
                                label="Allow others to see my position"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        color='primary'
                                        checked={isShowPlayersPosition}
                                        onChange={(ev) => handleAdvancedToggle(ev, setIsShowPlayersPosition)}
                                        name="showPlayersPosition"
                                    />}
                                label="Show other players' position"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        color='primary'
                                        checked={isMaintainAspectRatio}
                                        onChange={(ev) => handleAdvancedToggle(ev, setIsMaintainAspectRatio)}
                                        name="maintainAspectRatio"
                                    />}
                                label="Maintain aspect ratio"
                            />
                        </FormGroup>
                        <Grid className={classes.dialogFormFieldClass} container item>
                            <FormControl variant="outlined" style={{ width: '100%' }}>
                                <Select
                                    value={controlStyle}
                                    onChange={(e) => { setControlStyle(e.target.value) }}
                                    name="controlStyle"
                                    inputProps={{ 'aria-label': 'controlStyle' }}
                                >
                                    {
                                        ['click', 'drag & drop'].map(ctrlStyle => {
                                            return <MenuItem key={'controlStyle_' + ctrlStyle} value={ctrlStyle}>
                                                {capitalizedWords(ctrlStyle)}
                                            </MenuItem>
                                        })
                                    }
                                </Select>
                                <FormHelperText>Control Style</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Button
                            className={classes.dialogFormFieldClass}
                            variant="contained"
                            fullWidth
                            color="primary"
                            onClick={(e) => handleAdvancedSaveAndClose(e)}>
                            Save & Close
                        </Button>
                    </form>
                </Dialog>
                <Dialog
                    disableBackdropClick={true}
                    disableEscapeKeyDown={true}
                    fullWidth
                    maxWidth="xs"
                    open={isJoinDialogOpen}
                    onClose={hideAllDialogs}>
                    <DialogTitle>Join Room</DialogTitle>
                    <Divider />
                    <form noValidate autoComplete="off">
                        <TextField
                            className={classes.dialogFormFieldClass}
                            label="Room ID"
                            variant="outlined"
                            fullWidth
                            defaultValue={joinID}
                            onChange={(e) => { setJoinID(e.target.value) }}
                        />
                        <Button
                            className={classes.dialogFormFieldClass}
                            variant="contained"
                            fullWidth
                            color="primary"
                            onClick={handleJoin}>
                            Join
                        </Button>
                        <Button
                            className={classes.dialogFormFieldClass}
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
