import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import { style } from '../style/mapStyle.js';
import { key } from '../service/env';

import { stateLookup } from '../lookups/states';
import { countyLookup } from '../lookups/counties.js';

export class CoverageMap extends Component {
  componentDidMount() {
    mapboxgl.accessToken = key;
    window.map = new mapboxgl.Map({
      container: 'map',
      style,
      center: [-104.9, 39.75],
      zoom: 4,
      maxZoom: 13,
      minZoom: 3,
    });

    let hoveredStateId = null;

    const countyJsonLoad = window
      .fetch('/data/us_counties.geojson')
      .then(response => response.json());
    const stateJsonLoad = window.fetch('/data/us_states.geojson').then(response => response.json());

    window.map.on('load', () => {
      Promise.all([countyJsonLoad, stateJsonLoad])
        .then(geo => {
          const enriched = enrichGeometry(geo[0], this.props.inventory);

          window.map.addSource('counties', {
            type: 'geojson',
            data: enriched,
            generateId: true,
          });
          window.map.addSource('states', {
            type: 'geojson',
            data: geo[1],
          });
          window.map.addLayer({
            id: 'counties',
            type: 'fill',
            source: 'counties',
            layout: {},
            paint: {
              'fill-color': ['case', ['boolean', ['get', 'covered'], true], '#088', 'maroon'],
              'fill-opacity': [
                'case',
                [
                  'all',
                  ['boolean', ['to-boolean', ['feature-state', 'hover']], true],
                  ['boolean', ['get', 'covered'], true],
                ],
                0.8,
                ['boolean', ['get', 'covered'], true],
                0.4,
                ['boolean', ['to-boolean', ['feature-state', 'hover']], true],
                0.2,
                0.1,
              ],
            },
          });
          window.map.addLayer({
            id: 'states',
            type: 'line',
            source: 'states',
            layout: {},
            paint: {
              'line-color': '#627BC1',
              'line-width': 1,
            },
          });
        })
        .catch(err => console.log(err));
    });

    // When a click event occurs on a feature in the states layer, open a popup at the
    // location of the click, with description HTML from its properties.
    window.map.on('click', 'counties', e => {
      const feature = e.features[0].properties;

      if (!feature) {
        return;
      }

      const geoid = feature.GEOID;

      this.props.updateFocusCoverageGeoid(geoid);
      this.props.updateCoverageModalOpen(true);
    });

    // Change the cursor to a pointer when the mouse is over the states layer.
    window.map.on('mouseenter', 'counties', e => {
      const feature = e.features[0].properties;

      if (!feature) {
        return;
      }

      const state = feature.STATEFP;
      const county = feature.COUNTYFP;
      const titleGeo = `${countyLookup(state + county)}, ${stateLookup(state)}`;
      window.map.getCanvas().style.cursor = 'pointer';
      this.props.updateCoverageLabelText(titleGeo);
      this.props.updateCoverageLabelOpen(true);
    });

    // Change it back to a pointer when it leaves.
    window.map.on('mouseleave', 'counties', e => {
      window.map.getCanvas().style.cursor = '';
      this.props.updateCoverageLabelText('');
      this.props.updateCoverageLabelOpen(false);
    });

    // When the user moves their mouse over the state-fill layer, we'll update the
    // feature state for the feature under the mouse.
    window.map.on('mousemove', 'counties', e => {
      if (e.features.length > 0) {
        const state = e.features[0].properties.STATEFP;
        const county = e.features[0].properties.COUNTYFP;
        const titleGeo = `${countyLookup(state + county)}, ${stateLookup(state)}`;
        this.props.updateCoverageLabelText(titleGeo);

        if (hoveredStateId) {
          window.map.setFeatureState({ source: 'counties', id: hoveredStateId }, { hover: false });
        }
        hoveredStateId = e.features[0].id;
        window.map.setFeatureState({ source: 'counties', id: hoveredStateId }, { hover: true });
      }
    });

    // When the mouse leaves the state-fill layer, update the feature state of the
    // previously hovered feature.
    window.map.on('mouseleave', 'counties', function () {
      if (hoveredStateId) {
        window.map.setFeatureState({ source: 'counties', id: hoveredStateId }, { hover: false });
      }
      hoveredStateId = null;
    });

    window.map.on('error', event => console.log(event));
  }

  shouldComponentUpdate(nextProps, nextState, _) {
    return false;
  }

  render() {
    return <div id="map" />;
  }
}

function enrichGeometry(geo, inventory) {
  const hash = {};
  const links = {};

  Object.keys(inventory).forEach(key => {
    hash[key] = true;

    if (!links[key]) {
      links[key] = [];
    }

    const sources = inventory[key].sources;

    Object.keys(sources).forEach(sourceKey => {
      links[key].push(sources[sourceKey].source_name);
    });
  });

  geo.features.forEach(feature => {
    feature.properties.covered = !!hash[feature.properties.GEOID];
    feature.properties.links = links[feature.properties.GEOID];
  });

  return geo;
}
