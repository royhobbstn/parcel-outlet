import React from 'react';
import { Typography } from '@material-ui/core';

export function MapLegend({ title }) {
  return (
    <div
      style={{
        position: 'absolute',
        backgroundColor: 'white',
        zIndex: 100,
        width: 'auto',
        height: 'auto',
        bottom: '20px',
        left: '20px',
        outline: 'none',
        padding: '10px 16px',
        borderRadius: '5px',
      }}
      className="map-title-control"
    >
      <Typography>Some sample text</Typography>
    </div>
  );
}
