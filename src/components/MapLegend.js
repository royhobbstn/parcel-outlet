import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import { colortree } from '../lookups/colortree';
import { categorytree } from '../lookups/categorytree';

export function MapLegend({
  selectedCategoricalScheme,
  selectedNumericScheme,
  selectedAttribute,
  selectedClassification,
  zeroAsNull,
  infoMeta,
}) {
  let zeroFilters = [['!=', ['feature-state', 'selectedfeature'], null]];
  let colorStyle = 'cyan'; // string or array
  let lineStyle = 'cyan'; // string or array

  let filteredClasses = {};

  if (selectedAttribute === 'default') {
    // paints default (uses default colorStyle above)
  } else if (selectedAttribute.slice(0, 3) === 'cat') {
    const categoryAttribute = selectedAttribute.slice(4);
    const classes = infoMeta.fieldMetadata.categorical[categoryAttribute];
    filteredClasses = classes.filter(d => d.trim() !== '' && d !== 'null');

    zeroFilters.push(['!=', ['feature-state', 'selectedfeature'], '']);
    zeroFilters.push(['!=', ['feature-state', 'selectedfeature'], ' ']);
    zeroFilters.push(['!=', ['feature-state', 'selectedfeature'], 'null']);

    const breaks = [];
    const lineBreaks = [];

    for (let [index, value] of filteredClasses.entries()) {
      const nextColor = categorytree[selectedCategoricalScheme].colors[index];
      if (nextColor) {
        breaks.push(value);
        breaks.push(nextColor);
        lineBreaks.push(value);
        lineBreaks.push(nextColor);
      } else {
        break;
      }
    }

    breaks.push('darkslategrey'); // case of no match (others)
    lineBreaks.push('darkslategrey'); // outline grey to designate parcel without value

    colorStyle = [
      'case',
      ['all', ...zeroFilters],
      ['match', ['feature-state', 'selectedfeature'], ...breaks],
      'rgba(0, 0, 0, 0)',
    ];
    lineStyle = [
      'case',
      ['all', ...zeroFilters],
      ['match', ['feature-state', 'selectedfeature'], ...lineBreaks],
      'darkslategrey',
    ];
  } else if (selectedAttribute.slice(0, 3) === 'num') {
    const availableClassifications = infoMeta.fieldMetadata.numeric[selectedAttribute.slice(4)];
    const currentClassification = availableClassifications[selectedClassification.replace('_', '')];
    const currentColorscheme = colortree[selectedNumericScheme];

    const breaks = [];
    const lineBreaks = [];

    for (let i = 0; i < currentColorscheme.colors.length; i++) {
      breaks.push(currentColorscheme.colors[i]);
      lineBreaks.push(currentColorscheme.colors[i]);
      if (i < currentColorscheme.colors.length - 1) {
        breaks.push(currentClassification[i]);
        lineBreaks.push(currentClassification[i]);
      }
    }

    if (zeroAsNull) {
      zeroFilters.push(['!=', ['feature-state', 'selectedfeature'], 0]);
      zeroFilters.push(['!=', ['feature-state', 'selectedfeature'], '0']);
    }

    colorStyle = [
      'case',
      ['all', ...zeroFilters],
      ['step', ['feature-state', 'selectedfeature'], ...breaks],
      'rgba(0, 0, 0, 0)',
    ];
    lineStyle = [
      'case',
      ['all', ...zeroFilters],
      ['step', ['feature-state', 'selectedfeature'], ...lineBreaks],
      'rgba(0, 0, 0, 0)',
    ];
  }

  // if (selectedAttribute === 'default') {
  //   return null;
  // }

  return (
    <div
      className="map-title-control"
      style={{
        position: 'absolute',
        backgroundColor: 'inherit',
        zIndex: 100,
        width: 'auto',
        height: 'auto',
        bottom: '20px',
        left: '20px',
        outline: 'none',
        border: '1px solid white',
        padding: '10px 16px',
        borderRadius: '5px',
      }}
    >
      <Grid container spacing={2} style={{ overflowX: 'hidden' }}>
        <Grid item xs={12}>
          <Typography style={{ color: 'white' }}>{selectedAttribute.slice(4)}</Typography>
        </Grid>
        <Grid item xs={12}>
          {selectedAttribute.slice(0, 3) === 'cat' ? (
            <Grid item xs={12}>
              <Grid container spacing={2} style={{ overflowX: 'hidden' }}>
                {Object.keys(filteredClasses).map((index, key) => {
                  const nextColor = categorytree[selectedCategoricalScheme].colors[index];
                  if (nextColor) {
                    return (
                      <React.Fragment>
                        {' '}
                        <Grid item xs={3}>
                          <span
                            style={{
                              position: 'absolute',
                              width: '20px',
                              height: '15px',
                              backgroundColor: nextColor,
                              opacity: '0.6',
                            }}
                          ></span>
                        </Grid>
                        <Grid item xs={9}>
                          <span style={{ color: 'white' }}>{filteredClasses[key]}</span>
                        </Grid>
                      </React.Fragment>
                    );
                  } else {
                    return null;
                  }
                })}
              </Grid>
            </Grid>
          ) : null}
          {/* {selectedAttribute.slice(0, 3) === 'num' ? (
        <div>
          <span
            style={{
              top: '20px',
              left: '5px',
              width: '20px',
              height: '15px',
              backgroundColor: 'cyan',
              opacity: '0.6',
            }}
          ></span>
        </div>
      ) : null} */}
        </Grid>
      </Grid>
    </div>
  );
}
