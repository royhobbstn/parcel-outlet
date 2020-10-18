// @ts-check
import React, { useState } from 'react';

import { stateLookup } from '../lookups/states';
import { countyLookup } from '../lookups/counties';
import { countySubLookup } from '../lookups/countysubs';

import { Dialog, DialogTitle, DialogContent, Grid } from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';

import { MapTitleControl } from './MapTitleControl';
import { MapLegend } from './MapLegend';
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
  featureAttributes,
}) => {
  const [dialogOpen, updateDialogOpen] = useState(false);

  if (!infoMeta) {
    return null;
  }

  const isCountySub = Boolean(infoMeta.fipsDetails.COUNTYSUBFIPS);

  const titleTextCounty = isCountySub
    ? countySubLookup(infoMeta.geoid)
    : countyLookup(infoMeta.geoid);
  const titleTextState = stateLookup(infoMeta.geoid.slice(0, 2));

  const fieldMetadata = infoMeta.fieldMetadata;

  const categoricalKeys = Object.keys(fieldMetadata.categorical).sort();
  const numericKeys = Object.keys(fieldMetadata.numeric).sort();

  const numericIsSelected = selectedAttribute.slice(0, 3) === 'num';

  const firstRowWidth = selectedAttribute === 'default' ? 12 : 6;

  return (
    <div>
      <MapTitleControl title={titleTextCounty + ', ' + titleTextState} />
      <MapLegend
        selectedCategoricalScheme={selectedCategoricalScheme}
        selectedNumericScheme={selectedNumericScheme}
        selectedAttribute={selectedAttribute}
        selectedClassification={selectedClassification}
        zeroAsNull={zeroAsNull}
        infoMeta={infoMeta}
      />

      <MapModalToggleButton updateDialogOpen={updateDialogOpen} dialogOpen={dialogOpen} />

      <Dialog
        id="attributeselector"
        PaperProps={{
          style: {
            backgroundColor: '#343332',
            color: 'white',
          },
        }}
        hideBackdrop={true}
        onClose={() => {
          updateDialogOpen(false);
        }}
        aria-labelledby="customized-dialog-title"
        open={dialogOpen}
      >
        <DialogTitle id="customized-dialog-title" style={{ borderBottom: '1px solid grey' }}>
          Change Map Style
          <IconButton
            style={{ position: 'absolute', right: '5px', top: '8px', color: 'white' }}
            onClick={() => {
              updateDialogOpen(false);
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} style={{ overflowX: 'hidden' }}>
            <Grid item xs={firstRowWidth}>
              <MapAttributeSelect
                selectedAttribute={selectedAttribute}
                updateSelectedAttribute={updateSelectedAttribute}
                selectedAttributeRef={selectedAttributeRef}
                categoricalKeys={categoricalKeys}
                numericKeys={numericKeys}
                featureAttributes={featureAttributes}
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
                />
              </Grid>
            </Grid>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const AttributeSelectorMemo = React.memo(AttributeSelector);
