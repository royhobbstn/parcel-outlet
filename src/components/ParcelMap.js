import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import ndjsonStream from 'can-ndjson-stream';
import { tileBase, key } from '../service/env';
let layer_add = 0;

export class ParcelMap extends Component {
  constructor() {
    super();
    this.loadedClusters = {};
    this.clustersInTransit = {};
    this.selectedFeatureAttribute = 'GIS_AREA';
  }

  componentDidMount() {
    // edge case to make sure the coverage modal is closed.
    // because if they change the map (which only changes querystring), it cant be recognized without a lot of work
    this.props.updateCoverageModalOpen(false);

    mapboxgl.accessToken = key;
    window.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v9',
      center: [-88, 44.5],
      zoom: 4,
      maxZoom: 20,
      minZoom: 4,
    });

    window.popup = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: true,
    });

    let hoveredStateId = null;

    let infoMeta = null;

    const productId = getUrlParameter('prid');
    if (!productId) {
      console.error('sorry, please provide a prid');
    }

    const info = window
      .fetch(`${tileBase[0]}/${productId}/info.json`)
      .then(response => response.json());

    const hull = window
      .fetch(`${tileBase[0]}/${productId}/feature_hulls.geojson`)
      .then(response => response.json());

    window.map.on('load', () => {
      //
      Promise.all([info, hull])
        .then(response => {
          infoMeta = response[0];
          const geoHull = response[1];

          // set map extent here with new generated metadata values
          const boundsArray = infoMeta.generatedMetadata.bounds.split(',').map(d => Number(d));
          window.map.fitBounds(boundsArray, { animate: false });

          // add download buttons to AppBar (possible race condition here?)
          populateProductDownloads(this.props.inventory, this.props.updateFocusDownload, infoMeta);

          window.map.addSource('hulls', {
            type: 'geojson',
            data: geoHull,
          });

          // temporarily visible
          window.map.addLayer({
            id: 'hull-layer',
            source: 'hulls',
            type: 'line',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#ff69b4',
              'line-width': 1,
            },
          });

          window.map.addSource('tiles', {
            maxzoom: Number(infoMeta.generatedMetadata.maxzoom),
            promoteId: '__po_id',
            type: 'vector',
            tiles: tileBase.map(base => {
              return `${base}/${productId}/{z}/{x}/{y}.pbf`;
            }),
          });

          window.map.addLayer({
            id: 'parcels',
            'source-layer': 'parcelslayer',
            source: 'tiles',
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

      window.map.on('moveend', async e => {
        // todo change back
        return;

        // todo would be nice if this fired after map load
        const features = window.map.querySourceFeatures('hulls');
        const uniqueClusters = new Set();
        features.forEach(feature => {
          const cluster = feature.properties.cluster;

          // filter out clusters at a higher zoom level
          const zoom = window.map.getZoom();
          const parsedCluster = parseInt(cluster.split('_')[0], 10);
          if (parsedCluster > zoom) {
            return;
          }

          // filter out cluster that have already been read, or are in transit
          if (!this.loadedClusters[cluster] && !this.clustersInTransit[cluster]) {
            uniqueClusters.add(cluster);
          }
        });

        const clusterArray = Array.from(uniqueClusters);

        if (clusterArray.length) {
          clusterArray.forEach(cluster => {
            this.clustersInTransit[cluster] = true;
          });
          const featureDetails = await Promise.all(
            Array.from(clusterArray).map(cluster => {
              return window
                .fetch(
                  `${tileBase[0]}/${productId}/featureAttributes/${cluster}__${this.selectedFeatureAttribute}.json`,
                )
                .then(response => response.json());
            }),
          );
          clusterArray.forEach(cluster => {
            this.loadedClusters[cluster] = true;
            this.clustersInTransit[cluster] = false;
          });

          // apply some sort of categorical style

          // todo dont hardcode
          const colorscheme = {
            schemename: 'mh1',
            count: 7,
            ifnull: 'gray',
            ifzero: 'gray',
            colors: ['#F3FC71', '#E7D45A', '#D5AD4B', '#BE8A40', '#A16938', '#814C2F', '#5F3225'],
          };

          const breaks = [10, 100, 200, 400, 600, 800];

          // how is this done?
          const p_stops = {};
          featureDetails.forEach(data => {
            Object.keys(data).forEach(key => {
              p_stops[key] = getStopColor(data[key], colorscheme, breaks);
            });
          });

          const unique_geoids = Object.keys(p_stops).map(d => Number(d));

          const stops = unique_geoids.map(key => {
            return [key, p_stops[key]];
          });

          // to avoid 'must have stops' errors
          const drawn_stops = stops.length ? stops : [['0', 'blue']];

          layer_add++;

          const new_layer_name = `tiles-polygons-${layer_add}`;

          console.log(drawn_stops);
          window.map.addLayer({
            id: new_layer_name,
            type: 'fill',
            source: 'tiles',
            'source-layer': infoMeta.layername,
            filter: ['in', '__po_id', ...unique_geoids],
            paint: {
              'fill-antialias': false,
              'fill-opacity': 0.6,
              'fill-color': {
                property: '__po_id',
                type: 'categorical',
                stops: drawn_stops,
              },
            },
          });

          window.map.addLayer({
            id: new_layer_name + '_line',
            type: 'line',
            source: 'tiles',
            'source-layer': infoMeta.layername,
            filter: ['in', '__po_id', ...unique_geoids],
            paint: {
              'line-opacity': 0.8,
              'line-width': 0.5,
              'line-offset': 0.25,
              'line-color': {
                property: '__po_id',
                type: 'categorical',
                stops: drawn_stops,
              },
            },
          });

          function getStopColor(value, color_info, break_values) {
            //
            if (!value && value !== 0) {
              // null, undefined, NaN
              return color_info.ifnull;
            } else if (value === 0) {
              // zero value

              return color_info.ifzero;
            }

            const arr_length = break_values.length;
            let color = 'black';

            break_values.forEach((brval, index) => {
              if (index === 0 && value < brval) {
                // less than first value in breaks array
                color = color_info.colors[index];
              } else if (index === arr_length - 1 && value >= brval) {
                // greater than last item in breaks array
                color = color_info.colors[index + 1];
              } else if (value >= brval && value < break_values[index + 1]) {
                // between two break values
                color = color_info.colors[index + 1];
              }
            });

            return color;
          }
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
              { source: 'tiles', sourceLayer: infoMeta.layername, id: hoveredStateId },
              { hover: false },
            );
          }
          hoveredStateId = e.features[0].properties.__po_id;

          window.map.setFeatureState(
            { source: 'tiles', sourceLayer: infoMeta.layername, id: hoveredStateId },
            { hover: true },
          );
        }
      });

      window.map.on('mouseleave', 'parcels', function () {
        window.map.getCanvas().style.cursor = '';
        if (hoveredStateId) {
          window.map.setFeatureState(
            { source: 'tiles', sourceLayer: infoMeta.layername, id: hoveredStateId },
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
