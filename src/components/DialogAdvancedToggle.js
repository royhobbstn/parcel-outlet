import React from 'react';
import { Switch, Typography } from '@material-ui/core';

export function DialogAdvancedToggle({ advancedToggle, updateAdvancedToggle }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <Typography
        style={{
          lineHeight: '2.5',
          float: 'left',
        }}
      >
        Advanced
      </Typography>

      <Switch
        style={{ float: 'right' }}
        checked={advancedToggle}
        onChange={evt => {
          // @ts-ignore
          updateAdvancedToggle(!advancedToggle);
        }}
        color="primary"
        name="advanced-toggle"
        inputProps={{ 'aria-label': 'primary checkbox' }}
      />
    </div>
  );
}
