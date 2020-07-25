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
        Parcel-Outlet was created as an easy way to find Parcel data from anywhere in the USA. It
        was born out of the author's frustration (me,{' '}
        <a href="mailto:danieljtrone@gmail.com">Daniel Trone</a>) while working in State Government
        that it was often difficult to find information that was necessary to get my work done.
      </p>

      <p>
        The vast majority of these datasets have been harvested from their original locations on
        state or local government servers, and then reprojected and converted to popular formats.
        Additional datasets have been found by reaching out directly to government representatives.
      </p>

      <p>
        It is the author's belief that since these datasets were created with tax dollars, and since
        they contain no sensitive information, they should be publicly accessible.
      </p>

      <p>
        That said, I don't have the resources to mount a legal challenge. If you are a government
        official and believe that I <i>SHOULD NOT</i> be distributing your data, it will be taken
        down. (Let's discuss it first though.)
      </p>

      <p>
        Conversely, if you know of a dataset that you would like to see distributed by
        Parcel-Outlet, <a href="mailto:danieljtrone@gmail.com">please let me know about it.</a>
      </p>
    </div>
  );
}
