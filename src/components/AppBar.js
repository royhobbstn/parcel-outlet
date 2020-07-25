import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MapIcon from '@material-ui/icons/Map';
import HomeIcon from '@material-ui/icons/Home';
import HelpOutline from '@material-ui/icons/HelpOutline';
import { Link } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import AppBarDownloadButtons from './AppBarDownloadButtons.js';

const useStyles = makeStyles(theme => ({
  root: {
    zIndex: 1000,
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(1),
  },
  title: {
    flexGrow: 1,
    cursor: 'default',
  },
}));

export const LightTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: 'grey',
    color: 'white',
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}))(Tooltip);

export default function ButtonAppBar({
  focusDownload,
  updateFocusDownload,
  updateStatChoice,
  updatedSelectedDownload,
  updateModalOpen,
}) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <LightTooltip title="Home" placement="bottom">
            <IconButton
              component={Link}
              to={'/'}
              className={classes.menuButton}
              onClick={() => {
                updateFocusDownload({});
              }}
            >
              <HomeIcon />
            </IconButton>
          </LightTooltip>
          <Typography variant="h6" className={classes.title}>
            Parcel Outlet
          </Typography>
          {focusDownload.products ? (
            <AppBarDownloadButtons
              focusDownload={focusDownload}
              updateStatChoice={updateStatChoice}
              updatedSelectedDownload={updatedSelectedDownload}
              updateModalOpen={updateModalOpen}
            />
          ) : null}
          <LightTooltip title="Parcel Coverage Map" placement="bottom">
            <IconButton
              component={Link}
              to={'/coverage-map'}
              className={classes.menuButton}
              onClick={() => {
                updateFocusDownload({});
              }}
            >
              <MapIcon />
            </IconButton>
          </LightTooltip>
          <LightTooltip title="About this Site" placement="bottom">
            <IconButton component={Link} to={'/about'} className={classes.menuButton}>
              <HelpOutline />
            </IconButton>
          </LightTooltip>
        </Toolbar>
      </AppBar>
    </div>
  );
}
