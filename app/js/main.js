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
      },
      {
        "id":  `rental`,
        "type": "geojson",
        "data": {
          "type": "FeatureCollection",
          "features": []
        } 
      },
      {
        "id":  `cert`,
        "type": "geojson",
        "data": {
          "type": "FeatureCollection",
          "features": []
        }
      },
      {
        "id":  `occupied`,
        "type": "geojson",
        "data": {
          "type": "FeatureCollection",
          "features": []
        }
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
        "id": "rental",
        "source": "rental",
        "maxzoom": 15.5,
        "type": "circle",
        "paint": {
            "circle-radius": 6,
            "circle-color": "#194ed7"
        },
        "event": true
       },
       {
        "id": "cert",
        "source": "cert",
        "maxzoom": 15.5,
        "type": "circle",
        "paint": {
            "circle-radius": 6,
            "circle-color": "#068A24"
        },
        "event": true
       },
       {
        "id": "occupied",
        "source": "occupied",
        "maxzoom": 15.5,
        "type": "circle",
        "paint": {
            "circle-radius": 6,
            "circle-color": "#ff932d"
        },
        "event": true
       },
       {
        "id": "rental-parcels",
        "type": "fill",
        "source": "parcels",
        "minzoom": 15.5,
        'source-layer': 'parcelsgeojson',
        'filter': ["in","parcelno"],
        "paint": {
          "fill-color":"#194ed7",
          "fill-opacity":1
        },
        "event": false
       },
       {
        "id": "cert-parcels",
        "type": "fill",
        "source": "parcels",
        "minzoom": 15.5,
        'source-layer': 'parcelsgeojson',
        'filter': ["in","parcelno"],
        "paint": {
          "fill-color":"#068A24",
          "fill-opacity":1
        },
        "event": false
       },
       {
        "id": "occup-parcels",
        "type": "fill",
        "source": "parcels",
        "minzoom": 15.5,
        'source-layer': 'parcelsgeojson',
        'filter': ["in","parcelno"],
        "paint": {
          "fill-color":"#ff932d",
          "fill-opacity":1
        },
        "event": false
       },
       {
        "id": "parcel-fill-selected",
        "type": "line",
        "source": "parcels",
        "minzoom": 15.5,
        "layout": {},
        "paint": {
          "line-color": "#BD0019",
          "line-width": 4
        },
        "source-layer": "parcelsgeojson",
        "filter": ["==", "parcelno", ""]
      }
    ]
  },
  ['48215','48224','48223'],
  ['48215']);
  let closeInfo = function closeInfo() {
    //console.log('closing');
    (document.querySelector('#info').className === 'active') ? document.querySelector('#info').className = '' : document.querySelector('#info').className = 'active';
    document.querySelector('.info-container > .street-name').innerHTML = 'Rental Dashboard';
    document.querySelector('.info-container .info').innerHTML = `Welcome to the Detroit Rental Dashboard. Please use this tool
    look up the status of a rental property. For more information, please
    visit the <a href="https://data.detroitmi.gov/resource/vphr-kg52" target="_blank">Detroit Open Data Portal</a>.`;
    document.querySelector('.mapboxgl-ctrl-geocoder > input[type="text"]').value = '';
  };
  document.getElementById('close-emergency-modal-btn').addEventListener('click',closeInfo);
})(window);
