import React from 'react';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

export default function CoverageStats({ inventory }) {
  if (!(inventory && inventory.popStats)) {
    return null;
  }
  const popStats = inventory.popStats;

  const rowPadding = { padding: '4px' };
  const cellPadding = { padding: '4px 8px' };
  return (
    <Paper
      style={{
        position: 'absolute',
        zIndex: '1000',
        width: 'auto',
        height: 'auto',
        overflow: 'hidden',
        top: '80px',
        fontSize: '15px',
        left: '2%',
      }}
    >
      <TableContainer component={Paper} style={{ padding: '6px' }}>
        <Table aria-label="coverage statistics table">
          <TableHead>
            <TableRow style={rowPadding}>
              <TableCell style={cellPadding}></TableCell>
              <TableCell align="right" style={cellPadding}>
                Covered
              </TableCell>
              <TableCell align="right" style={cellPadding}>
                Total
              </TableCell>
              <TableCell align="right" style={cellPadding}>
                Percent
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow style={rowPadding}>
              <TableCell style={cellPadding}>Counties</TableCell>
              <TableCell align="right" style={cellPadding}>
                {popStats.countiesAccountedFor.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </TableCell>
              <TableCell align="right" style={cellPadding}>
                {popStats.totalCountyCount.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </TableCell>
              <TableCell align="right" style={cellPadding}>
                {popStats.percentOfTotalCounties.toLocaleString(undefined, {
                  style: 'percent',
                  minimumFractionDigits: 2,
                })}
              </TableCell>
            </TableRow>
            <TableRow style={rowPadding}>
              <TableCell style={cellPadding}>Population</TableCell>
              <TableCell align="right" style={cellPadding}>
                {(popStats.populationAccountedFor / 1000000).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
                m
              </TableCell>
              <TableCell align="right" style={cellPadding}>
                {(popStats.totalPopulation / 1000000).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
                m
              </TableCell>
              <TableCell align="right" style={cellPadding}>
                {popStats.percentOfTotalPopulation.toLocaleString(undefined, {
                  style: 'percent',
                  minimumFractionDigits: 2,
                })}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

// countiesAccountedFor: 201;
// percentOfTotalCounties: 0.06397199236155315;
// percentOfTotalPopulation: 0.08534317179104602;
// populationAccountedFor: 28013002;
// totalCountyCount: 3142;
// totalPopulation: 328239523;
