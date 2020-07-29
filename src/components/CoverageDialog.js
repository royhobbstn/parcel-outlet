import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import ListIcon from '@material-ui/icons/List';

import { stateLookup } from '../lookups/states';
import { countyLookup } from '../lookups/counties.js';

export default function CoverageDialog({
  coverageModalOpen,
  updateCoverageModalOpen,
  focusCoverageGeoid,
  inventory,
}) {
  console.log(inventory[focusCoverageGeoid]);

  const state = focusCoverageGeoid.slice(0, 2);
  const county = focusCoverageGeoid.slice(2);
  const titleGeo = `${countyLookup(state + county)}, ${stateLookup(state)}`;

  return (
    <Dialog open={coverageModalOpen} fullWidth={true} maxWidth="md">
      <CoverageHeader updateCoverageModalOpen={updateCoverageModalOpen} titleGeo={titleGeo} />

      {inventory[focusCoverageGeoid] ? (
        <div style={{ height: '60%', overflowY: 'scroll' }}>
          <p>Hi</p>
        </div>
      ) : (
        <p style={{ margin: '40px auto' }}>No parcel coverage available.</p>
      )}
    </Dialog>
  );
}

function CoverageHeader({ updateCoverageModalOpen, titleGeo }) {
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
        }}
      >
        <CloseIcon />
      </IconButton>
    </div>
  );
}
