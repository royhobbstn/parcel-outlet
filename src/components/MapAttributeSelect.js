import React from 'react';
import { TextField } from '@material-ui/core';

export function MapAttributeSelect({
  selectedAttribute,
  updateSelectedAttribute,
  selectedAttributeRef,
  categoricalKeys,
  numericKeys,
}) {
  return (
    <TextField
      style={{
        display: 'block',
        marginRight: '10px',
        marginBottom: '20px',
        width: '180px',
      }}
      id="attribute-selector"
      select
      SelectProps={{
        native: true,
      }}
      label="Attribute"
      value={selectedAttribute}
      onChange={evt => {
        // @ts-ignore
        updateSelectedAttribute(evt.target.value);
        selectedAttributeRef.current = evt.target.value;
      }}
      variant="outlined"
    >
      <option key="default" value="default">
        Default (None)
      </option>
      <optgroup label="Categorical">
        {categoricalKeys.map(option => (
          <option key={option} value={'cat_' + option}>
            {option}
          </option>
        ))}
      </optgroup>
      <optgroup label="Numeric">
        {numericKeys.map(option => (
          <option key={option} value={'num_' + option}>
            {option}
          </option>
        ))}
      </optgroup>
    </TextField>
  );
}
