import { makeStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import withWidth, { isWidthUp } from '@material-ui/core/withWidth';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
    },
    gridList: {
        padding: '2em 5em',
    },
    imgClass: {
        objectFit: "contain",
        width: '100%',
        height: '100%'
    }
}));

function ImageGallery(props) {
    const { id: journalId = "-", images } = props;
    const classes = useStyles();

    const getGridListCols = () => {
        if (isWidthUp('md', props.width)) {
            return 12;
        }

        if (isWidthUp('sm', props.width)) {
            return 8;
        }

        if (isWidthUp('xs', props.width)) {
            return 4;
        }

        return 4;
    }

    return (
        <div className={classes.root}>
            <GridList className={classes.gridList} cols={getGridListCols()} spacing={2}>
                {
                    images.map((image, image_id) => (
                        <GridListTile key={'journal_' + journalId + '_' + image_id} cols={4}>
                            <img className={classes.imgClass} src={image} alt={'journal_' + journalId + '_' + image_id} ></img>
                        </GridListTile>
                    ))
                }
            </GridList>
        </div >
    );
};

export default withWidth()(ImageGallery);