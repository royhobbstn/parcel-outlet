import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import ListIcon from '@material-ui/icons/List';
import TreeEntry from './TreeEntry.js';

import { stateLookup } from '../lookups/states';
import { countyLookup } from '../lookups/counties.js';

export default function CoverageDialog({
  coverageModalOpen,
  updateCoverageModalOpen,
  focusCoverageGeoid,
  inventory,
  updateModalOpen,
  updateStatChoice,
  updatedSelectedDownload,
  coverageModalMessage,
  updateCoverageModalMessage,
}) {
  const state = focusCoverageGeoid.slice(0, 2);
  const county = focusCoverageGeoid.slice(2);
  const titleGeo = `${countyLookup(state + county)}, ${stateLookup(state)}`;

  return (
    <Dialog open={coverageModalOpen} fullWidth={true} maxWidth="md">
      <CoverageHeader
        updateCoverageModalOpen={updateCoverageModalOpen}
        updateCoverageModalMessage={updateCoverageModalMessage}
        titleGeo={titleGeo}
      />

      {coverageModalMessage ? <MessageWhy coverageModalMessage={coverageModalMessage} /> : null}
      {inventory[focusCoverageGeoid] ? (
        <div style={{ padding: '20px', overflowY: 'scroll' }}>
          <TreeEntry
            cntyplc={inventory[focusCoverageGeoid]}
            updateModalOpen={updateModalOpen}
            updateStatChoice={updateStatChoice}
            updatedSelectedDownload={updatedSelectedDownload}
            updateCoverageModalOpen={updateCoverageModalOpen}
          />
        </div>
      ) : (
        <p style={{ margin: '40px auto' }}>No parcel coverage available.</p>
      )}
    </Dialog>
  );
}

function MessageWhy({ coverageModalMessage }) {
  return (
    <div style={{ borderBottom: '1px dotted grey' }}>
      <h4
        style={{
          marginLeft: '20px',
          display: 'inline',
          lineHeight: '48px',
          overflowX: 'hidden',
          color: 'red',
        }}
      >
        {coverageModalMessage}
      </h4>
    </div>
  );
}

function CoverageHeader({ updateCoverageModalOpen, updateCoverageModalMessage, titleGeo }) {
  return (
    <div style={{ height: '48px', borderBottom: '1px dotted grey' }}>
      <div style={{ marginLeft: '20px', position: 'relative', top: '6px', display: 'inline' }}>
        <ListIcon />
      </div>
      <h3
        style={{
          marginLeft: '20px',
          display: 'inline',
          lineHeight: '48px',
          overflowX: 'hidden',
        }}
      >
        {titleGeo}
      </h3>
      <IconButton
        style={{ float: 'right' }}
        aria-label="close"
        onClick={() => {
          updateCoverageModalOpen(false);
          updateCoverageModalMessage('');
        }}
      >
        <CloseIcon />
      </IconButton>
    </div>
  );
}
