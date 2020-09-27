import React from 'react';

import { TextField } from '@material-ui/core';
import { classifications } from '../lookups/classifications';

import { colortree } from '../lookups/colortree';

export function MapClassificationSelect({
  selectedClassification,
  updateSelectedClassification,
  selectedNumericScheme,
  updateSelectedNumericScheme,
}) {
  return (
    <TextField
      style={{
        display: 'block',
        marginRight: '10px',
        marginBottom: '20px',
        width: '100%',
      }}
      id="numeric-classifications"
      select
      SelectProps={{
        native: true,
      }}
      label="Classifications"
      value={selectedClassification}
      onChange={evt => {
        const postfix = evt.target.value.split('_')[1];

        const schemes = Object.keys(colortree)
          .filter(d => colortree[d].count === Number(postfix))
          .map(d => {
            return { id: d, colors: colortree[d].colors };
          });

        const availableSchemeIds = schemes.map(d => d.id);

        // @ts-ignore
        updateSelectedClassification(evt.target.value);

        // update selected colorscheme if necessary
        if (!availableSchemeIds.includes(selectedNumericScheme)) {
          // get first scheme from above list of eligible schemes
          updateSelectedNumericScheme(schemes[0].id);
        }

        console.log('change map classification');
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
