import React from 'react';
import Chip from '@material-ui/core/Chip';
import { Link } from 'react-router-dom';
import PublicIcon from '@material-ui/icons/Public';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import { rawBase, productBase } from '../service/env.js';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { countyLookup } from '../lookups/counties';
import { stateLookup } from '../lookups/states';

export default function TreeEntry({
  cntyplc,
  updateStatChoice,
  updatedSelectedDownload,
  updateModalOpen,
}) {
  const smallResolution = useMediaQuery('(max-width:500px)');

  return (
    <React.Fragment>
      {Object.keys(cntyplc.sources).map(sourceIdKey => {
        const source = cntyplc.sources[sourceIdKey];
        const source_name = source.source_name;
        const last_checked = source.last_checked;
        const last_download = source.last_download;

        let most_recent_download;

        Object.keys(source.downloads).forEach(downloadKey => {
          const download = source.downloads[downloadKey];
          if (download.created === last_download) {
            most_recent_download = download;
          }
        });

        const products = most_recent_download.products;

        return (
          <div key={sourceIdKey} className="treeEntry">
            <a href={source_name} target="_blank" rel="noopener noreferrer">
              {new URL(source_name).hostname}
            </a>
            <span className="treeChips" style={{ float: 'right' }}>
              {!smallResolution
                ? products
                    .filter(d => d.product_type === 'ndgeojson')
                    .map(product => {
                      return (
                        <Chip
                          key={product.product_key}
                          size="small"
                          onClick={() => {
                            const record = {
                              geoid: cntyplc.geoid,
                              geoname: cntyplc.geoname,
                              source_name,
                              last_checked,
                              created: most_recent_download.created,
                              download_ref: most_recent_download.download_ref,
                            };
                            updateStatChoice(`${productBase}/${product.product_key}`);
                            updatedSelectedDownload(record);
                            updateModalOpen(true);
                          }}
                          label={<EqualizerIcon style={{ verticalAlign: 'middle' }} />}
                          style={{ marginRight: '6px' }}
                        />
                      );
                    })
                : null}

              <a
                key={most_recent_download.download_id}
                href={`${rawBase}/${most_recent_download.raw_key}`}
                download
              >
                <Chip
                  size="small"
                  label="Original"
                  style={{ padding: '2px', marginRight: '6px' }}
                />
              </a>
              {products.map(product => {
                if (product.product_type === 'shp') {
                  return (
                    <a
                      key={product.product_individual_ref}
                      href={`${productBase}/${product.product_key}`}
                      download
                    >
                      <Chip size="small" label="SHP" style={{ marginRight: '6px' }} />
                    </a>
                  );
                } else if (product.product_type === 'gpkg') {
                  return (
                    <a
                      key={product.product_individual_ref}
                      href={`${productBase}/${product.product_key}`}
                      download
                    >
                      <Chip size="small" label="GPKG" style={{ marginRight: '6px' }} />
                    </a>
                  );
                } else if (product.product_type === 'geojson') {
                  return (
                    <a
                      key={product.product_individual_ref}
                      href={`${productBase}/${product.product_key}`}
                      download
                    >
                      <Chip size="small" label="JSON" style={{ marginRight: '6px' }} />
                    </a>
                  );
                } else if (product.product_type === 'pbf') {
                  const state = product.geoid.slice(0, 2);
                  const geoname = `${countyLookup(product.geoid)} ${stateLookup(state)}`;
                  const geonameMod = geoname.replace(/\s/g, '-');
                  return (
                    <Chip
                      key={product.product_individual_ref}
                      component={Link}
                      to={`/parcel-map/${geonameMod}/${product.product_key}`}
                      size="small"
                      label={
                        <React.Fragment>
                          <PublicIcon style={{ verticalAlign: 'middle' }} />
                          &nbsp;Map
                        </React.Fragment>
                      }
                      style={{ marginRight: '6px' }}
                    />
                  );
                } else {
                  return null;
                }
              })}
            </span>
          </div>
        );
      })}
    </React.Fragment>
  );
}
