import React from 'react';
import {
  FormControl,
  FormControlLabel,
  Checkbox,
  FormLabel,
  FormHelperText,
  FormGroup,
} from '@material-ui/core';

export function DialogNullZeroCheckboxes({ zeroAsNull, updateZeroAsNull }) {
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend" style={{ color: 'white', fontSize: '1rem', fontWeight: 400 }}>
        Convert Data
      </FormLabel>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={zeroAsNull}
              onChange={() => {
                updateZeroAsNull(!zeroAsNull);
                console.log('update zero null');
              }}
              name="zeroAsNull"
            />
          }
          label="0 to null"
        />
      </FormGroup>
      <FormHelperText style={{ color: 'white' }}>Null parcels are filtered out.</FormHelperText>
    </FormControl>
  );
}
