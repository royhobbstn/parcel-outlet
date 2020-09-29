import React from 'react';
import Chip from '@material-ui/core/Chip';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import IconButton from '@material-ui/core/IconButton';
import { LightTooltip } from './AppBar';
import { productBase, rawBase } from '../service/env.js';

export default function DesktopDownloadButtons({
  focusDownload,
  updateStatChoice,
  updatedSelectedDownload,
  updateModalOpen,
}) {
  return (
    <div className="appBarProducts" style={{ marginRight: '25px' }}>
      {focusDownload.products
        .filter(d => d.product_type === 'ndgeojson')
        .map(product => {
          return (
            <IconButton
              key="ndgeojson"
              style={{ paddingLeft: '4px', paddingRight: '4px', cursor: 'pointer' }}
            >
              <LightTooltip title="View Data Statistics" placement="bottom">
                <Chip
                  key={product.product_key}
                  size="small"
                  className="iconChip"
                  onClick={() => {
                    const record = {
                      geoid: focusDownload.geoid,
                      geoname: focusDownload.geoname,
                      source_name: focusDownload.source_name,
                      last_checked: focusDownload.last_checked,
                      created: focusDownload.created,
                      download_ref: focusDownload.download_ref,
                    };
                    updateStatChoice(`${productBase}/${product.product_key}`);
                    updatedSelectedDownload(record);
                    updateModalOpen(true);
                  }}
                  label={<EqualizerIcon />}
                />
              </LightTooltip>
            </IconButton>
          );
        })}
      <IconButton
        key={focusDownload.download_id}
        style={{ paddingLeft: '4px', paddingRight: '4px' }}
      >
        <a href={`${rawBase}/${focusDownload.raw_key}`} style={{ textDecoration: 'none' }} download>
          <LightTooltip title="Download Original File" placement="bottom">
            <Chip
              size="small"
              label="Original"
              style={{
                verticalAlign: 'middle',
                marginBottom: '2px',
                cursor: 'pointer',
                backgroundColor: 'grey',
                color: 'white',
              }}
            />
          </LightTooltip>
        </a>
      </IconButton>
      {focusDownload.products.map(product => {
        if (product.product_type === 'shp') {
          return (
            <IconButton
              key={product.product_individual_ref}
              style={{ paddingLeft: '4px', paddingRight: '4px' }}
            >
              <a
                href={`${productBase}/${product.product_key}`}
                style={{ textDecoration: 'none' }}
                download
              >
                <LightTooltip title="Download Shapefile" placement="bottom">
                  <Chip
                    size="small"
                    label="SHP"
                    style={{
                      verticalAlign: 'middle',
                      marginBottom: '2px',
                      cursor: 'pointer',
                      backgroundColor: 'grey',
                      color: 'white',
                    }}
                  />
                </LightTooltip>
              </a>
            </IconButton>
          );
        } else if (product.product_type === 'gpkg') {
          return (
            <IconButton
              key={product.product_individual_ref}
              style={{ paddingLeft: '4px', paddingRight: '4px' }}
            >
              <a
                href={`${productBase}/${product.product_key}`}
                style={{ textDecoration: 'none' }}
                download
              >
                <LightTooltip title="Download Geopackage" placement="bottom">
                  <Chip
                    size="small"
                    label="GPKG"
                    style={{
                      verticalAlign: 'middle',
                      marginBottom: '2px',
                      cursor: 'pointer',
                      backgroundColor: 'grey',
                      color: 'white',
                    }}
                  />
                </LightTooltip>
              </a>
            </IconButton>
          );
        } else if (product.product_type === 'geojson') {
          return (
            <IconButton
              key={product.product_individual_ref}
              style={{ paddingLeft: '4px', paddingRight: '4px' }}
            >
              <a
                href={`${productBase}/${product.product_key}`}
                style={{ textDecoration: 'none' }}
                download
              >
                <LightTooltip
                  title={
                    <React.Fragment>
                      Download GeoJSON File.
                      <br />( tip: right-click, then "Save Link As..." )
                    </React.Fragment>
                  }
                  placement="bottom"
                >
                  <Chip
                    size="small"
                    label="JSON"
                    style={{
                      verticalAlign: 'middle',
                      marginBottom: '2px',
                      cursor: 'pointer',
                      backgroundColor: 'grey',
                      color: 'white',
                    }}
                  />
                </LightTooltip>
              </a>
            </IconButton>
          );
        } else {
          return null;
        }
      })}
    </div>
  );
}
