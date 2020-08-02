export const rawBase =
  window.location.hostname === 'www.parcel-outlet.com'
    ? 'https://raw.parcel-outlet.com'
    : 'https://raw-data-po-dev.s3.us-east-2.amazonaws.com';

export const productBase =
  window.location.hostname === 'www.parcel-outlet.com'
    ? 'https://products.parcel-outlet.com'
    : 'https://data-products-po-dev.s3.us-east-2.amazonaws.com';

export const tileBase =
  window.location.hostname === 'www.parcel-outlet.com'
    ? [
        'https://tiles-a.parcel-outlet.com',
        'https://tiles-b.parcel-outlet.com',
        'https://tiles-c.parcel-outlet.com',
      ]
    : ['https://tile-server-po-dev.s3.us-east-2.amazonaws.com'];

export const key =
  window.location.hostname === 'www.parcel-outlet.com'
    ? 'pk.eyJ1IjoibWFwdXRvcGlhIiwiYSI6ImNrZDF3OWN3ZzBjbjUyeG55dHVxOWZ1NGEifQ.N2J-ePIjrxxhI9dcld8tSA'
    : 'pk.eyJ1IjoibWFwdXRvcGlhIiwiYSI6ImNrZDF3Y3hhajE3dGEycXF5dWw5ZHJwd2kifQ.ck4nMAt2L5GV2TPRjQaOIQ';

export const dataPath =
  window.location.hostname === 'www.parcel-outlet.com'
    ? '/data/parcel_dataset_inventory.json'
    : '/data/parcel_dataset_inventory-dev.json';
