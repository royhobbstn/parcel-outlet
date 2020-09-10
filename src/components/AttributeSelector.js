// @ts-check
import React, { useState } from 'react';

import { stateLookup } from '../lookups/states';
import { countyLookup } from '../lookups/counties';

import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@material-ui/core';

import { MapTitleControl } from './MapTitleControl';
import { MapAttributeSelect } from './MapAttributeSelect';
import { MapColorschemeSelect } from './MapColorschemeSelect';
import { MapModalToggleButton } from './MapModalToggleButton';
import { DialogAdvancedToggle } from './DialogAdvancedToggle';
import { DialogNullZeroCheckboxes } from './DialogNullZeroCheckboxes';
import { MapClassificationSelect } from './MapClassificationSelect';
import { classifications } from '../lookups/styleData';

export function AttributeSelector(props) {
  const [selectedCategoricalScheme, updateSelectedCategoricalScheme] = useState('dark');
  const [selectedAttribute, updateSelectedAttribute] = useState('default');
  const [selectedClassification, updateSelectedClassification] = useState(classifications[0]);
  const [advancedToggle, updateAdvancedToggle] = useState(false);
  const [zeroAsNull, updateZeroAsNull] = useState(false);
  const [nullAsZero, updateNullAsZero] = useState(false);
  const [dialogOpen, updateDialogOpen] = useState(true);

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

  return (
    <div>
      <MapTitleControl title={titleTextCounty + ', ' + titleTextState} />
      <MapModalToggleButton updateDialogOpen={updateDialogOpen} dialogOpen={dialogOpen} />

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
            <Grid container spacing={2} style={{ overflowX: 'hidden' }}>
              <Grid item xs={6}>
                <MapAttributeSelect
                  selectedAttribute={selectedAttribute}
                  updateSelectedAttribute={updateSelectedAttribute}
                  categoricalKeys={categoricalKeys}
                  numericKeys={numericKeys}
                />
              </Grid>
              <Grid item xs={6}>
                <MapColorschemeSelect
                  selectedCategoricalScheme={selectedCategoricalScheme}
                  updateSelectedCategoricalScheme={updateSelectedCategoricalScheme}
                />
              </Grid>
              <Grid item xs={12}>
                <DialogAdvancedToggle
                  advancedToggle={advancedToggle}
                  updateAdvancedToggle={updateAdvancedToggle}
                />
              </Grid>
            </Grid>

            {advancedToggle ? (
              <Grid container spacing={2} style={{ overflowX: 'hidden' }}>
                <Grid item xs={6}>
                  <MapClassificationSelect
                    selectedClassification={selectedClassification}
                    updateSelectedClassification={updateSelectedClassification}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DialogNullZeroCheckboxes
                    zeroAsNull={zeroAsNull}
                    updateZeroAsNull={updateZeroAsNull}
                    nullAsZero={nullAsZero}
                    updateNullAsZero={updateNullAsZero}
                  />
                </Grid>
              </Grid>
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
