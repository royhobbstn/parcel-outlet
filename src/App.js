import React, { useState, useEffect, useRef } from 'react';
import AppBar from './components/AppBar.js';
import About from './components/About.js';
import { Tree } from './components/Tree.js';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { CoverageMap } from './components/CoverageMap';
import { ParcelMap } from './components/ParcelMap';
import StatsDialog from './components/StatsDialog';
import MapAttributesDialog from './components/MapAttributesDialog';
import CoverageDialog from './components/CoverageDialog';

function App() {
  const [hasError, setErrors] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [focusDownload, updateFocusDownload] = useState({});

  const [modalOpen, updateModalOpen] = useState(false);
  const [statChoice, updateStatChoice] = useState('');
  const [selectedDownload, updatedSelectedDownload] = useState({});

  const [coverageModalOpen, updateCoverageModalOpen] = useState(false);
  const [focusCoverageGeoid, updateFocusCoverageGeoid] = useState('');

  const [mapAttributesModalOpen, updateMapAttributesModalOpen] = useState(false);
  const [currentFeatureAttributes, updateCurrentFeatureAttributes] = useState({});
  const allFeatureAttributes = useRef({});

  async function fetchData() {
    const res = await fetch('/data/database_data.json');
    res
      .json()
      .then(res => {
        setInventory(res);
      })
      .catch(err => setErrors(err));
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Router>
      {modalOpen ? (
        <StatsDialog
          modalOpen={modalOpen}
          updateModalOpen={updateModalOpen}
          productKey={statChoice}
          selectedDownload={selectedDownload}
        />
      ) : null}
      {mapAttributesModalOpen ? (
        <MapAttributesDialog
          mapAttributesModalOpen={mapAttributesModalOpen}
          updateMapAttributesModalOpen={updateMapAttributesModalOpen}
          currentFeatureAttributes={currentFeatureAttributes}
        />
      ) : null}
      {coverageModalOpen ? (
        <CoverageDialog
          coverageModalOpen={coverageModalOpen}
          updateCoverageModalOpen={updateCoverageModalOpen}
          focusCoverageGeoid={focusCoverageGeoid}
          inventory={inventory}
        />
      ) : null}
      <AppBar
        updateFocusDownload={updateFocusDownload}
        focusDownload={focusDownload}
        updateStatChoice={updateStatChoice}
        updatedSelectedDownload={updatedSelectedDownload}
        updateModalOpen={updateModalOpen}
      />
      <Switch>
        <Route path="/coverage-map">
          <CoverageMap
            inventory={inventory}
            updateCoverageModalOpen={updateCoverageModalOpen}
            updateFocusCoverageGeoid={updateFocusCoverageGeoid}
          />
        </Route>

        <Route path="/parcel-map">
          <ParcelMap
            inventory={inventory}
            updateFocusDownload={updateFocusDownload}
            updateMapAttributesModalOpen={updateMapAttributesModalOpen}
            updateCurrentFeatureAttributes={updateCurrentFeatureAttributes}
            allFeatureAttributes={allFeatureAttributes}
          />
        </Route>

        <Route path="/about">
          <About />
        </Route>

        <Route exact path="/">
          <Tree
            inventory={crunchInventory(inventory)}
            modalOpen={modalOpen}
            updateModalOpen={updateModalOpen}
            statChoice={statChoice}
            updateStatChoice={updateStatChoice}
            selectedDownload={selectedDownload}
            updatedSelectedDownload={updatedSelectedDownload}
          />
          {hasError ? (
            <p
              style={{
                margin: 'auto',
                width: '300px',
                color: 'red',
                marginTop: '30px',
              }}
            >
              There was an error loading data.
            </p>
          ) : null}
        </Route>
      </Switch>
    </Router>
  );
}

function crunchInventory(inventory) {
  if (!inventory) {
    return {};
  }

  const state = {};

  Object.keys(inventory).forEach(key => {
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

export default App;
