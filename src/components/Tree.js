import React from 'react';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import TreeEntry from './TreeEntry.js';
import { stateLookup } from '../lookups/states';
import { MinusSquare, PlusSquare, CloseSquare } from '../style/svgComponents.js';
import { countyLookup } from '../lookups/counties.js';
import { countySubLookup } from '../lookups/countysubs';

export function Tree({
  inventory,
  updateModalOpen,
  updateStatChoice,
  updatedSelectedDownload,
  searchboxText,
}) {
  const treeData = crunchInventory(inventory, searchboxText);

  return (
    <div>
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
        {Object.keys(treeData)
          .sort()
          .map(stateFipsKey => {
            return (
              <TreeItem nodeId={stateFipsKey} label={stateLookup(stateFipsKey)} key={stateFipsKey}>
                {Object.keys(treeData[stateFipsKey])
                  .sort((a, b) => {
                    return treeData[stateFipsKey][a].geoname > treeData[stateFipsKey][b].geoname
                      ? 1
                      : -1;
                  })
                  .map(countyFipsKey => {
                    const cntyplc = treeData[stateFipsKey][countyFipsKey];
                    return (
                      <TreeItem nodeId={cntyplc.geoid} label={cntyplc.geoname} key={cntyplc.geoid}>
                        <TreeEntry
                          cntyplc={cntyplc}
                          updateModalOpen={updateModalOpen}
                          updateStatChoice={updateStatChoice}
                          updatedSelectedDownload={updatedSelectedDownload}
                        />
                      </TreeItem>
                    );
                  })}
              </TreeItem>
            );
          })}
      </TreeView>
    </div>
  );
}

function crunchInventory(inventory, searchboxText) {
  if (!inventory) {
    return {};
  }

  const lowercaseSearch = searchboxText.toLowerCase();
  const state = {};

  Object.keys(inventory)
    .filter(key => {
      if (key === 'popStats') {
        return false;
      }
      if (!lowercaseSearch) {
        return true;
      }

      const isCountySub = Boolean(key.length === 10);

      const lookupVal = isCountySub ? countySubLookup(key) : countyLookup(key);

      const geoname = lookupVal.replace('County', '').toLowerCase();
      return geoname.includes(lowercaseSearch);
    })
    .forEach(key => {
      const stfips = key.slice(0, 2);
      if (!state[stfips]) {
        state[stfips] = {};
      }

      const cntyplcfips = key.slice(2);
      if (!state[stfips][cntyplcfips]) {
        state[stfips][cntyplcfips] = inventory[key];
      }
    });

  return state;
}
