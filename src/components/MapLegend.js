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

  let currentColors;
  let currentClasses;

  const backgroundHex = '#343332';

  let isIntegerClassification = false;

  if (selectedAttribute.slice(0, 3) === 'cat') {
    const categoryAttribute = selectedAttribute.slice(4);
    const classes = infoMeta.fieldMetadata.categorical[categoryAttribute];
    filteredClasses = classes.filter(d => d.trim() !== '' && d !== 'null');
  } else if (selectedAttribute.slice(0, 3) === 'num') {
    const availableClassifications = infoMeta.fieldMetadata.numeric[selectedAttribute.slice(4)];
    currentClassification = availableClassifications[selectedClassification.replace('_', '')];
    currentColorscheme = colortree[selectedNumericScheme];

    // deduct classification values that are duplicates
    currentColors = [...currentColorscheme.colors];
    currentClasses = [...currentClassification].reduce((acc, current, idx, arr) => {
      if (arr[idx] !== arr[idx + 1]) {
        acc.push(current);
      } else {
        currentColors.shift();
      }
      return acc;
    }, []);

    isIntegerClassification = currentClasses.every(d => isInteger(d));
  }

  if (selectedAttribute === 'default') {
    return null;
  }

  const spanStyle = {
    marginLeft: '28px',
    color: 'white',
    lineHeight: '15px',
    verticalAlign: 'top',
  };

  return (
    <div
      className="map-title-control"
      style={{
        position: 'absolute',
        opacity: 0.97,
        backgroundColor: backgroundHex,
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
                    console.log(nextColor, backgroundHex);
                    console.log(applyTransparency(nextColor, backgroundHex, 0.8));
                    return (
                      <React.Fragment key={filteredClasses[key]}>
                        <Grid item xs={3}>
                          <span
                            style={{
                              position: 'absolute',
                              width: '20px',
                              height: '15px',
                              backgroundColor: applyTransparency(nextColor, backgroundHex, 0.8),
                              border: '1px solid ' + nextColor,
                            }}
                          ></span>
                          <span style={spanStyle}>{filteredClasses[key]}</span>
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
                    <Grid item xs={3}>
                      <span
                        style={{
                          position: 'absolute',
                          width: '20px',
                          height: '15px',
                          backgroundColor: applyTransparency('#2f4f4f', backgroundHex, 0.8),
                          border: '1px solid darkslategrey',
                        }}
                      ></span>
                      <span style={spanStyle}>Other Values</span>
                    </Grid>
                  </React.Fragment>
                ) : null}
              </Grid>
            </Grid>
          ) : null}
          {selectedAttribute.slice(0, 3) === 'num' ? (
            <Grid item xs={12}>
              <Grid container spacing={1} style={{ overflowX: 'hidden' }}>
                {currentColors.map((color, index) => {
                  return (
                    <React.Fragment key={color}>
                      <Grid item xs={3}>
                        <span
                          style={{
                            position: 'absolute',
                            width: '20px',
                            height: '15px',
                            backgroundColor: applyTransparency(color, backgroundHex, 0.8),
                            border: '1px solid ' + color,
                          }}
                        ></span>

                        {index === 0 ? (
                          <span style={spanStyle}>
                            &le; {currentClasses[index].toLocaleString()}
                          </span>
                        ) : index === currentColors.length - 1 ? (
                          <span style={spanStyle}>
                            &gt; {currentClasses[index - 1].toLocaleString()}
                          </span>
                        ) : (
                          <span style={spanStyle}>
                            {(
                              currentClasses[index - 1] + (isIntegerClassification ? 1 : 0.001)
                            ).toLocaleString()}{' '}
                            to {currentClasses[index].toLocaleString()}
                          </span>
                        )}
                      </Grid>
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

function applyTransparency(foregroundHex, backgroundHex, opacity) {
  const backgroundColor = toRgbArray(hexToRgb(backgroundHex));
  const foregroundColor = toRgbArray(hexToRgb(foregroundHex));
  const newColor = afterOpacity(foregroundColor, opacity, backgroundColor);
  return toRgbString(newColor);
}

function afterOpacity(fg, o, bg = [255, 255, 255]) {
  return fg.map((colFg, idx) => parseInt(o * colFg + (1 - o) * bg[idx]), 10);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function toRgbArray(obj) {
  return [obj.r, obj.g, obj.b];
}

function toRgbString(arr) {
  return `rgb(${arr[0]},${arr[1]},${arr[2]})`;
}

function isInteger(value) {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}
