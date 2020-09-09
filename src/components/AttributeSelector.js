// @ts-check
import React, { useState } from 'react';

import { stateLookup } from '../lookups/states';
import { countyLookup } from '../lookups/counties';

import {
  MenuItem,
  TextField,
  Switch,
  Typography,
  FormControl,
  FormControlLabel,
  Checkbox,
  FormLabel,
  FormHelperText,
  FormGroup,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@material-ui/core';

import BrushIcon from '@material-ui/icons/Brush';

const darkCategorical = [
  '#a6cee3',
  '#1f78b4',
  '#b2df8a',
  '#33a02c',
  '#fb9a99',
  '#e31a1c',
  '#fdbf6f',
  '#ff7f00',
  '#cab2d6',
  '#6a3d9a',
  '#ffff99',
];

const lightCategorical = [
  '#8dd3c7',
  '#ffffb3',
  '#bebada',
  '#fb8072',
  '#80b1d3',
  '#fdb462',
  '#b3de69',
  '#fccde5',
  '#d9d9d9',
  '#bc80bd',
  '#ccebc5',
];

const classifications = [
  'ckmeans5',
  'ckmeans7',
  'ckmeans9',
  'quantile5',
  'quantile7',
  'quantile9',
  'quantile11',
  'stddev7',
  'stddev8',
];

export function AttributeSelector(props) {
  const [selectedCategoricalScheme, updateSelectedCategoricalScheme] = useState('dark');
  const [selectedAttribute, updateSelectedAttribute] = useState('default');
  const [selectedClassification, updateSelectedClassification] = useState(classifications[0]);
  const [advancedToggle, updateAdvancedToggle] = useState(false);
  const [zeroAsNull, updateZeroAsNull] = useState(false);
  const [nullAsZero, updateNullAsZero] = useState(false);
  const [dialogOpen, updateDialogOpen] = useState(false);

  const infoMeta = props.infoMeta;
  if (!infoMeta) {
    return null;
  }

  console.log(infoMeta);

  const titleTextCounty = countyLookup(infoMeta.geoid);
  const titleTextState = stateLookup(infoMeta.geoid.slice(0, 2));

  const fieldMetadata = infoMeta.fieldMetadata;

  const categoricalKeys = Object.keys(fieldMetadata.categorical).sort();
  const numericKeys = Object.keys(fieldMetadata.numeric).sort();

  // show color schemes

  // every single possible color palette per selected scheme

  // consider 0 to be (0) / null
  // consider null to be (0) / null

  // note null values filtered out.

  return (
    <div>
      <Typography
        style={{
          position: 'absolute',
          backgroundColor: 'white',
          zIndex: 100,
          width: 'auto',
          height: 'auto',
          top: '90px',
          right: '20px',
          outline: 'none',
          padding: '10px 16px',
          borderRadius: '5px',
        }}
        className="map-title-control"
      >
        {titleTextCounty + ', ' + titleTextState}
      </Typography>
      <IconButton
        style={{
          position: 'absolute',
          backgroundColor: 'white',
          zIndex: 100,
          top: '150px',
          right: '20px',
          padding: '10px',
        }}
        className="map-title-control"
        onClick={() => {
          updateDialogOpen(!dialogOpen);
        }}
      >
        <BrushIcon />
      </IconButton>

      <div>
        <Dialog
          onClose={() => {
            updateDialogOpen(false);
          }}
          aria-labelledby="customized-dialog-title"
          open={dialogOpen}
        >
          <DialogTitle id="customized-dialog-title">Change Map Style</DialogTitle>
          <DialogContent dividers>
            <div style={{ clear: 'both' }}>
              <TextField
                style={{
                  float: 'right',
                  display: 'block',
                  marginRight: '10px',
                  marginBottom: '20px',
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
                }}
                variant="outlined"
              >
                <option key="default" value="default">
                  Default (None)
                </option>
                <optgroup label="Categorical">
                  {categoricalKeys.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Numeric">
                  {numericKeys.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </optgroup>
              </TextField>
            </div>

            <div style={{ clear: 'both' }}>
              <TextField
                style={{
                  float: 'right',
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

            <div style={{ clear: 'both' }}>
              <div style={{ float: 'right', marginRight: '10px', marginBottom: '20px' }}>
                <Typography
                  style={{
                    lineHeight: '2.5',
                    float: 'left',
                  }}
                >
                  Advanced
                </Typography>

                <Switch
                  style={{ float: 'right' }}
                  checked={advancedToggle}
                  onChange={evt => {
                    // @ts-ignore
                    updateAdvancedToggle(!advancedToggle);
                  }}
                  color="primary"
                  name="advanced-toggle"
                  inputProps={{ 'aria-label': 'primary checkbox' }}
                />
              </div>
            </div>

            {advancedToggle ? (
              <div>
                <div style={{ clear: 'both' }}>
                  <TextField
                    style={{
                      float: 'right',
                      display: 'block',
                      marginRight: '10px',
                      marginBottom: '20px',
                    }}
                    id="numeric-classifications"
                    select
                    SelectProps={{
                      native: true,
                    }}
                    label="Classifications"
                    value={selectedClassification}
                    onChange={evt => {
                      // @ts-ignore
                      updateSelectedClassification(evt.target.value);
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
                </div>

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
              </div>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={() => {
                updateDialogOpen(false);
              }}
              color="primary"
            >
              Save changes
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
