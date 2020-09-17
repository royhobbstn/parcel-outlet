import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';
import FeedbackIcon from '@material-ui/icons/Feedback';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HomeIcon from '@material-ui/icons/Home';
import { Link } from 'react-router-dom';
import MapIcon from '@material-ui/icons/Map';
import HelpOutline from '@material-ui/icons/HelpOutline';
import MobileDownloadButtons from './MobileDownloadButtons.js';

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})(props => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
));

export const StyledMenuItem = withStyles(theme => ({
  root: {
    '&:focus': {
      backgroundColor: theme.palette.primary.main,
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);

export default function CustomizedMenus({
  updateFocusDownload,
  focusDownload,
  updateStatChoice,
  updatedSelectedDownload,
  updateModalOpen,
  updateFeedbackModal,
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="mobileActivatorButton"
        aria-controls="customized-menu"
        aria-haspopup="true"
        variant="contained"
        color="primary"
        onClick={handleClick}
      >
        <MenuIcon />
      </Button>
      <StyledMenu
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <StyledMenuItem
          component={Link}
          to={'/'}
          onClick={() => {
            updateFocusDownload({});
          }}
        >
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </StyledMenuItem>

        {focusDownload.products ? (
          <MobileDownloadButtons
            focusDownload={focusDownload}
            updateStatChoice={updateStatChoice}
            updatedSelectedDownload={updatedSelectedDownload}
            updateModalOpen={updateModalOpen}
          />
        ) : null}

        <StyledMenuItem
          component={Link}
          to={'/coverage-map'}
          onClick={() => {
            updateFocusDownload({});
          }}
        >
          <ListItemIcon>
            <MapIcon />
          </ListItemIcon>
          <ListItemText primary="Coverage Map" />
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() => {
            updateFeedbackModal(true);
          }}
        >
          <ListItemIcon>
            <FeedbackIcon />
          </ListItemIcon>
          <ListItemText primary="Feedback" />
        </StyledMenuItem>
        <StyledMenuItem
          component={Link}
          to={'/about'}
          onClick={() => {
            updateFocusDownload({});
          }}
        >
          <ListItemIcon>
            <HelpOutline />
          </ListItemIcon>
          <ListItemText primary="About" />
        </StyledMenuItem>
      </StyledMenu>
    </div>
  );
}
