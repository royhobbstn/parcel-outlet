import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import ndjsonStream from 'can-ndjson-stream';
import { tileBase, key } from '../service/env';
import { stateLookup } from '../lookups/states';
import { countyLookup } from '../lookups/counties';

const LAYERNAME = 'parcelslayer';

export class ParcelMap extends Component {
  constructor() {
    super();
    // symbology clusters
    this.loadedClusters = {};
    this.clustersInTransit = {};
    this.selectedFeatureAttribute = 'SHAPE_Area';
    // click popup clusters
    this.clickClustersLoaded = {};
    this.clickClustersInTransit = [];
    this.parcelAttributes = {};
  }

  componentDidMount() {
    // edge case to make sure the coverage modal is closed.
    // because if they change the map (which only changes querystring), it cant be recognized without a lot of work
    this.props.updateCoverageModalOpen(false);

    mapboxgl.accessToken = key;
    window.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v9?optimize=true',
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

    const clHull = window
      .fetch(`${tileBase[0]}/${productId}/cluster_hull.geojson`)
      .then(response => response.json());

    window.map.on('load', () => {
      //
      Promise.all([info, hull, clHull])
        .then(response => {
          infoMeta = response[0];
          const geoHull = response[1];
          const clusterHull = response[2];

          // constructGeoTitle(infoMeta);

          const mapTitleControl = new MapTitleControl(infoMeta);
          window.map.addControl(mapTitleControl);

          const attributeSelector = new AttributeControl(infoMeta);
          window.map.addControl(attributeSelector);

          // set map extent here with new generated metadata values
          const boundsArray = infoMeta.generatedMetadata.bounds.split(',').map(d => Number(d));
          window.map.fitBounds(boundsArray, { animate: false });

          // add download buttons to AppBar (possible race condition here?)
          populateProductDownloads(this.props.inventory, this.props.updateFocusDownload, infoMeta);

          window.map.addSource('hulls', {
            type: 'geojson',
            data: geoHull,
          });

          window.map.addSource('clusterHull', {
            type: 'geojson',
            data: clusterHull,
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
              'line-opacity': 0,
              'line-color': '#ff69b4',
              'line-width': 1,
            },
          });

          window.map.addLayer({
            id: 'cluster-hull-layer',
            source: 'clusterHull',
            type: 'fill',
            layout: {},
            paint: {
              'fill-opacity': 0,
              'fill-outline-color': 'green',
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
              'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0.6],
              'fill-color': [
                'case',
                ['!=', ['feature-state', 'selectedfeature'], null],
                [
                  'interpolate',
                  ['linear'],
                  ['feature-state', 'selectedfeature'],
                  50000,
                  'rgba(222,235,247,1)',
                  500000,
                  'rgba(49,130,189,1)',
                ],
                'rgba(255, 255, 255, 0)',
              ],
              // 'fill-outline-color': 'cyan',
            },
          });
        })
        .catch(err => {
          console.error(err);
          // todo: message data no longer here.  redirect options.
        });

      //
      // colors: ['#F3FC71', '#E7D45A', '#D5AD4B', '#BE8A40', '#A16938', '#814C2F', '#5F3225']
      // const breaks = [50000, 100000, 150000, 200000, 300000, 500000];

      window.map.on('error', event => {
        if (event.error && event.error.status === 403) {
          // ignore missing / forbidden tile error from S3
          return;
        } else {
          console.error(event && event.error);
        }
      });

      window.map.on('moveend', async e => {
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

          featureDetails.forEach(data => {
            Object.keys(data).forEach(key => {
              window.map.setFeatureState(
                {
                  source: 'tiles',
                  sourceLayer: 'parcelslayer',
                  id: key,
                },
                {
                  selectedfeature: data[key],
                },
              );
            });
          });

          return;
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
              { source: 'tiles', sourceLayer: LAYERNAME, id: hoveredStateId },
              { hover: false },
            );
          }
          hoveredStateId = e.features[0].properties.__po_id;

          window.map.setFeatureState(
            { source: 'tiles', sourceLayer: LAYERNAME, id: hoveredStateId },
            { hover: true },
          );
        }
      });

      window.map.on('mouseleave', 'parcels', function () {
        window.map.getCanvas().style.cursor = '';
        if (hoveredStateId) {
          window.map.setFeatureState(
            { source: 'tiles', sourceLayer: LAYERNAME, id: hoveredStateId },
            { hover: false },
          );
        }
        hoveredStateId = null;
      });

      window.map.on('click', 'parcels', async e => {
        if (!(e.features && e.features[0])) {
          return;
        }

        const bbox = [
          [e.point.x - 1, e.point.y - 1],
          [e.point.x + 1, e.point.y + 1],
        ];
        const renderedHulls = window.map.queryRenderedFeatures(bbox, {
          layers: ['cluster-hull-layer'],
        });

        const missingClustersSet = new Set();
        renderedHulls.forEach(feature => {
          const cluster = feature.properties.__po_cl;
          if (
            !this.clickClustersLoaded[cluster] &&
            !this.clickClustersInTransit.includes(cluster)
          ) {
            missingClustersSet.add(cluster);
            this.clickClustersInTransit.push(cluster);
          }
        });

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

          this.parcelAttributes = { ...this.parcelAttributes, ...data };

          this.clickClustersInTransit = this.clickClustersInTransit.filter(d => {
            return !missingClusters.includes(d);
          });
        }

        // corral the information just for the features you need
        // ends up being an array of feature properties objects
        const attributeData = [];

        storedFeatures.forEach(feature => {
          const { overlappingFeatures, ...features } = JSON.parse(
            JSON.stringify(this.parcelAttributes[feature.properties.__po_id]),
          );

          attributeData.push(features);

          // overlapping features stored as overlappingFeatures variable
          // within an arbitrary base feature
          if (overlappingFeatures) {
            attributeData.push(...overlappingFeatures);
          }
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

class MapTitleControl {
  constructor(infoMeta) {
    this.titleTextCounty = countyLookup(infoMeta.geoid);
    this.titleTextState = stateLookup(infoMeta.geoid.slice(0, 2));
  }
  onAdd(map) {
    this.map = map;
    this.container = document.createElement('div');
    this.container.className = 'mapboxgl-ctrl map-title-control';
    this.container.textContent = this.titleTextCounty + ', ' + this.titleTextState;
    return this.container;
  }
  onRemove() {
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
}

class AttributeControl {
  constructor(infoMeta) {
    // this.titleTextCounty = countyLookup(infoMeta.geoid);
    // this.titleTextState = stateLookup(infoMeta.geoid.slice(0, 2));
    this.fieldMetadata = infoMeta.fieldMetadata;
    console.log(infoMeta);
  }
  onAdd(map) {
    this.map = map;
    this.container = document.createElement('div');
    this.container.className = 'mapboxgl-ctrl map-attribute-control';

    const categoricalKeys = Object.keys(this.fieldMetadata.categorical).sort();
    const numericKeys = Object.keys(this.fieldMetadata.numeric).sort();

    const selLabel = document.createElement('label');
    selLabel.appendChild(document.createTextNode('Attribute Selection'));
    selLabel.style.color = 'azure';
    selLabel.style.margin = '5px auto';

    const sel = document.createElement('select');
    sel.id = 'attribute_selector';
    selLabel.for = 'attribute_selector';
    sel.style.display = 'block';
    selLabel.style.display = 'block';

    const defaultOption = createDefaultOption();
    sel.appendChild(defaultOption);

    if (categoricalKeys.length) {
      const categoricalOptGroup = createOptGroup('Categorical');
      categoricalKeys.forEach(key => {
        const opt = createOption(key, 'cat_');
        categoricalOptGroup.appendChild(opt);
      });
      sel.appendChild(categoricalOptGroup);
    }

    if (numericKeys.length) {
      const numericOptGroup = createOptGroup('Numeric');
      numericKeys.forEach(key => {
        const opt = createOption(key, 'num_');
        numericOptGroup.appendChild(opt);
      });
      sel.appendChild(numericOptGroup);
    }

    this.container.appendChild(selLabel);
    this.container.appendChild(sel);

    this.attributeSelectorChange = sel.addEventListener(
      'change',
      e => {
        console.log(e.target.value);

        // if num_ show numeric controls

        // if cat_ show categorical controls
      },
      false,
    );
    return this.container;
  }
  onRemove() {
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
}

function createDefaultOption() {
  var opt = document.createElement('option');
  opt.appendChild(document.createTextNode('Default (none)'));
  opt.value = '__default__';
  return opt;
}

function createOption(labelAndValue, prefix) {
  var opt = document.createElement('option');
  opt.appendChild(document.createTextNode(labelAndValue));
  opt.value = prefix + labelAndValue;
  return opt;
}

function createOptGroup(label) {
  var optGroup = document.createElement('optgroup');
  optGroup.label = label;
  return optGroup;
}
