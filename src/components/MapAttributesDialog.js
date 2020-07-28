import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import ListIcon from '@material-ui/icons/List';
import Fab from '@material-ui/core/Fab';
import Typography from '@material-ui/core/Typography';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

export default function MapAttributesDialog({
  mapAttributesModalOpen,
  updateMapAttributesModalOpen,
  currentFeatureAttributes,
}) {
  console.log({ currentFeatureAttributes });

  const [current, updateCurrent] = useState(0);

  const total = currentFeatureAttributes.length;
  if (!total) {
    return null;
  }

  const currentFeature = currentFeatureAttributes[current];

  return (
    <Dialog open={mapAttributesModalOpen} fullWidth={false} maxWidth="md">
      <MapAttributesHeader updateMapAttributesModalOpen={updateMapAttributesModalOpen} />
      <FeatureScroller current={current} updateCurrent={updateCurrent} total={total} />
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Attribute</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(currentFeature)
            .filter(entry => {
              return entry[0] !== '__po_id';
            })
            .map(entry => {
              return (
                <TableRow key={entry[0]}>
                  <TableCell>{entry[0]}</TableCell>
                  <TableCell>{entry[1]}</TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </Dialog>
  );
}

function FeatureScroller({ current, updateCurrent, total }) {
  return (
    <React.Fragment>
      <div style={{ margin: '10px auto' }}>
        <Typography>
          Found {total} features. Showing feature #{' '}
          <span style={{ fontWeight: 'bold' }}> {current + 1} </span>{' '}
        </Typography>
      </div>
      <div style={{ margin: '5px auto' }}>
        {' '}
        <Fab
          size="small"
          color="primary"
          aria-label="add"
          style={{ marginRight: '15px' }}
          onClick={() => {
            if (current - 1 < 0) {
              // already on first feature
              return;
            }
            updateCurrent(current - 1);
          }}
        >
          <ChevronLeftIcon />
        </Fab>
        <Fab
          size="small"
          color="primary"
          aria-label="add"
          onClick={() => {
            if (current + 1 >= total) {
              // already on last feature
              return;
            }
            updateCurrent(current + 1);
          }}
        >
          <ChevronRightIcon />
        </Fab>
      </div>
    </React.Fragment>
  );
}

function MapAttributesHeader({ updateMapAttributesModalOpen }) {
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
        Parcel Attributes
      </h3>
      <IconButton
        style={{ float: 'right' }}
        aria-label="close"
        onClick={() => {
          updateMapAttributesModalOpen(false);
        }}
      >
        <CloseIcon />
      </IconButton>
    </div>
  );
}
