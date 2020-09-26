// old: was used for coverage map.  kept as example of how to export own style
// todo tinker with brightv9 to customize better rather than importing whole layer.
export const style = {
  version: 8,
  name: 'Bright',
  metadata: {
    'mapbox:autocomposite': true,
    'mapbox:type': 'template',
    'mapbox:groups': {
      '1444849382550.77': {
        name: 'Water',
        collapsed: true,
      },
      '1444849345966.4436': {
        name: 'Roads',
        collapsed: true,
      },
      '1444849307123.581': {
        name: 'Admin  lines',
        collapsed: true,
      },
      '1456163609504.0715': {
        name: 'Road labels',
        collapsed: true,
      },
      '1444849272561.29': {
        name: 'Place labels',
        collapsed: true,
      },
      '1444849290021.1838': {
        name: 'Road labels',
        collapsed: true,
      },
    },
  },
  sources: {
    mapbox: {
      url: 'mapbox://mapbox.mapbox-streets-v7',
      type: 'vector',
    },
  },
  sprite: 'mapbox://sprites/mapbox/bright-v9',
  glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#ffffff',
      },
      interactive: true,
    },

    {
      interactive: true,
      metadata: {
        'mapbox:group': '1444849382550.77',
      },
      filter: ['all', ['==', 'class', 'no']],
      type: 'line',
      source: 'mapbox',
      id: 'blank',
      'source-layer': 'waterway',
    },

    {
      interactive: true,
      layout: {
        'line-cap': 'round',
      },
      metadata: {
        'mapbox:group': '1444849382550.77',
      },
      filter: [
        'all',
        ['!=', 'class', 'river'],
        ['!=', 'class', 'stream'],
        ['!=', 'class', 'canal'],
      ],
      type: 'line',
      source: 'mapbox',
      id: 'waterway',
      paint: {
        'line-color': '#a0c8f0',
        'line-width': {
          base: 1.3,
          stops: [
            [13, 0.5],
            [20, 2],
          ],
        },
      },
      'source-layer': 'waterway',
    },
    {
      interactive: true,
      layout: {
        'line-cap': 'round',
      },
      metadata: {
        'mapbox:group': '1444849382550.77',
      },
      filter: ['==', 'class', 'river'],
      type: 'line',
      source: 'mapbox',
      id: 'waterway_river',
      paint: {
        'line-color': '#a0c8f0',
        'line-width': {
          base: 1.2,
          stops: [
            [11, 0.5],
            [20, 6],
          ],
        },
      },
      'source-layer': 'waterway',
    },
    {
      interactive: true,
      layout: {
        'line-cap': 'round',
      },
      metadata: {
        'mapbox:group': '1444849382550.77',
      },
      filter: ['in', 'class', 'stream', 'canal'],
      type: 'line',
      source: 'mapbox',
      id: 'waterway_stream_canal',
      paint: {
        'line-color': '#a0c8f0',
        'line-width': {
          base: 1.3,
          stops: [
            [13, 0.5],
            [20, 6],
          ],
        },
      },
      'source-layer': 'waterway',
    },
    {
      id: 'water',
      type: 'fill',
      source: 'mapbox',
      'source-layer': 'water',
      paint: {
        'fill-color': '#a0c8f0',
      },
      metadata: {
        'mapbox:group': '1444849382550.77',
      },
      interactive: true,
    },

    {
      id: 'water_pattern',
      paint: {
        'fill-translate': [0, 2.5],
        'fill-pattern': 'wave',
      },
      metadata: {
        'mapbox:group': '1444849382550.77',
      },
      interactive: true,
      ref: 'water',
    },

    {
      interactive: true,
      layout: {
        'line-join': 'round',
      },
      metadata: {
        'mapbox:group': '1444849307123.581',
      },
      filter: ['all', ['>=', 'admin_level', 3], ['==', 'maritime', 0]],
      type: 'line',
      source: 'mapbox',
      id: 'admin_level_3',
      paint: {
        'line-color': '#9e9cab',
        'line-dasharray': [3, 1, 1, 1],
        'line-width': {
          base: 1,
          stops: [
            [4, 0.4],
            [5, 1],
            [12, 3],
          ],
        },
      },
      'source-layer': 'admin',
    },
    {
      interactive: true,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      metadata: {
        'mapbox:group': '1444849307123.581',
      },
      filter: ['all', ['==', 'admin_level', 2], ['==', 'disputed', 0], ['==', 'maritime', 0]],
      type: 'line',
      source: 'mapbox',
      id: 'admin_level_2',
      paint: {
        'line-color': '#9e9cab',
        'line-width': {
          base: 1,
          stops: [
            [4, 1.4],
            [5, 2],
            [12, 8],
          ],
        },
      },
      'source-layer': 'admin',
    },
    {
      interactive: true,
      layout: {
        'line-cap': 'round',
      },
      metadata: {
        'mapbox:group': '1444849307123.581',
      },
      filter: ['all', ['==', 'admin_level', 2], ['==', 'disputed', 1], ['==', 'maritime', 0]],
      type: 'line',
      source: 'mapbox',
      id: 'admin_level_2_disputed',
      paint: {
        'line-color': '#9e9cab',
        'line-dasharray': [2, 2],
        'line-width': {
          base: 1,
          stops: [
            [4, 1.4],
            [5, 2],
            [12, 8],
          ],
        },
      },
      'source-layer': 'admin',
    },
  ],
  created: 0,
  modified: 0,
  owner: 'mapbox',
  id: 'bright-v9',
  draft: false,
  visibility: 'public',
};
