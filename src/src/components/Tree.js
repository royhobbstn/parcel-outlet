import React, {useState} from 'react';
import TreeView from '@material-ui/lab/TreeView';
import { stateLookup } from '../lookups/states';
import { countyLookup } from '../lookups/counties.js';
import Chip from '@material-ui/core/Chip';
import { MinusSquare, PlusSquare, CloseSquare} from '../style/svgComponents.js';
import { StyledTreeItem, treeStyles } from '../style/treeStyle.js';

export function Tree(props) {

  const classes = treeStyles();

  const crunched = props.crunched;

  const [mouseHoverItem, setMouseHoverItem] = useState('');

  const isMouseover = (id) => {
    return mouseHoverItem === id;
  };

  return (

      <TreeView
        style={{width: '85%', maxWidth: '800px', margin: 'auto', padding: '20px', backgroundColor: 'antiquewhite', marginTop: '30px', borderRadius: '6px'}}
        className={classes.root}
        defaultExpanded={['1']}
        defaultCollapseIcon={<MinusSquare />}
        defaultExpandIcon={<PlusSquare />}
        defaultEndIcon={<CloseSquare />}
      >
        {Object.keys(crunched).map(d=> {
          return (
            <StyledTreeItem nodeId={d} label={stateLookup(d)} key={d}>
              {Object.keys(crunched[d]).map(e => {
                return (
                  <StyledTreeItem nodeId={e} label={countyLookup(d + e)} key={e}>

                    {Object.keys(crunched[d][e]).map(f=> {
                      return (
                        <div key={f}
                             style={{width: '100%', borderRadius: '6px', padding: '3px 6px 7px 6px', margin: '4px, 0 0 0', cursor: 'pointer', backgroundColor: isMouseover(d + e + f) ? 'cornflowerblue' : ''}}
                             onMouseOver={() => setMouseHoverItem(d + e + f)}
                             onMouseOut={() => setMouseHoverItem('')}
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

                  </StyledTreeItem>
                )
              })}
            </StyledTreeItem>
          )
        })}
      </TreeView>
  );
}

