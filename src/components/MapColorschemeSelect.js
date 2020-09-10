import React from 'react';
import { TextField, MenuItem } from '@material-ui/core';
import { darkCategorical, lightCategorical } from '../lookups/styleData';

// show color schemes

// every single possible color palette per selected scheme

export function MapColorschemeSelect({
  selectedCategoricalScheme,
  updateSelectedCategoricalScheme,
}) {
  return (
    <div>
      <TextField
        style={{
          display: 'block',
          marginRight: '10px',
          marginBottom: '20px',
        }}
        id="categorical-colorschemes"
        select
        label="Colorscheme"
        value={selectedCategoricalScheme}
        onChange={evt => {
          // @ts-ignore
          updateSelectedCategoricalScheme(evt.target.value);
        }}
        variant="outlined"
      >
        <MenuItem key="dark" value="dark">
          {darkCategorical.map((d, i) => {
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  backgroundColor: d,
                  width: '12px',
                  height: '16px',
                }}
              ></span>
            );
          })}
        </MenuItem>
        <MenuItem key="light" value="light">
          {lightCategorical.map((d, i) => {
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  backgroundColor: d,
                  width: '12px',
                  height: '16px',
                }}
              ></span>
            );
          })}
        </MenuItem>
      </TextField>
    </div>
  );
}
