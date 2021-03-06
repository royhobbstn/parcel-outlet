import React from 'react';
import { TextField } from '@material-ui/core';

export function MapAttributeSelect({
  selectedAttribute,
  updateSelectedAttribute,
  selectedAttributeRef,
  categoricalKeys,
  numericKeys,
  featureAttributes,
}) {
  return (
    <TextField
      style={{
        display: 'block',
        marginTop: '20px',
        marginRight: '10px',
        marginBottom: '20px',
        width: '100%',
      }}
      id="attribute-selector"
      select
      SelectProps={{
        native: true,
      }}
      label="Attribute"
      value={selectedAttribute}
      onChange={evt => {
        featureAttributes.current = {};
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
