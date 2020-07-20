// TODO set up prod env.  Dont forget Cloudfront URLs

export const rawBase =
  window.location.hostname === 'localhost'
    ? 'https://raw-data-po-dev.s3.us-east-2.amazonaws.com/'
    : 'https://raw-data-po-dev.s3.us-east-2.amazonaws.com/';

export const productBase =
  window.location.hostname === 'localhost'
    ? 'https://data-products-po-dev.s3.us-east-2.amazonaws.com/'
    : 'https://data-products-po-dev.s3.us-east-2.amazonaws.com/';

export const tileBase = 'https://TODO.com';
