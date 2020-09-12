// @ts-check
import React, { useState } from 'react';

import { stateLookup } from '../lookups/states';
import { countyLookup } from '../lookups/counties';

import { Dialog, DialogTitle, DialogContent, Grid } from '@material-ui/core';

import { MapTitleControl } from './MapTitleControl';
import { MapAttributeSelect } from './MapAttributeSelect';
import { MapColorschemeSelect } from './MapColorschemeSelect';
import { MapModalToggleButton } from './MapModalToggleButton';
import { DialogAdvancedToggle } from './DialogAdvancedToggle';
import { DialogNullZeroCheckboxes } from './DialogNullZeroCheckboxes';
import { MapClassificationSelect } from './MapClassificationSelect';

const AttributeSelector = ({
  infoMeta,
  selectedCategoricalScheme,
  updateSelectedCategoricalScheme,
  selectedNumericScheme,
  updateSelectedNumericScheme,
  selectedAttribute,
  updateSelectedAttribute,
  selectedAttributeRef,
  selectedClassification,
  updateSelectedClassification,
  advancedToggle,
  updateAdvancedToggle,
  zeroAsNull,
  updateZeroAsNull,
  nullAsZero,
  updateNullAsZero,
}) => {
  const [dialogOpen, updateDialogOpen] = useState(true);

  if (!infoMeta) {
    return null;
  }

  console.log('as render');

  const titleTextCounty = countyLookup(infoMeta.geoid);
  const titleTextState = stateLookup(infoMeta.geoid.slice(0, 2));

  const fieldMetadata = infoMeta.fieldMetadata;

  const categoricalKeys = Object.keys(fieldMetadata.categorical).sort();
  const numericKeys = Object.keys(fieldMetadata.numeric).sort();

  const numericIsSelected = selectedAttribute.slice(0, 3) === 'num';

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
                  selectedAttributeRef={selectedAttributeRef}
                  categoricalKeys={categoricalKeys}
                  numericKeys={numericKeys}
                />
              </Grid>
              <Grid item xs={6}>
                <MapColorschemeSelect
                  selectedAttribute={selectedAttribute}
                  selectedCategoricalScheme={selectedCategoricalScheme}
                  updateSelectedCategoricalScheme={updateSelectedCategoricalScheme}
                  selectedNumericScheme={selectedNumericScheme}
                  updateSelectedNumericScheme={updateSelectedNumericScheme}
                />
              </Grid>
              <Grid item xs={12}>
                {numericIsSelected ? (
                  <DialogAdvancedToggle
                    advancedToggle={advancedToggle}
                    updateAdvancedToggle={updateAdvancedToggle}
                  />
                ) : null}
              </Grid>
            </Grid>

            {advancedToggle && numericIsSelected ? (
              <Grid container spacing={2} style={{ overflowX: 'hidden' }}>
                <Grid item xs={6}>
                  <MapClassificationSelect
                    selectedClassification={selectedClassification}
                    updateSelectedClassification={updateSelectedClassification}
                    selectedNumericScheme={selectedNumericScheme}
                    updateSelectedNumericScheme={updateSelectedNumericScheme}
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
        </Dialog>
      </div>
    </div>
  );
};

export const AttributeSelectorMemo = React.memo(AttributeSelector);
