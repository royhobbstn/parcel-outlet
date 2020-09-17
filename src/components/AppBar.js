import React, { useState } from 'react';
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
import DesktopDownloadButtons from './DesktopDownloadButtons.js';
import MobileMenu from './MobileMenu.js';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import FeedbackIcon from '@material-ui/icons/Feedback';
import FeedbackModal from './FeedbackModal';

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
  const matches = useMediaQuery('(min-width:700px)');
  const [feedbackModal, updateFeedbackModal] = useState(false);

  return (
    <div className={classes.root}>
      <FeedbackModal feedbackModal={feedbackModal} updateFeedbackModal={updateFeedbackModal} />
      <AppBar position="static" className="customAppBar">
        <Toolbar>
          {!matches ? (
            <div className="mobileMenuActivator">
              <MobileMenu
                updateFocusDownload={updateFocusDownload}
                focusDownload={focusDownload}
                updateStatChoice={updateStatChoice}
                updatedSelectedDownload={updatedSelectedDownload}
                updateModalOpen={updateModalOpen}
              />
            </div>
          ) : (
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
          )}
          <Typography variant="h6" className={classes.title}>
            Parcel Outlet
          </Typography>

          {matches ? (
            <React.Fragment>
              {focusDownload.products ? (
                <DesktopDownloadButtons
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

              <LightTooltip title="Give Feedback" placement="bottom">
                <IconButton
                  className={classes.menuButton}
                  onClick={() => updateFeedbackModal(true)}
                >
                  <FeedbackIcon />
                </IconButton>
              </LightTooltip>

              <LightTooltip title="About this Site" placement="bottom">
                <IconButton component={Link} to={'/about'} className={classes.menuButton}>
                  <HelpOutline />
                </IconButton>
              </LightTooltip>
            </React.Fragment>
          ) : null}
        </Toolbar>
      </AppBar>
    </div>
  );
}
