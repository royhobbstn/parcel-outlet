import React from 'react';
import { Typography } from '@material-ui/core';

export function MapTitleControl({ title }) {
  return (
    <Typography
      style={{
        position: 'absolute',
        backgroundColor: 'white',
        zIndex: 100,
        width: 'auto',
        height: 'auto',
        top: '90px',
        right: '20px',
        outline: 'none',
        padding: '10px 16px',
        borderRadius: '5px',
      }}
      className="map-title-control"
    >
      {title}
    </Typography>
  );
}
