import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import FeedbackIcon from '@material-ui/icons/Feedback';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';

export default function ButtonAppBar({ feedbackModal, updateFeedbackModal }) {
  const [nameText, updateNameText] = useState('');
  const [contactText, updateContactText] = useState('');
  const [feedbackText, updateFeedbackText] = useState('');
  return (
    <Dialog open={feedbackModal} fullWidth={true} maxWidth="md" style={{ overflow: 'hidden' }}>
      <div
        style={{
          height: '48px',
          borderBottom: '1px dotted grey',
          zIndex: '500',
          backgroundColor: 'white',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            marginLeft: '20px',
            position: 'relative',
            top: '5px',
            display: 'inline',
            overflow: 'hidden',
          }}
        >
          <FeedbackIcon />
        </div>
        <h3
          style={{
            marginLeft: '20px',
            marginRight: '20px',
            display: 'inline',
            lineHeight: '48px',
            overflow: 'hidden',
          }}
        >
          Feedback
        </h3>
        <IconButton
          style={{ float: 'right', marginRight: '10px' }}
          aria-label="close"
          onClick={() => {
            updateFeedbackText('');
            updateFeedbackModal(false);
          }}
        >
          <CloseIcon />
        </IconButton>
      </div>

      <Grid container spacing={2} style={{ overflow: 'hidden', width: '90%' }}>
        <Grid item xs={6} style={{ padding: '40px', overflow: 'hidden' }}>
          <TextField
            style={{ width: '100%' }}
            id="feedback-name-text"
            label="Name (or Alias)"
            value={nameText}
            onChange={evt => {
              updateNameText(evt.target.value);
            }}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={6} style={{ padding: '40px', overflow: 'hidden' }}>
          <TextField
            style={{ width: '100%' }}
            id="feedback-contact-text"
            label="Email"
            value={contactText}
            onChange={evt => {
              updateContactText(evt.target.value);
            }}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} style={{ padding: '10px 40px 20px 40px', overflow: 'hidden' }}>
          <TextField
            style={{ width: '100%', height: '90%' }}
            id="feedback-feedback-text"
            label="Feedback Text"
            multiline
            rows={6}
            rowsMax={10}
            value={feedbackText}
            onChange={evt => {
              updateFeedbackText(evt.target.value);
            }}
            variant="outlined"
          />
        </Grid>
      </Grid>
      <DialogActions>
        <Button
          disabled={feedbackText === ''}
          onClick={() => {
            updateFeedbackText('');
            updateFeedbackModal(false);
          }}
          color="primary"
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}
