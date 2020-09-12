import React, { useState, useEffect, useRef } from 'react';

import mapboxgl from 'mapbox-gl';
import ndjsonStream from 'can-ndjson-stream';
import { tileBase, key } from '../service/env';
import { AttributeSelectorMemo as AttributeSelector } from './AttributeSelector';
import { classifications } from '../lookups/styleData';

const LAYERNAME = 'parcelslayer';

export function ParcelMap({
  updateCoverageModalOpen,
  inventory,
  updateFocusDownload,
  updateMapAttributesModalOpen,
  updateCurrentFeatureAttributes,
}) {
  const mapContainerRef = useRef(null);

  // attribute selector
  const [selectedCategoricalScheme, updateSelectedCategoricalScheme] = useState('dark');
  const [selectedNumericScheme, updateSelectedNumericScheme] = useState('mh4_5');
  const [selectedAttribute, updateSelectedAttribute] = useState('default');
  const [selectedClassification, updateSelectedClassification] = useState(classifications[0]);
  const [advancedToggle, updateAdvancedToggle] = useState(false);
  const [zeroAsNull, updateZeroAsNull] = useState(false);
  const [nullAsZero, updateNullAsZero] = useState(false);

  // symbology clusters
  const loadedClusters = useRef({});
  const clustersInTransit = useRef({});
  const [selectedFeatureAttribute, updateSelectedFeatureAttribute] = useState('Shape_Area');
  // popup clusters
  const clickClustersLoaded = useRef({});
  const clickClustersInTransit = useRef([]);
  const parcelAttributes = useRef({});
  const [infoMeta, updateInfoMeta] = useState(null);

  const hoveredStateId = useRef(null);
  //   const [map, setMap] = useState(null);

  console.log('map render');

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

      // TODO event here on-load that

      map.on('moveend', async e => {
        // if(defaultStyle) {
        //   return;
        // }

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
                  `${tileBase[0]}/${productId}/featureAttributes/${cluster}__${selectedFeatureAttribute}.json`,
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
          if (hoveredStateId) {
            map.setFeatureState(
              { source: 'tiles', sourceLayer: LAYERNAME, id: hoveredStateId },
              { hover: false },
            );
          }
          hoveredStateId.current = e.features[0].properties.__po_id;

          map.setFeatureState(
            { source: 'tiles', sourceLayer: LAYERNAME, id: hoveredStateId },
            { hover: true },
          );
        }
      });

      map.on('mouseleave', 'parcels', function () {
        map.getCanvas().style.cursor = '';
        if (hoveredStateId) {
          map.setFeatureState(
            { source: 'tiles', sourceLayer: LAYERNAME, id: hoveredStateId },
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

      updateInfoMeta(infoMeta);
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
    // this will be the effect to paint when something with the attribute selector changes
    //
  }, [updateFocusDownload, inventory, infoMeta]);

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
        selectedClassification={selectedClassification}
        updateSelectedClassification={updateSelectedClassification}
        advancedToggle={advancedToggle}
        updateAdvancedToggle={updateAdvancedToggle}
        zeroAsNull={zeroAsNull}
        updateZeroAsNull={updateZeroAsNull}
        nullAsZero={nullAsZero}
        updateNullAsZero={updateNullAsZero}
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
  console.log({ inventory, metadata });
  const focusGeo = inventory[metadata.geoid];
  console.log({ focusGeo });

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
