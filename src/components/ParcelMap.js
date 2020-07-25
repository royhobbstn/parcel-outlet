import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import ndjsonStream from 'can-ndjson-stream';
import { tileBase, key } from '../service/env';

export class ParcelMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      feature_attributes: {},
    };
  }

  componentDidMount() {
    mapboxgl.accessToken = key;
    window.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v9',
      center: [-88, 44.5],
      zoom: 3,
      maxZoom: 20,
      minZoom: 1,
    });

    window.popup = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: true,
    });

    let hoveredStateId = null;

    let data = null;

    // todo parse querystring params here
    const productId = getUrlParameter('prid');
    if (!productId) {
      console.log('sorry, please provide a prid');
      // todo visual UI saying not availabe and link back to parcel-outlet or overview map
    }

    // todo promise here to fetch info.json file
    const info = window
      .fetch(`${tileBase}/${productId}/info.json`)
      .then(response => response.json());

    window.map.on('load', () => {
      //
      info
        .then(response => {
          data = response;

          // set map extent here with new generated metadata values
          // TODO remove if-check when clear current old tilesets from dev
          if (data.generatedMetadata && data.generatedMetadata.bounds) {
            const boundsArray = data.generatedMetadata.bounds.split(',').map(d => Number(d));
            window.map.fitBounds(boundsArray);
          }

          // add download buttons to AppBar (possible race condition here?)
          populateProductDownloads(this.props.inventory, this.props.updateFocusDownload, data);

          window.map.addLayer({
            id: 'parcels',
            'source-layer': data.layername,
            source: {
              maxzoom: data.maxZoom || data.generatedMetadata.maxzoom, // todo eventually remove the former, replaced by grabbing straight from auto generated tippecanoe metadata output
              promoteId: '__po_id',
              type: 'vector',
              tiles: [`${tileBase}/${productId}/{z}/{x}/{y}.pbf`],
            },
            type: 'fill',
            layout: {},
            paint: {
              'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.5, 0.2],
              'fill-color': 'cyan',
              'fill-outline-color': 'cyan',
            },
          });
        })
        .catch(err => {
          console.error(err);
          // todo: message data no longer here.  redirect options.
        });

      //

      window.map.on('mousemove', 'parcels', function (e) {
        if (!(e.features && e.features[0])) {
          return;
        }

        window.map.getCanvas().style.cursor = 'pointer';

        if (e.features.length > 0) {
          if (hoveredStateId) {
            window.map.setFeatureState(
              { source: 'parcels', sourceLayer: data.layername, id: hoveredStateId },
              { hover: false },
            );
          }
          hoveredStateId = e.features[0].properties.__po_id;

          window.map.setFeatureState(
            { source: 'parcels', sourceLayer: data.layername, id: hoveredStateId },
            { hover: true },
          );
        }
      });

      window.map.on('mouseleave', 'parcels', function () {
        window.map.getCanvas().style.cursor = '';
        if (hoveredStateId) {
          window.map.setFeatureState(
            { source: 'parcels', sourceLayer: data.layername, id: hoveredStateId },
            { hover: false },
          );
        }
        hoveredStateId = null;
      });

      window.map.on('click', 'parcels', async e => {
        if (!(e.features && e.features[0])) {
          return;
        }

        const cluster = e.features[0].properties.__po_cl;
        const featureId = e.features[0].properties.__po_id;
        const coordinates = e.lngLat;

        if (!this.state.feature_attributes[featureId]) {
          // todo spinner

          const response = await window.fetch(
            `${tileBase}/${productId}/attributes/cl_${cluster}.ndjson`,
          );

          const exampleReader = ndjsonStream(response.body).getReader();

          let result;
          let data = {};
          while (!result || !result.done) {
            result = await exampleReader.read();
            if (result.value) {
              data[result.value.__po_id] = result.value;
            }
          }

          const description = data[featureId];
          window.popup.setLngLat(coordinates).setHTML(renderPopup(description)).addTo(window.map);
          this.setState({
            feature_attributes: Object.assign({}, this.state.feature_attributes, data),
          });
        } else {
          const description = this.state.feature_attributes[featureId];
          window.popup.setLngLat(coordinates).setHTML(renderPopup(description)).addTo(window.map);
        }
      });
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }

  render() {
    return <div id="map" />;
  }
}

function displayValue(value) {
  if (typeof value === 'undefined' || value === null) return value;
  if (typeof value === 'object' || typeof value === 'number' || typeof value === 'string')
    return value.toString();
  return value;
}
function renderProperty(propertyName, property) {
  return (
    '<div class="mbview_property">' +
    '<div class="mbview_property-name">' +
    propertyName +
    '</div>' +
    '<div class="mbview_property-value">' +
    displayValue(property) +
    '</div>' +
    '</div>'
  );
}

function renderProperties(properties) {
  var renderedProperties = Object.keys(properties)
    .filter(d => d !== '__po_id')
    .map(function (propertyName) {
      return renderProperty(propertyName, properties[propertyName]);
    });
  return renderedProperties.join('');
}

function renderPopup(properties) {
  return (
    '<div class="mbview_popup"><div class="mbview_feature">' +
    renderProperties(properties) +
    '</div></div>'
  );
}

function getUrlParameter(name) {
  // eslint-disable-next-line
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(window.location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function populateProductDownloads(inventory, updateFocusDownload, metadata) {
  const focusGeo = inventory[metadata.geoid];

  let focusSource;
  let focusDownload;

  for (let sourceKey of Object.keys(focusGeo.sources)) {
    focusSource = focusGeo.sources[sourceKey];
    if (focusGeo.sources[sourceKey].downloads[metadata.downloadId]) {
      focusDownload = focusGeo.sources[sourceKey].downloads[metadata.downloadId];
      break;
    }
  }

  const geoname = focusGeo.geoname;
  const geoid = focusGeo.geoid;
  const source_name = focusSource.source_name;
  const last_checked = focusSource.last_checked;

  if (!focusDownload) {
    console.error('Could not find associated products');
  } else {
    updateFocusDownload({ ...focusDownload, geoname, geoid, source_name, last_checked });
  }
}
