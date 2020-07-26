import React from 'react';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { productBase, rawBase } from '../service/env.js';
import { StyledMenuItem } from './MobileMenu.js';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import Link from '@material-ui/core/Link';
import useMediaQuery from '@material-ui/core/useMediaQuery';

export default function MobileDownloadButtons({
  focusDownload,
  updateStatChoice,
  updatedSelectedDownload,
  updateModalOpen,
}) {
  const smallResolution = useMediaQuery('(max-width:500px)');

  return (
    <React.Fragment>
      {!smallResolution
        ? focusDownload.products
            .filter(d => d.product_type === 'ndgeojson')
            .map(product => {
              return (
                <StyledMenuItem
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
                >
                  <ListItemIcon>
                    <EqualizerIcon />
                  </ListItemIcon>
                  <ListItemText primary="Stats" />
                </StyledMenuItem>
              );
            })
        : null}

      <Link
        href={`${rawBase}/${focusDownload.raw_key}`}
        style={{ textDecoration: 'none' }}
        download
      >
        <StyledMenuItem>
          <ListItemIcon>
            <CloudDownloadIcon />
          </ListItemIcon>
          <ListItemText primary="Download Original File" />
        </StyledMenuItem>
      </Link>

      {focusDownload.products.map(product => {
        if (product.product_type === 'shp') {
          return (
            <Link
              href={`${productBase}/${product.product_key}`}
              style={{ textDecoration: 'none' }}
              download
            >
              <StyledMenuItem>
                <ListItemIcon>
                  <CloudDownloadIcon />
                </ListItemIcon>
                <ListItemText primary="Download Shapefile" />
              </StyledMenuItem>
            </Link>
          );
        } else if (product.product_type === 'gpkg') {
          return (
            <Link
              href={`${productBase}/${product.product_key}`}
              style={{ textDecoration: 'none' }}
              download
            >
              <StyledMenuItem>
                <ListItemIcon>
                  <CloudDownloadIcon />
                </ListItemIcon>
                <ListItemText primary="Download GeoPackage" />
              </StyledMenuItem>
            </Link>
          );
        } else if (product.product_type === 'geojson') {
          return (
            <Link
              href={`${productBase}/${product.product_key}`}
              style={{ textDecoration: 'none' }}
              download
            >
              <StyledMenuItem>
                <ListItemIcon>
                  <CloudDownloadIcon />
                </ListItemIcon>
                <ListItemText primary="Download GeoJSON" />
              </StyledMenuItem>
            </Link>
          );
        } else {
          return null;
        }
      })}
    </React.Fragment>
  );
}
