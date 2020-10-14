import React, { useState, useEffect, useRef } from 'react';

import mapboxgl from 'mapbox-gl';
import ndjsonStream from 'can-ndjson-stream';
import { tileBase, key } from '../service/env';
import { AttributeSelectorMemo as AttributeSelector } from './AttributeSelector';
import AttributeValueDisplay from './AttributeValueDisplay';
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

  const featureAttributes = useRef({});
  const hoveredStateId = useRef(null);
  const [mouseoverAttributeValue, updateMouseoverAttributeValue] = useState(null);

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
      map.addLayer(
        {
          id: 'parcels',
          'source-layer': LAYERNAME,
          source: 'tiles',
          type: 'fill',
          layout: {},
          paint: {
            'fill-opacity': 0.7,
            'fill-color': 'cyan',
            'fill-antialias': false,
          },
        },
        'bridge-motorway-2',
      );

      map.addLayer(
        {
          id: 'parcels-line',
          'source-layer': LAYERNAME,
          source: 'tiles',
          type: 'line',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-opacity': 1,
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5,
              ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0],
              7,
              ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0],
              10,
              ['case', ['boolean', ['feature-state', 'hover'], false], 1.5, 0.01],
              12,
              ['case', ['boolean', ['feature-state', 'hover'], false], 2, 0.4],
              16,
              ['case', ['boolean', ['feature-state', 'hover'], false], 4, 1],
            ],
            'line-offset': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5,
              ['case', ['boolean', ['feature-state', 'hover'], false], 0.5, 0],
              7,
              ['case', ['boolean', ['feature-state', 'hover'], false], 0.5, 0],
              10,
              ['case', ['boolean', ['feature-state', 'hover'], false], 0.75, 0.005],
              12,
              ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0.2],
              16,
              ['case', ['boolean', ['feature-state', 'hover'], false], 2, 0.5],
            ],
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              'yellow',
              '#343332',
            ],
          },
        },
        'bridge-motorway-2',
      );

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

          const selectedAttributeIsNum = selectedAttributeRef.current.slice(0, 3) === 'num';

          // apply some sort of categorical style
          featureDetails.forEach(data => {
            Object.keys(data).forEach(key => {
              const value = selectedAttributeIsNum ? Number(data[key]) : String(data[key]);
              featureAttributes.current[key] = value;
              map.setFeatureState(
                {
                  source: 'tiles',
                  sourceLayer: LAYERNAME,
                  id: key,
                },
                {
                  selectedfeature: value,
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
          updateMouseoverAttributeValue(null);
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

          if (selectedAttributeRef !== 'default') {
            updateMouseoverAttributeValue(
              featureAttributes.current[e.features[0].properties.__po_id],
            );
          } else {
            updateMouseoverAttributeValue(null);
          }

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
        updateMouseoverAttributeValue(null);
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
    let colorStyle = 'cyan';
    // let lineStyle = '#343332';
    let lineStyle = ['case', ['boolean', ['feature-state', 'hover'], false], 'yellow', '#343332'];

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

      lineStyle = [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        'yellow',
        [
          'case',
          ['all', ...zeroFilters],
          ['match', ['feature-state', 'selectedfeature'], ...lineBreaks],
          '#343332',
        ],
      ];
    } else if (selectedAttribute.slice(0, 3) === 'num') {
      const availableClassifications = infoMeta.fieldMetadata.numeric[selectedAttribute.slice(4)];
      const currentClassification =
        availableClassifications[selectedClassification.replace('_', '')];
      const currentColorscheme = colortree[selectedNumericScheme];

      const breaks = [];
      const lineBreaks = [];

      for (let i = 0; i < currentColorscheme.colors.length; i++) {
        const duplicateClassificationValue =
          currentClassification[i] === currentClassification[i + 1];
        const isNotLastColorValue = i < currentColorscheme.colors.length - 1;

        if (duplicateClassificationValue && isNotLastColorValue) {
          // skip multiple breaks with same value
          // can happen when not many data values, ie 0,0,0,10,50,75...
          continue;
        }

        breaks.push(currentColorscheme.colors[i]);
        lineBreaks.push(currentColorscheme.colors[i]);
        if (isNotLastColorValue) {
          breaks.push(currentClassification[i] + 0.0001);
          lineBreaks.push(currentClassification[i] + 0.0001);
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
        ['boolean', ['feature-state', 'hover'], false],
        'yellow',
        [
          'case',
          ['all', ...zeroFilters],
          ['step', ['feature-state', 'selectedfeature'], ...lineBreaks],
          '#343332',
        ],
      ];
    } else {
      console.error('i dont know what to paint');
    }

    mapRef.current.setPaintProperty('parcels', 'fill-color', colorStyle);
    mapRef.current.setPaintProperty('parcels-line', 'line-color', lineStyle);

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
      <AttributeValueDisplay mouseoverAttributeValue={mouseoverAttributeValue} />
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
        featureAttributes={featureAttributes}
      ></AttributeSelector>
      <div ref={mapContainerRef} id="map" />
    </div>
  );
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
