import React, { useState, useEffect, useRef } from 'react';

import mapboxgl from 'mapbox-gl';
import ndjsonStream from 'can-ndjson-stream';
import { tileBase, key } from '../service/env';
import { AttributeSelectorMemo as AttributeSelector } from './AttributeSelector';
import { colortree } from '../lookups/colortree';
import { categorytree } from '../lookups/categorytree';

const Url = require('url-parse');

const LAYERNAME = 'parcelslayer';

export function ParcelMap({
  updateCoverageModalOpen,
  inventory,
  updateFocusDownload,
  updateMapAttributesModalOpen,
  updateCurrentFeatureAttributes,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const ready = useRef(false);

  // attribute selector
  const [selectedCategoricalScheme, updateSelectedCategoricalScheme] = useState('dark');
  const [selectedNumericScheme, updateSelectedNumericScheme] = useState('viridis_9');
  const [selectedAttribute, updateSelectedAttribute] = useState('default');
  const selectedAttributeRef = useRef('default');
  const [selectedClassification, updateSelectedClassification] = useState('quantile_9');
  const [advancedToggle, updateAdvancedToggle] = useState(true);
  const [zeroAsNull, updateZeroAsNull] = useState(true);

  // symbology clusters
  const loadedClusters = useRef({});
  const clustersInTransit = useRef({});
  // popup clusters
  const clickClustersLoaded = useRef({});
  const clickClustersInTransit = useRef([]);
  const parcelAttributes = useRef({});
  const [infoMeta, updateInfoMeta] = useState(null);

  const hoveredStateId = useRef(null);

  // one time
  useEffect(() => {
    updateCoverageModalOpen(false);

    mapboxgl.accessToken = key;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v9?optimize=true',
      center: [-88, 44.5],
      zoom: 4,
      maxZoom: 20,
      minZoom: 4,
    });

    mapRef.current = map;

    var url = new Url(window.location.href);
    const pathname = url.pathname;

    const parts = pathname.split('/');

    const [blank, base, descriptiveName, productId] = parts;
    // FYI
    // blank = ""
    // base = "parcel-map"
    // descriptiveName = "whatever the geoname" - has no purpose other than SEO
    // productId = "a2d782cf-d442fd95-c327a9de" format like downloadRef, productRef, individRef

    if (blank || !base || !descriptiveName || !productId) {
      console.error('this is not a valid page name');
      return;
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

    map.on('load', async () => {
      //
      const [infoMeta, geoHull, clusterHull] = await Promise.all([info, hull, clHull]);

      // set map extent here with new generated metadata values
      const boundsArray = infoMeta.generatedMetadata.bounds.split(',').map(d => Number(d));
      map.fitBounds(boundsArray, { animate: false });

      map.addSource('hulls', {
        type: 'geojson',
        data: geoHull,
      });

      map.addSource('clusterHull', {
        type: 'geojson',
        data: clusterHull,
      });

      map.addLayer({
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

      map.addLayer({
        id: 'cluster-hull-layer',
        source: 'clusterHull',
        type: 'fill',
        layout: {},
        paint: {
          'fill-opacity': 0,
          'fill-outline-color': 'green',
        },
      });

      map.addSource('tiles', {
        maxzoom: Number(infoMeta.generatedMetadata.maxzoom),
        promoteId: '__po_id',
        type: 'vector',
        tiles: tileBase.map(base => {
          return `${base}/${productId}/{z}/{x}/{y}.pbf`;
        }),
      });

      // "DEFAULT STYLE"
      map.addLayer({
        id: 'parcels',
        'source-layer': LAYERNAME,
        source: 'tiles',
        type: 'fill',
        layout: {},
        paint: {
          'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.9, 0.6],
          'fill-color': 'cyan',
          'fill-antialias': true,
          'fill-outline-color': 'rgb(52, 51, 50)',
        },
      });

      //   map.addLayer({
      //     id: 'parcels-line',
      //     'source-layer': LAYERNAME,
      //     source: 'tiles',
      //     type: 'line',
      //     layout: {
      //       'line-join': 'round',
      //       'line-cap': 'round',
      //     },
      //     paint: {
      //       'line-opacity': 0.9,
      //       'line-width': [
      //         'interpolate',
      //         ['linear'],
      //         ['zoom'],
      //         5,
      //         0,
      //         7,
      //         0.05,
      //         10,
      //         0.1,
      //         12,
      //         0.4,
      //         16,
      //         1,
      //       ],
      //       'line-color': 'black',
      //     },
      //   });

      map.on('moveend', async e => {
        if (selectedAttributeRef.current === 'default') {
          return;
        }

        // issues:  need to know the selectedFeature here

        const features = map.querySourceFeatures('hulls');
        const uniqueClusters = new Set();
        features.forEach(feature => {
          const cluster = feature.properties.cluster;

          // filter out clusters at a higher zoom level
          const zoom = map.getZoom();
          const parsedCluster = parseInt(cluster.split('_')[0], 10);
          if (parsedCluster > zoom) {
            return;
          }

          // filter out cluster that have already been read, or are in transit
          if (!loadedClusters.current[cluster] && !clustersInTransit.current[cluster]) {
            uniqueClusters.add(cluster);
          }
        });

        const clusterArray = Array.from(uniqueClusters);

        if (clusterArray.length) {
          clusterArray.forEach(cluster => {
            clustersInTransit.current[cluster] = true;
          });
          const featureDetails = await Promise.all(
            Array.from(clusterArray).map(cluster => {
              return window
                .fetch(
                  `${
                    tileBase[0]
                  }/${productId}/featureAttributes/${cluster}__${selectedAttributeRef.current.slice(
                    4,
                  )}.json`,
                )
                .then(response => response.json());
            }),
          );
          clusterArray.forEach(cluster => {
            loadedClusters.current[cluster] = true;
            clustersInTransit.current[cluster] = false;
          });

          // apply some sort of categorical style

          featureDetails.forEach(data => {
            Object.keys(data).forEach(key => {
              map.setFeatureState(
                {
                  source: 'tiles',
                  sourceLayer: LAYERNAME,
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

      map.on('error', event => {
        if (event.error && event.error.status === 403) {
          // ignore missing / forbidden tile error from S3
          return;
        } else {
          console.error(event && event.error);
        }
      });

      map.on('mousemove', 'parcels', function (e) {
        if (!(e.features && e.features[0])) {
          return;
        }

        map.getCanvas().style.cursor = 'pointer';

        if (e.features.length > 0) {
          if (hoveredStateId.current) {
            map.setFeatureState(
              { source: 'tiles', sourceLayer: LAYERNAME, id: hoveredStateId.current },
              { hover: false },
            );
          }
          hoveredStateId.current = e.features[0].properties.__po_id;

          map.setFeatureState(
            { source: 'tiles', sourceLayer: LAYERNAME, id: hoveredStateId.current },
            { hover: true },
          );
        }
      });

      map.on('mouseleave', 'parcels', function () {
        map.getCanvas().style.cursor = '';
        if (hoveredStateId.current) {
          map.setFeatureState(
            { source: 'tiles', sourceLayer: LAYERNAME, id: hoveredStateId.current },
            { hover: false },
          );
        }
        hoveredStateId.current = null;
      });

      map.on('click', 'parcels', async e => {
        if (!(e.features && e.features[0])) {
          return;
        }

        const bbox = [
          [e.point.x - 1, e.point.y - 1],
          [e.point.x + 1, e.point.y + 1],
        ];
        const renderedHulls = map.queryRenderedFeatures(bbox, {
          layers: ['cluster-hull-layer'],
        });

        const missingClustersSet = new Set();
        renderedHulls.forEach(feature => {
          const cluster = feature.properties.__po_cl;
          if (
            !clickClustersLoaded.current[cluster] &&
            !clickClustersInTransit.current.includes(cluster)
          ) {
            missingClustersSet.add(cluster);
            clickClustersInTransit.current.push(cluster);
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
                    clickClustersLoaded.current[cluster] = true;
                    resolve();
                  })
                  .catch(err => {
                    console.error(err);
                    reject();
                  });
              });
            }),
          );

          Object.keys(data).forEach(key => {
            parcelAttributes.current[key] = data[key];
          });

          clickClustersInTransit.current = clickClustersInTransit.current.filter(d => {
            return !missingClusters.includes(d);
          });
        }

        // corral the information just for the features you need
        // ends up being an array of feature properties objects
        const attributeData = [];

        storedFeatures.forEach(feature => {
          const { overlappingFeatures, ...features } = JSON.parse(
            JSON.stringify(parcelAttributes.current[feature.properties.__po_id]),
          );

          attributeData.push(features);

          // overlapping features stored as overlappingFeatures variable
          // within an arbitrary base feature
          if (overlappingFeatures) {
            attributeData.push(...overlappingFeatures);
          }
        });

        updateMapAttributesModalOpen(true);
        updateCurrentFeatureAttributes(attributeData);
      });

      ready.current = true;
      updateInfoMeta(infoMeta);

      window.setTimeout(() => {
        mapRef.current.fire('moveend');
      }, 1000);
    });

    // Clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (infoMeta && Object.keys(inventory).length) {
      // add download buttons to AppBar (possible race condition here?)
      populateProductDownloads(inventory, updateFocusDownload, infoMeta);
    }
  }, [updateFocusDownload, inventory, infoMeta]);

  useEffect(() => {
    if (!ready.current) {
      return;
    }

    // clear old data.
    loadedClusters.current = {};
    clustersInTransit.current = {};

    // clear feature state
    mapRef.current.removeFeatureState({
      source: 'tiles',
      sourceLayer: LAYERNAME,
    });
  }, [selectedAttribute]);

  useEffect(() => {
    // this will be the effect to paint when something with the attribute selector changes

    if (!infoMeta) {
      return;
    }

    let zeroFilters = [['!=', ['feature-state', 'selectedfeature'], null]];
    let colorStyle = 'cyan'; // string or array
    // let lineStyle = 'cyan'; // string or array

    if (selectedAttribute === 'default') {
      // paints default (uses default colorStyle above)
    } else if (selectedAttribute.slice(0, 3) === 'cat') {
      const categoryAttribute = selectedAttribute.slice(4);
      const classes = infoMeta.fieldMetadata.categorical[categoryAttribute];
      const filteredClasses = classes.filter(d => d.trim() !== '' && d !== 'null');

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
      //   lineStyle = [
      //     'case',
      //     ['all', ...zeroFilters],
      //     ['match', ['feature-state', 'selectedfeature'], ...lineBreaks],
      //     'darkslategrey',
      //   ];
    } else if (selectedAttribute.slice(0, 3) === 'num') {
      const availableClassifications = infoMeta.fieldMetadata.numeric[selectedAttribute.slice(4)];
      const currentClassification =
        availableClassifications[selectedClassification.replace('_', '')];
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
      //   lineStyle = [
      //     'case',
      //     ['all', ...zeroFilters],
      //     ['step', ['feature-state', 'selectedfeature'], ...lineBreaks],
      //     'rgba(0, 0, 0, 0)',
      //   ];
    } else {
      console.error('i dont know what to paint');
    }

    mapRef.current.setPaintProperty('parcels', 'fill-color', colorStyle);
    // mapRef.current.setPaintProperty('parcels-line', 'line-color', 'grey');

    mapRef.current.fire('moveend');
  }, [
    selectedCategoricalScheme,
    selectedNumericScheme,
    selectedAttribute,
    selectedClassification,
    zeroAsNull,
    infoMeta,
  ]);

  return (
    <div>
      <AttributeSelector
        infoMeta={infoMeta}
        selectedCategoricalScheme={selectedCategoricalScheme}
        updateSelectedCategoricalScheme={updateSelectedCategoricalScheme}
        selectedNumericScheme={selectedNumericScheme}
        updateSelectedNumericScheme={updateSelectedNumericScheme}
        selectedAttribute={selectedAttribute}
        updateSelectedAttribute={updateSelectedAttribute}
        selectedAttributeRef={selectedAttributeRef}
        selectedClassification={selectedClassification}
        updateSelectedClassification={updateSelectedClassification}
        advancedToggle={advancedToggle}
        updateAdvancedToggle={updateAdvancedToggle}
        zeroAsNull={zeroAsNull}
        updateZeroAsNull={updateZeroAsNull}
      ></AttributeSelector>
      <div ref={mapContainerRef} id="map" />
    </div>
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
