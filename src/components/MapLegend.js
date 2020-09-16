import React, { useState } from 'react';
import { Typography, Grid } from '@material-ui/core';
import { colortree } from '../lookups/colortree';
import { categorytree } from '../lookups/categorytree';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';

export function MapLegend({
  selectedCategoricalScheme,
  selectedNumericScheme,
  selectedAttribute,
  selectedClassification,
  zeroAsNull,
  infoMeta,
}) {
  const [legendIsOpen, toggleLegendIsOpen] = useState(true);

  let filteredClasses = {};
  let currentClassification;
  let currentColorscheme;

  if (selectedAttribute.slice(0, 3) === 'cat') {
    const categoryAttribute = selectedAttribute.slice(4);
    const classes = infoMeta.fieldMetadata.categorical[categoryAttribute];
    filteredClasses = classes.filter(d => d.trim() !== '' && d !== 'null');
  } else if (selectedAttribute.slice(0, 3) === 'num') {
    const availableClassifications = infoMeta.fieldMetadata.numeric[selectedAttribute.slice(4)];
    currentClassification = availableClassifications[selectedClassification.replace('_', '')];
    currentColorscheme = colortree[selectedNumericScheme];

    // if (zeroAsNull)
  }

  if (selectedAttribute === 'default') {
    return null;
  }

  return (
    <div
      className="map-title-control"
      style={{
        position: 'absolute',
        opacity: 0.8,
        backgroundColor: '#343332',
        zIndex: 100,
        width: 'auto',
        height: legendIsOpen ? 'auto' : '50px',
        overflow: 'hidden',
        bottom: '20px',
        left: '5px',
        outline: 'none',
        border: '1px solid white',
        padding: '10px 16px',
        borderRadius: '5px',
      }}
    >
      <Grid container spacing={2} style={{ overflowX: 'hidden' }}>
        <Grid item xs={12}>
          <IconButton
            style={{ position: 'absolute', top: '0px', right: '0px' }}
            onClick={() => {
              toggleLegendIsOpen(!legendIsOpen);
            }}
          >
            {legendIsOpen ? (
              <ExpandMore style={{ fill: 'white' }} />
            ) : (
              <ExpandLess style={{ fill: 'white' }} />
            )}
          </IconButton>
          <Typography style={{ color: 'white' }}>{selectedAttribute.slice(4)}</Typography>
        </Grid>
        <Grid item xs={12}>
          {selectedAttribute.slice(0, 3) === 'cat' ? (
            <Grid item xs={12}>
              <Grid container spacing={1} style={{ overflowX: 'hidden' }}>
                {Object.keys(filteredClasses).map((index, key) => {
                  const nextColor = categorytree[selectedCategoricalScheme].colors[index];
                  if (nextColor) {
                    return (
                      <React.Fragment key={filteredClasses[key]}>
                        <Grid item xs={1}>
                          <span
                            style={{
                              position: 'absolute',
                              width: '20px',
                              height: '15px',
                              backgroundColor: nextColor,
                              borderRadius: '3px',
                              borderWidth: '1px',
                              borderStyle: 'solid',
                              borderColor: nextColor,
                              opacity: 0.8,
                            }}
                          ></span>
                        </Grid>
                        <Grid item xs={2}>
                          <span style={{ color: 'white' }}>{filteredClasses[key]}</span>
                        </Grid>
                      </React.Fragment>
                    );
                  } else {
                    return null;
                  }
                })}
                {Object.keys(filteredClasses).length >=
                categorytree[selectedCategoricalScheme].count ? (
                  <React.Fragment>
                    <Grid item xs={1}>
                      <span
                        style={{
                          position: 'absolute',
                          width: '20px',
                          height: '15px',
                          backgroundColor: 'darkslategrey',
                          borderRadius: '3px',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: 'darkslategrey',
                          opacity: 0.8,
                        }}
                      ></span>
                    </Grid>
                    <Grid item xs={2}>
                      <span style={{ color: 'white' }}>Other Values</span>
                    </Grid>
                  </React.Fragment>
                ) : null}
              </Grid>
            </Grid>
          ) : null}
          {selectedAttribute.slice(0, 3) === 'num' ? (
            <Grid item xs={12}>
              <Grid container spacing={1} style={{ overflowX: 'hidden' }}>
                {currentColorscheme.colors.map((color, index) => {
                  return (
                    <React.Fragment key={color}>
                      <Grid item xs={1}>
                        <span
                          style={{
                            position: 'absolute',
                            width: '20px',
                            height: '15px',
                            backgroundColor: color,
                            borderRadius: '3px',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: color,
                            opacity: 0.8,
                          }}
                        ></span>
                      </Grid>

                      {index === 0 ? (
                        <Grid item xs={2}>
                          <span style={{ color: 'white' }}>
                            &le; {currentClassification[index].toLocaleString()}
                          </span>
                        </Grid>
                      ) : index === currentColorscheme.colors.length - 1 ? (
                        <Grid item xs={2}>
                          <span style={{ color: 'white' }}>
                            &gt; {currentClassification[index - 1].toLocaleString()}
                          </span>
                        </Grid>
                      ) : (
                        <Grid item xs={2}>
                          <span style={{ color: 'white' }}>
                            {currentClassification[index - 1].toLocaleString()} to{' '}
                            {currentClassification[index].toLocaleString()}
                          </span>
                        </Grid>
                      )}
                    </React.Fragment>
                  );
                })}
              </Grid>
            </Grid>
          ) : null}
        </Grid>
      </Grid>
    </div>
  );
}
