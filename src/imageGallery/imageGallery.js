import { makeStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

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
        width: '100%'
    },
    imgClass: {
        objectFit: "contain",
        width: '100%',
        height: '100%'
    }
}));


export default function ImageGallery(props) {
    const { id: journalId, images } = props;
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <GridList className={classes.gridList} cols={12} >
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