import React, { useState, useEffect } from 'react';
import AppBar from './components/AppBar.js';
import About from './components/About.js';
import { Tree } from './components/Tree.js';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { CoverageMap } from './components/CoverageMap';
import CoverageStats from './components/CoverageStats';
import { ParcelMap } from './components/ParcelMapHook';
import StatsDialog from './components/StatsDialog';
import MapAttributesDialog from './components/MapAttributesDialog';
import CoverageDialog from './components/CoverageDialog';
import CoverageLabel from './components/CoverageLabel';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { makeStyles } from '@material-ui/core/styles';
import { dataPath } from './service/env';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  margin: {
    margin: theme.spacing(1),
    width: '100%',
  },
}));

function App() {
  const classes = useStyles();

  const [searchboxText, updateSearchboxText] = useState('');

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

  async function fetchData() {
    const res = await fetch(dataPath);
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
          updateModalOpen={updateModalOpen}
          updateStatChoice={updateStatChoice}
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
          <CoverageStats inventory={inventory} />
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
            updateCoverageModalOpen={updateCoverageModalOpen}
          />
        </Route>

        <Route path="/about">
          <About />
        </Route>

        <Route exact path="/">
          <div style={{ width: '70%', maxWidth: '600px', margin: '40px auto 10px auto' }}>
            <TextField
              className={classes.margin}
              label="Search for parcel datasets..."
              variant="outlined"
              value={searchboxText}
              onChange={evt => {
                updateSearchboxText(evt.target.value);
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment
                    style={{ cursor: 'pointer' }}
                    position="end"
                    onClick={() => {
                      updateSearchboxText('');
                    }}
                  >
                    {searchboxText ? <HighlightOffIcon /> : <span />}
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <Tree
            inventory={inventory}
            searchboxText={searchboxText}
            modalOpen={modalOpen}
            updateModalOpen={updateModalOpen}
            statChoice={statChoice}
            updateStatChoice={updateStatChoice}
            selectedDownload={selectedDownload}
            updatedSelectedDownload={updatedSelectedDownload}
            updateCoverageModalOpen={updateCoverageModalOpen}
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
