import React from 'react';

import { TextField } from '@material-ui/core';
import { classifications } from '../lookups/styleData';

export function MapClassificationSelect({ selectedClassification, updateSelectedClassification }) {
  return (
    <TextField
      style={{
        display: 'block',
        marginRight: '10px',
        marginBottom: '20px',
      }}
      id="numeric-classifications"
      select
      SelectProps={{
        native: true,
      }}
      label="Classifications"
      value={selectedClassification}
      onChange={evt => {
        // @ts-ignore
        updateSelectedClassification(evt.target.value);
      }}
      variant="outlined"
    >
      {classifications.map(d => {
        return (
          <option key={d} value={d}>
            {d}
          </option>
        );
      })}
    </TextField>
  );
}
