import React from 'react';
import { TextField, MenuItem } from '@material-ui/core';
import { darkCategorical, lightCategorical } from '../lookups/styleData';
import { colortree } from '../lookups/colortree';

// show color schemes

// every single possible color palette per selected scheme

// show nothing if default
// show categorical if attribute cat_

// if attribute num_
//   take in classification scheme value and select from it.

export function MapColorschemeSelect({
  selectedCategoricalScheme,
  updateSelectedCategoricalScheme,
  selectedNumericScheme,
  updateSelectedNumericScheme,
  selectedAttribute,
  selectedClassification,
}) {
  let ColorschemeSelect = null;
  const prefix = selectedAttribute.slice(0, 3);

  if (prefix === 'cat') {
    ColorschemeSelect = CategoricalSelector({
      selectedCategoricalScheme,
      updateSelectedCategoricalScheme,
    });
  } else if (prefix === 'num') {
    const postfix = selectedClassification.split('_')[1];
    ColorschemeSelect = NumericSelector(
      postfix,
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
  );
}

function NumericSelector(postfix, selectedNumericScheme, updateSelectedNumericScheme) {
  const schemes = Object.keys(colortree)
    .filter(d => colortree[d].count === Number(postfix))
    .map(d => {
      return { id: d, colors: colortree[d].colors };
    });
  console.log(schemes);
  return (
    <TextField
      style={{
        display: 'block',
        marginRight: '10px',
        marginBottom: '20px',
      }}
      id="numerical-colorschemes"
      select
      label="Colorscheme"
      value={selectedNumericScheme}
      onChange={evt => {
        // @ts-ignore
        updateSelectedNumericScheme(evt.target.value);
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
