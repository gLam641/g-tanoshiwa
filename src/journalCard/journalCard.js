import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Link as RouterLink } from 'react-router-dom';

import defaultImage from '../assets/pekora.png';

const useStyles = makeStyles({
    root: {
        maxWidth: "100%",
        height: '25rem'
    },
    cardMedia: {
        objectFit: "contain"
    },
    cardContent: {
        height: '1rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    }
});

export default function JournalCard(props) {
    const classes = useStyles();
    const { _id: id, title, content, images } = props.journalInfo;

    return (
        <Card className={classes.root}>
            <CardActionArea>
                <CardMedia
                    component="img"
                    alt="Pekora"
                    height="250"
                    image={images && images.length > 0 ? images[0] : defaultImage}
                    className={classes.cardMedia}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5">
                        {title}
                    </Typography>
                    <Typography className={classes.cardContent} variant="body2" color="textSecondary" component="p">
                        {content}
                    </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <Button size="small" color="primary" component={RouterLink} to={"/journals/" + id}>
                    Learn More
                </Button>
            </CardActions>
        </Card>
    );
}