import React from 'react';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import { stateLookup } from '../lookups/states';
import Chip from '@material-ui/core/Chip';
import { MinusSquare, PlusSquare, CloseSquare } from '../style/svgComponents.js';
import MapIcon from '@material-ui/icons/Map';
import '../style/treeEntry.css';
import { rawBase, productBase, tileBase } from '../service/env.js';

export function Tree(props) {
  const inventory = props.inventory;

  return (
    <TreeView
      style={{
        width: '92%',
        maxWidth: '1200px',
        margin: 'auto',
        marginBottom: '40px',
        padding: '20px',
        backgroundColor: 'antiquewhite',
        marginTop: '30px',
        borderRadius: '6px',
        height: 'auto',
        flexGrow: '1',
      }}
      defaultExpanded={['1']}
      defaultCollapseIcon={<MinusSquare />}
      defaultExpandIcon={<PlusSquare />}
      defaultEndIcon={<CloseSquare />}
    >
      {Object.keys(inventory)
        .sort()
        .map(stateFipsKey => {
          return (
            <TreeItem nodeId={stateFipsKey} label={stateLookup(stateFipsKey)} key={stateFipsKey}>
              {Object.keys(inventory[stateFipsKey])
                .sort((a, b) => {
                  return inventory[stateFipsKey][a].geoname > inventory[stateFipsKey][b].geoname
                    ? 1
                    : -1;
                })
                .map(countyFipsKey => {
                  const cntyplc = inventory[stateFipsKey][countyFipsKey];
                  return (
                    <TreeItem nodeId={cntyplc.geoid} label={cntyplc.geoname} key={cntyplc.geoid}>
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
                              <a
                                key={most_recent_download.download_id}
                                href={rawBase + most_recent_download.raw_key}
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
                                      href={productBase + product.product_key}
                                      download
                                    >
                                      <Chip
                                        size="small"
                                        label="SHP"
                                        style={{ marginRight: '6px' }}
                                      />
                                    </a>
                                  );
                                } else if (product.product_type === 'gpkg') {
                                  return (
                                    <a
                                      key={product.product_individual_ref}
                                      href={productBase + product.product_key}
                                      download
                                    >
                                      <Chip
                                        size="small"
                                        label="GPKG"
                                        style={{ marginRight: '6px' }}
                                      />
                                    </a>
                                  );
                                } else if (product.product_type === 'geojson') {
                                  return (
                                    <a
                                      key={product.product_individual_ref}
                                      href={productBase + product.product_key}
                                      download
                                    >
                                      <Chip
                                        size="small"
                                        label="JSON"
                                        style={{ marginRight: '6px' }}
                                      />
                                    </a>
                                  );
                                } else if (product.product_type === 'pbf') {
                                  return (
                                    <a
                                      key={product.product_individual_ref}
                                      href={tileBase + product.product_key + 'map prid'}
                                    >
                                      <Chip
                                        size="small"
                                        label={<MapIcon style={{ verticalAlign: 'middle' }} />}
                                        style={{ marginRight: '6px' }}
                                      />
                                    </a>
                                  );
                                } else {
                                  return null;
                                }
                              })}
                            </span>
                          </div>
                        );
                      })}
                    </TreeItem>
                  );
                })}
            </TreeItem>
          );
        })}
    </TreeView>
  );
}
