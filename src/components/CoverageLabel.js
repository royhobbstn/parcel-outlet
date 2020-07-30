import React from 'react';
import Paper from '@material-ui/core/Paper';

export default function CoverageLabel({ coverageLabelText }) {
  return (
    <Paper
      style={{
        position: 'absolute',
        zIndex: '1000',
        width: '280px',
        height: '30px',
        overflow: 'hidden',
        top: '80px',

        fontSize: '15px',
        right: '5%',
      }}
    >
      <span style={{ marginLeft: '20px', lineHeight: '30px' }}>{coverageLabelText}</span>
    </Paper>
  );
}
