import React, {useState, useEffect} from 'react';
import ButtonAppBar from './components/AppBar.js';
import {Tree} from './components/Tree.js';
import {FullWidthGrid} from './components/ImageGrid.js'
function App() {

  const [hasError, setErrors] = useState(false);
  const [inventory, setInventory] = useState([]);

  async function fetchData() {
    const res = await fetch("/data/ParcelInventory.json");
    res
      .json()
      .then(res => {
        setInventory(res)
      })
      .catch(err => setErrors(err));
  }

  useEffect(() => {
    fetchData();
  }, []);


  return (
    <div>
      <ButtonAppBar />
      <FullWidthGrid />
      <Tree crunched={crunchInventory(inventory)}/>
      {hasError ? <p style={{margin: 'auto', width: '300px', color: 'red', marginTop: '30px'}}>There was an error loading data.</p> : null}
    </div>
  );
}



function crunchInventory(inventory) {
  if(!inventory) {
    return {};
  }

  const state = {};

  inventory.forEach(d=> {
    if(d.GeoType !== 'County') {
      return;
    }

    const stfips = d.FIPS.slice(0,2);
    if(!state[stfips]) {
      state[stfips] = {};
    }

    const cntyfips = d.FIPS.slice(2);
    if(!state[stfips][cntyfips]) {
      state[stfips][cntyfips] = {};
    }

    if(!state[stfips][cntyfips][d.LandingPageLink]) {
      state[stfips][cntyfips][d.LandingPageLink] = {};
    }

    state[stfips][cntyfips][d.LandingPageLink][d.FileFormat] = true;
  });

  return state;
}

export default App;
