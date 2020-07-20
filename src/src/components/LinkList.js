import React from 'react';
import { Link } from 'react-router-dom';
import MapIcon from '@material-ui/icons/Map';

export function LinkList() {
  return (
    <ul
      style={{
        width: '92%',
        maxWidth: '1200px',
        margin: '30px auto auto',
        padding: '10px 10px 10px 40px',
      }}
    >
      <li>
        <Link to={'/coverage-map'}>
          Coverage Map <MapIcon style={{ marginLeft: '5px', verticalAlign: 'bottom' }} />
        </Link>
      </li>
      {/*<li>*/}
      {/*<Link to={"/parcel-explorer"}>*/}
      {/*Parcel Explorer{" "}*/}
      {/*<ExploreIcon style={{ marginLeft: "5px", verticalAlign: "bottom" }} />*/}
      {/*</Link>*/}
      {/*</li>*/}
    </ul>
  );
}
