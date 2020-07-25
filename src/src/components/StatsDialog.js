import React, { useEffect, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import '../style/statsOverrides.css';
import { TableHead } from '@material-ui/core';

export default function StatsDialog({ modalOpen, updateModalOpen, productKey, selectedDownload }) {
  const [statsInfo, updateStatsInfo] = useState(null);
  const [selectedFieldKey, updateSelectedFieldKey] = useState('');

  useEffect(() => {
    // download stats from -stat file.
    if (productKey) {
      const statifyKey = productKey.replace('.ndgeojson', '-stat.json');

      window
        .fetch(statifyKey)
        .then(res => res.json())
        .then(response => {
          updateStatsInfo(response);
        })
        .catch(err => {
          updateStatsInfo(null);
          console.error(err);
        });
    }
  }, [productKey]);

  return (
    <Dialog open={modalOpen} fullWidth={true} maxWidth="md">
      <StatsHeader
        selectedDownload={selectedDownload}
        updateModalOpen={updateModalOpen}
        statsInfo={statsInfo}
        updateSelectedFieldKey={updateSelectedFieldKey}
      />
      {statsInfo ? (
        <Grid container spacing={2} style={{ overflowX: 'hidden' }}>
          <Grid item xs={12}>
            <StatsInfoCard selectedDownload={selectedDownload} statsInfo={statsInfo} />
          </Grid>
          <Grid item xs={6} style={{ paddingLeft: '60px' }}>
            <h3 style={{ marginTop: '0px' }}>Fields</h3>{' '}
            <StatsFields
              statsInfo={statsInfo}
              selectedFieldKey={selectedFieldKey}
              updateSelectedFieldKey={updateSelectedFieldKey}
            />
          </Grid>{' '}
          <Grid item xs={6} style={{ paddingRight: '60px' }}>
            <h3 style={{ marginTop: '0px' }}>Field Attributes</h3>
            {selectedFieldKey ? (
              <FieldAttributes selectedFieldKey={selectedFieldKey} statsInfo={statsInfo} />
            ) : (
              <span style={{ fontSize: '75%' }}>(Click a field name to see more information)</span>
            )}
          </Grid>
        </Grid>
      ) : null}
    </Dialog>
  );
}

function StatsHeader({ selectedDownload, updateModalOpen, statsInfo, updateSelectedFieldKey }) {
  return (
    <div style={{ height: '48px', borderBottom: '1px dotted grey' }}>
      <h3
        style={{
          marginLeft: '20px',
          display: 'inline',
          lineHeight: '48px',
          overflowX: 'hidden',
        }}
      >
        Statistics:&nbsp;&nbsp;&nbsp;{selectedDownload.geoname}&nbsp;&nbsp;(
        {statsInfo ? new URL(selectedDownload.source_name).hostname : null})
      </h3>
      <IconButton
        style={{ float: 'right' }}
        aria-label="close"
        onClick={() => {
          updateModalOpen(false);
          updateSelectedFieldKey('');
        }}
      >
        <CloseIcon />
      </IconButton>
    </div>
  );
}

function StatsInfoCard({ selectedDownload, statsInfo }) {
  return (
    <div
      style={{
        width: '90%',
        margin: '20px auto 0 auto',
        padding: '5px 25px',
        backgroundColor: 'antiquewhite',
        overflowX: 'hidden',
        borderRadius: '5px',
        border: '1px solid rgba(0, 0, 0, 0.14)',
      }}
    >
      <TableContainer id="headertable">
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>
                Source:{' '}
                <a href={selectedDownload.source_name} target="_blank" rel="noopener noreferrer">
                  {new URL(selectedDownload.source_name).hostname}
                </a>
              </TableCell>
              <TableCell>
                Downloaded: {new Date(selectedDownload.created).toLocaleTimeString()}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Records: {statsInfo.rowCount.toLocaleString() || '...?'}</TableCell>
              <TableCell>
                Last Checked: {new Date(selectedDownload.last_checked).toLocaleTimeString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

function StatsFields({ statsInfo, selectedFieldKey, updateSelectedFieldKey }) {
  return (
    <Paper
      elevation={5}
      style={{
        padding: '2px',
        margin: '0 20px 40px 5px',
        height: '250px',
        overflowY: 'scroll',
        overflowX: 'hidden',
        cursor: 'pointer',
      }}
    >
      <TableContainer>
        <Table size="small">
          <TableBody>
            {Object.keys(statsInfo.fields || {}).map(fieldKey => {
              return (
                <TableRow
                  hover
                  key={fieldKey}
                  onClick={() => {
                    if (fieldKey === selectedFieldKey) {
                      updateSelectedFieldKey(null);
                    } else {
                      updateSelectedFieldKey(fieldKey);
                    }
                  }}
                >
                  <TableCell>{fieldKey}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function FieldAttributes({ selectedFieldKey, statsInfo }) {
  return (
    <div>
      <p>
        <span style={{ fontWeight: 'bold' }}>Field: </span>
        {selectedFieldKey}
      </p>
      <p>
        <span style={{ fontWeight: 'bold' }}>Type(s): </span>{' '}
        {statsInfo.fields[selectedFieldKey].types.join(', ')}
      </p>
      {statsInfo.fields[selectedFieldKey].IDField === true ? (
        <div>
          <p style={{ paddingTop: '5px' }}>All Fields Unique. Sample:</p>
          <ul>
            {statsInfo.fields[selectedFieldKey].IDSample.slice(0, 5).map(d => {
              return <li key={d}>{d}</li>;
            })}
          </ul>
        </div>
      ) : (
        <div>
          <Paper
            elevation={5}
            style={{
              marginTop: '14px',
              height: '182px',
              overflowY: 'scroll',
              overflowX: 'hidden',
              width: '100%',
            }}
          >
            <Table size="small" stickyHeader style={{ marginRight: '5px', width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell style={{ textAlign: 'left', width: '70%', wordBreak: 'break-all' }}>
                    Value
                  </TableCell>
                  <TableCell style={{ textAlign: 'right', width: '15%' }}>Count</TableCell>
                  <TableCell style={{ textAlign: 'right', width: '15%' }}>Percent</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(statsInfo.fields[selectedFieldKey].uniques)
                  .sort((a, b) => {
                    return (
                      statsInfo.fields[selectedFieldKey].uniques[b] -
                      statsInfo.fields[selectedFieldKey].uniques[a]
                    );
                  })
                  .map(uniquesKey => {
                    return (
                      <TableRow key={uniquesKey}>
                        <TableCell
                          style={{ textAlign: 'left', width: '70%', wordBreak: 'break-all' }}
                        >
                          {uniquesKey}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          {statsInfo.fields[selectedFieldKey].uniques[uniquesKey].toLocaleString()}
                        </TableCell>
                        <TableCell style={{ textAlign: 'right' }}>
                          {(
                            (statsInfo.fields[selectedFieldKey].uniques[uniquesKey] /
                              statsInfo.rowCount) *
                            100
                          ).toFixed(2)}
                          &nbsp;%
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </Paper>
        </div>
      )}
    </div>
  );
}
