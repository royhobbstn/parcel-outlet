import React from 'react';
import { IconButton } from '@material-ui/core';
import BrushIcon from '@material-ui/icons/Brush';

export function MapModalToggleButton({ updateDialogOpen, dialogOpen }) {
  return (
    <IconButton
      style={{
        position: 'absolute',
        backgroundColor: 'white',
        zIndex: 100,
        top: '150px',
        right: '20px',
        padding: '10px',
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
