import React from 'react';
import { IconButton } from '@material-ui/core';
import BrushIcon from '@material-ui/icons/Brush';

export function MapModalToggleButton({ updateDialogOpen, dialogOpen }) {
  return (
    <IconButton
      style={{
        position: 'absolute',
        zIndex: 100,
        top: '150px',
        right: '20px',
        padding: '10px',
        backgroundColor: 'rgb(52, 51, 50)',
        color: 'white',
        border: '1px solid white',
        opacity: 0.8,
      }}
      className="map-title-control"
      onClick={() => {
        updateDialogOpen(!dialogOpen);
      }}
    >
      <BrushIcon />
    </IconButton>
  );
}
