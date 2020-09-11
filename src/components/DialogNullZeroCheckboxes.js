import React from 'react';
import {
  FormControl,
  FormControlLabel,
  Checkbox,
  FormLabel,
  FormHelperText,
  FormGroup,
} from '@material-ui/core';

export function DialogNullZeroCheckboxes({
  zeroAsNull,
  updateZeroAsNull,
  nullAsZero,
  updateNullAsZero,
}) {
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">Convert Data</FormLabel>
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
        <FormControlLabel
          control={
            <Checkbox
              checked={nullAsZero}
              onChange={() => {
                updateNullAsZero(!nullAsZero);
                console.log('update null zero');
              }}
              name="nullAsZero"
            />
          }
          label="null to 0"
        />
      </FormGroup>
      <FormHelperText>Null parcels are filtered out.</FormHelperText>
    </FormControl>
  );
}
