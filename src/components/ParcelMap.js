import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import ndjsonStream from 'can-ndjson-stream';
import { tileBase, key } from '../service/env';

export class ParcelMap extends Component {
  componentDidMount() {
    // edge case to make sure the coverage modal is closed.
    // because if they change the map (which only changes querystring), it cant be recognized without a lot of work
    this.props.updateCoverageModalOpen(false);

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

    const productId = getUrlParameter('prid');
    if (!productId) {
      console.error('sorry, please provide a prid');
    }

    const info = window
      .fetch(`${tileBase[0]}/${productId}/info.json`)
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
            window.map.fitBounds(boundsArray, { animate: false });
          }

          // add download buttons to AppBar (possible race condition here?)
          populateProductDownloads(this.props.inventory, this.props.updateFocusDownload, data);

          window.map.addLayer({
            id: 'parcels',
            'source-layer': data.layername,
            source: {
              maxzoom: data.maxZoom || Number(data.generatedMetadata.maxzoom), // todo eventually remove the former, replaced by grabbing straight from auto generated tippecanoe metadata output
              promoteId: '__po_id',
              type: 'vector',
              tiles: tileBase.map(base => {
                return `${base}/${productId}/{z}/{x}/{y}.pbf`;
              }),
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

      window.map.on('error', event => {
        if (event.error && event.error.status === 403) {
          // ignore missing / forbidden tile error from S3
          return;
        } else {
          console.error(event && event.error);
        }
      });

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

        const duplicates = {};
        const storedFeatures = [];

        e.features.forEach(feature => {
          const id = feature.properties.__po_id;
          if (!duplicates[id]) {
            storedFeatures.push(feature);
          }
          duplicates[id] = true;
        });

        const productId = getUrlParameter('prid');

        const missingClustersSet = new Set();

        if (!this.props.allFeatureAttributes.current[productId]) {
          this.props.allFeatureAttributes.current[productId] = {};
        }

        storedFeatures.forEach(feature => {
          if (!this.props.allFeatureAttributes.current[productId][feature.properties.__po_id]) {
            missingClustersSet.add(feature.properties.__po_cl);
          }
          return feature.properties.__po_id;
        });

        const missingClusters = Array.from(missingClustersSet);

        const data = {};

        if (missingClusters.length) {
          await Promise.all(
            missingClusters.map(cluster => {
              return new Promise((resolve, reject) => {
                window
                  .fetch(`${tileBase[0]}/${productId}/attributes/cl_${cluster}.ndjson`)
                  .then(async response => {
                    const exampleReader = ndjsonStream(response.body).getReader();

                    let result;
                    while (!result || !result.done) {
                      result = await exampleReader.read();
                      if (result.value) {
                        data[result.value.__po_id] = result.value;
                      }
                    }
                    resolve();
                  })
                  .catch(err => {
                    console.error(err);
                    reject();
                  });
              });
            }),
          );

          this.props.allFeatureAttributes.current[productId] = Object.assign(
            {},
            this.props.allFeatureAttributes.current[productId],
            data,
          );
        }

        // corral the information just for the features you need
        // ends up being an array of feature properties objects

        const attributeData = storedFeatures.map(feature => {
          return this.props.allFeatureAttributes.current[productId][feature.properties.__po_id];
        });

        this.props.updateMapAttributesModalOpen(true);
        this.props.updateCurrentFeatureAttributes(attributeData);
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
