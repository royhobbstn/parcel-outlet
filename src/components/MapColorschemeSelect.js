import React from 'react';
import { TextField, MenuItem } from '@material-ui/core';
import { darkCategorical, lightCategorical } from '../lookups/styleData';

import { colortree } from '../lookups/colortree';

export function MapColorschemeSelect({
  selectedCategoricalScheme,
  updateSelectedCategoricalScheme,
  selectedNumericScheme,
  updateSelectedNumericScheme,
  selectedAttribute,
}) {
  let ColorschemeSelect = null;
  const prefix = selectedAttribute.slice(0, 3);

  if (prefix === 'cat') {
    ColorschemeSelect = CategoricalSelector({
      selectedCategoricalScheme,
      updateSelectedCategoricalScheme,
    });
  } else if (prefix === 'num') {
    const postfix = selectedNumericScheme.split('_')[1];

    const schemes = Object.keys(colortree)
      .filter(d => colortree[d].count === Number(postfix))
      .map(d => {
        return { id: d, colors: colortree[d].colors };
      });

    ColorschemeSelect = NumericSelector(
      schemes,
      selectedNumericScheme,
      updateSelectedNumericScheme,
    );
  } else {
    ColorschemeSelect = null; // selectedAttribute === 'default'
  }

  return ColorschemeSelect;
}

function CategoricalSelector({ selectedCategoricalScheme, updateSelectedCategoricalScheme }) {
  return (
    <TextField
      style={{
        display: 'block',
        marginRight: '10px',
        marginBottom: '20px',
        width: '180px',
      }}
      id="categorical-colorschemes"
      select
      label="Colorscheme"
      value={selectedCategoricalScheme}
      onChange={evt => {
        // @ts-ignore
        updateSelectedCategoricalScheme(evt.target.value);
        console.log('change map categoric');
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
  );
}

function NumericSelector(schemes, selectedNumericScheme, updateSelectedNumericScheme) {
  return (
    <TextField
      style={{
        display: 'block',
        marginRight: '10px',
        marginBottom: '20px',
        width: '180px',
      }}
      id="numerical-colorschemes"
      select
      label="Colorscheme"
      value={selectedNumericScheme}
      onChange={evt => {
        // @ts-ignore
        updateSelectedNumericScheme(evt.target.value);
        console.log('change map numeric');
      }}
      variant="outlined"
    >
      {schemes.map(d => {
        return (
          <MenuItem key={d.id} value={d.id}>
            {d.colors.map((d, i) => {
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
        );
      })}
    </TextField>
  );
}
