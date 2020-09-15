import React from 'react';
import { Typography } from '@material-ui/core';

export function MapTitleControl({ title }) {
  return (
    <Typography
      style={{
        position: 'absolute',
        zIndex: 100,
        width: 'auto',
        height: 'auto',
        top: '90px',
        right: '20px',
        outline: 'none',
        padding: '10px 16px',
        borderRadius: '5px',
        backgroundColor: 'rgb(52, 51, 50)',
        color: 'white',
        border: '1px solid white',
        opacity: 0.8,
      }}
      className="map-title-control"
    >
      {title}
    </Typography>
  );
}
