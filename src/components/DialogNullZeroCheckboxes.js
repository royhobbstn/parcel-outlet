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
      <FormLabel component="legend">Data Classification</FormLabel>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={zeroAsNull}
              onChange={() => {
                updateZeroAsNull(!zeroAsNull);
              }}
              name="zeroAsNull"
            />
          }
          label="Consider 0 to be null"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={nullAsZero}
              onChange={() => {
                updateNullAsZero(!nullAsZero);
              }}
              name="nullAsZero"
            />
          }
          label="Consider null to be 0"
        />
      </FormGroup>
      <FormHelperText>Null parcels are filtered out.</FormHelperText>
    </FormControl>
  );
}
