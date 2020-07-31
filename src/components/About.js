import React from 'react';

export default function About() {
  return (
    <div
      style={{
        width: '92%',
        fontSize: '16px',
        maxWidth: '1200px',
        margin: 'auto',
        marginBottom: '40px',
        padding: '20px',
        backgroundColor: 'antiquewhite',
        marginTop: '30px',
        borderRadius: '6px',
        height: 'auto',
        flexGrow: '1',
      }}
    >
      <h3>About</h3>

      <p>
        Parcel-Outlet was created as an easy way to find Parcel data from anywhere in the USA. The
        idea originated out of{' '}
        <a href="https://github.com/royhobbstn" rel="noopener noreferrer" target="_blank">
          the author's
        </a>{' '}
        frustration while working in State Government; that it was often difficult to find
        information necessary to get work done.
      </p>

      <p>
        These datasets have been harvested from their original locations on state or local
        government servers, and then reprojected and converted to popular formats. Additional
        datasets have been found by reaching out directly to government representatives.
      </p>

      <p>
        It is the author's belief that since these datasets were created with tax dollars, and since
        they contain no sensitive information, they should be publicly accessible.
      </p>

      <p>
        If you know of a dataset that you would like to see distributed by Parcel-Outlet,{' '}
        <a href="mailto:danieljtrone@gmail.com">please let me know about it.</a>
      </p>
    </div>
  );
}
