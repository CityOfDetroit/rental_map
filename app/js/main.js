'use strict';
import Controller from './controller.class.js';
(function(){
  let controller = new Controller({
    styleURL: 'mapbox://styles/mapbox',
    mapContainer: 'map',
    geocoder: true,
    controls: true,
    draw: false,
    baseLayers: {
      street: 'streets-v10',
      satellite: 'cj774gftq3bwr2so2y6nqzvz4'
    },
    center: [-83.10, 42.36],
    zoom: 10.75,
    boundaries: {
      sw: [-83.3437,42.2102],
      ne: [-82.8754,42.5197]
    },
    sources: [
      {
        "id": "parcels",
        "type": "vector",
        "url": "mapbox://slusarskiddetroitmi.cwobdjn0"
      }
    ],
    layers: [
      {
          "id": "parcel-fill",
          "type": "fill",
          "source": "parcels",
          "minzoom": 15.5,
          "layout": {
          },
          "paint": {
               "fill-color":"#fff",
               "fill-opacity":0
          },
          'source-layer': 'parcelsgeojson',
          "event": true
       },
       {
          "id": "parcel-line",
          "type": "line",
          "source": "parcels",
          "minzoom": 15.5,
          "layout": {
          },
          "paint": {
               "line-color":"#cbcbcb",
          },
          'source-layer': 'parcelsgeojson'
       },
       {
         "id": "parcel-fill-selected",
         "type": "line",
         "source": "parcels",
         "minzoom": 15.5,
         "layout": {},
         "paint": {
           "line-color": "#BD0019",
           "line-width": 3
         },
         "source-layer": "parcelsgeojson",
         "filter": ["==", "parcelno", ""]
       }
    ]
  },
  ['48215']);
})(window);
