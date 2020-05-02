import React from 'react';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from "@material-ui/lab/TreeItem";
import { stateLookup } from '../lookups/states';
import { countyLookup } from '../lookups/counties.js';
import Chip from '@material-ui/core/Chip';
import { MinusSquare, PlusSquare, CloseSquare} from '../style/svgComponents.js';
import { makeStyles } from "@material-ui/core/styles";
import '../style/treeEntry.css';

const treeStyles = makeStyles({
  root: {
    height: 'auto',
    flexGrow: 1,
    maxWidth: 400,
  },
});

export function Tree(props) {

  const classes = treeStyles();

  const crunched = props.crunched;

  console.log('render tree');

  return (

      <TreeView
        style={{width: '85%', maxWidth: '800px', margin: 'auto', padding: '20px', backgroundColor: 'antiquewhite', marginTop: '30px', borderRadius: '6px'}}
        className={classes.root}
        defaultExpanded={['1']}
        defaultCollapseIcon={<MinusSquare />}
        defaultExpandIcon={<PlusSquare />}
        defaultEndIcon={<CloseSquare />}
      >
        {Object.keys(crunched).sort((a, b) => {
          return stateLookup(a) > stateLookup(b) ? 1 : -1;
        }).map(d=> {
          return (
            <TreeItem nodeId={d} label={stateLookup(d)} key={d}>
              {Object.keys(crunched[d]).sort((a, b) => {
                return countyLookup(d + a) > countyLookup(d + b) ? 1 : -1;
              }).map(e => {
                return (
                  <TreeItem nodeId={d + e} label={countyLookup(d + e)} key={d + e}>

                    {Object.keys(crunched[d][e]).map(f=> {
                      return (
                        <div key={f}
                             className="treeEntry"
                             onClick={()=> window.open(f, "_blank")}>
                              <span style={{}}>
                                {new URL(f).hostname}
                              </span>
                          <span style={{float: 'right'}}>
                                {crunched[d][e][f]['Shapefile'] ? <Chip size="small" label=".shp" style={{marginRight: '6px'}}/> : null}
                            {crunched[d][e][f]['File Geodatabase'] ? <Chip size="small" label=".gdb" style={{marginRight: '6px'}}/> : null}
                            {crunched[d][e][f]['GeoJSON'] ? <Chip size="small" label=".geojson" style={{marginRight: '6px'}}/> : null}
                              </span>
                        </div>
                      )
                    })}

                  </TreeItem>
                )
              })}
            </TreeItem>
          )
        })}
      </TreeView>
  );
}

