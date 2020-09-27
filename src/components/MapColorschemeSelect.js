import React from 'react';
import { TextField, MenuItem } from '@material-ui/core';

import { colortree } from '../lookups/colortree';
import { categorytree } from '../lookups/categorytree';

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
        marginTop: '20px',
        marginBottom: '20px',
        width: '100%',
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
        {categorytree.dark.colors.map((c, i) => {
          const colorWidth = 72 / categorytree.dark.colors.length + 'px';
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                backgroundColor: c,
                width: colorWidth,
                height: '16px',
              }}
            ></span>
          );
        })}
      </MenuItem>
      <MenuItem key="light" value="light">
        {categorytree.light.colors.map((c, i) => {
          const colorWidth = 72 / categorytree.light.colors.length + 'px';
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                backgroundColor: c,
                width: colorWidth,
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
        marginTop: '20px',
        marginBottom: '20px',
        width: '100%',
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
            {d.colors.map((c, i) => {
              const colorWidth = 72 / d.colors.length + 'px';
              return (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    backgroundColor: c,
                    width: colorWidth,
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
