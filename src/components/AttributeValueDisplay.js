import React from 'react';
import Paper from '@material-ui/core/Paper';

export default function AttributeValueDisplay({ mouseoverAttributeValue }) {
  if (!mouseoverAttributeValue && mouseoverAttributeValue !== 0) {
    return null;
  }
  return (
    <Paper
      style={{
        position: 'absolute',
        zIndex: '1000',
        width: 'auto',
        height: '30px',
        overflow: 'hidden',
        top: '80px',

        fontSize: '15px',
        left: '5%',
      }}
    >
      <span style={{ margin: '0px 20px', lineHeight: '30px' }}>{mouseoverAttributeValue}</span>
    </Paper>
  );
}
