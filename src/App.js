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
import CoverageLabel from './components/CoverageLabel';

function App() {
  const [hasError, setErrors] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [focusDownload, updateFocusDownload] = useState({});

  const [modalOpen, updateModalOpen] = useState(false);
  const [statChoice, updateStatChoice] = useState('');
  const [selectedDownload, updatedSelectedDownload] = useState({});

  const [coverageModalOpen, updateCoverageModalOpen] = useState(false);
  const [focusCoverageGeoid, updateFocusCoverageGeoid] = useState('');
  const [coverageLabelOpen, updateCoverageLabelOpen] = useState(false);
  const [coverageLabelText, updateCoverageLabelText] = useState('');

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
          modalOpen={modalOpen}
          updateModalOpen={updateModalOpen}
          statChoice={statChoice}
          updateStatChoice={updateStatChoice}
          selectedDownload={selectedDownload}
          updatedSelectedDownload={updatedSelectedDownload}
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
          {coverageLabelOpen ? <CoverageLabel coverageLabelText={coverageLabelText} /> : null}
          <CoverageMap
            inventory={inventory}
            updateCoverageModalOpen={updateCoverageModalOpen}
            updateFocusCoverageGeoid={updateFocusCoverageGeoid}
            updateCoverageLabelOpen={updateCoverageLabelOpen}
            updateCoverageLabelText={updateCoverageLabelText}
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
            inventory={inventory}
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

export default App;
