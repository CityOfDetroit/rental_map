'use strict';
import Map from './map.class.js';
import Panel from './panel.class.js';
import DataManager from './data-manager.class.js';
import mapboxgl from 'mapbox-gl';
const turf = require('@turf/turf');
const moment = require('moment');
export default class Controller {
  constructor(map, zipcodes) {
    this.activeAreas = null;
    this.activeRentalParcels = ["in",'parcelno'];
    this.defaultSettings = {
      zipcodes: zipcodes,
      activeLayers: ['parcel-fill']
    };
    this.panel = new Panel();
    this.dataManager = new DataManager();
    this.map = new Map(map, this);
    this.initialLoad(this);
  }
  initialLoad(controller){
    document.getElementById('initial-loader-overlay').className = 'active';
    let queryStr = '';
    controller.defaultSettings.zipcodes.forEach(function(zip,index){
      queryStr +=  `%27${zip}%27${index < controller.defaultSettings.zipcodes.length - 1 ? `,` : ''}`;
    });
    let url = `https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/ZipCodes/FeatureServer/0/query?where=zipcode+in+%28${queryStr}%29&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=`;
    fetch(url)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) {
      controller.activeAreas = data;
      controller.defaultSettings.startDate = '2017-12-31';
      controller.dataManager.buildData('initial', controller);
    });
  }
  createZipcodesLayers(controller){
    let sources = [{
      "id":  "zip-borders",
      "type": "geojson",
      "data": controller.activeAreas
    }];
    controller.map.addSources(sources, controller);
    let tempNewLayers = [{
      "id": "zip-borders",
      "type": "line",
      "source": "zip-borders",
      "layout": {},
      "paint": {
        "line-color": "#004b90",
        "line-width": 3
      }
    }];
    controller.map.addLayers(tempNewLayers, controller);
    let zipLabes = {
      "type": "FeatureCollection",
      "features": []
    };
    for (var i = 0; i < controller.activeAreas.features.length; i++) {
      // console.log(controller.activeAreas.features[i].geometry.coordinates[0]);
      var tempPolygon = turf.polygon([controller.activeAreas.features[i].geometry.coordinates[0]]);
      var tempCenter = turf.centroid(tempPolygon);
      var tempFeature = {
          "type": "Feature",
          "geometry": {
              "type": "Point",
              "coordinates": tempCenter.geometry.coordinates
          },
          "properties":{
            "name": controller.activeAreas.features[i].properties.zipcode
          }
      };
      zipLabes.features.push(tempFeature);
    }
    // console.log(zipLabes);
    let zipLabesSource = [{
      "id":  "zip-codes-labels",
      "type": "geojson",
      "data": zipLabes
    }];
    controller.map.addSources(zipLabesSource, controller);
    let zipLabelsLayers = [{
      'id': 'zip-labels',
      'type': 'symbol',
      'source': "zip-codes-labels",
      'maxzoom': 15.5,
      'layout': {
        "text-font": ["Open Sans Bold"],
        'text-field': '{name}',
        'text-allow-overlap': true
      },
      'paint': {
        'text-color': 'black'
      }
    }];
    controller.map.addLayers(zipLabelsLayers, controller);
  }
  createRentalsLayer(controller){
    // console.log(controller.dataManager.initialDataBank);
    let tempNewLayers = [];
    for (var zip in controller.dataManager.initialDataBank.rentals) {
      if (controller.dataManager.initialDataBank.rentals.hasOwnProperty(zip)) {
        controller.dataManager.initialDataBank.rentals[zip].features.forEach(function(parcel){
          controller.activeRentalParcels.push(parcel.properties.parcelnum);
        });
      }
      // console.log(`rental-${zip}`);
      let sources = [{
        "id":  `rental-${zip}`,
        "type": "geojson",
        "data": controller.dataManager.initialDataBank.rentals[zip]
      }];
      controller.map.addSources(sources, controller);
      tempNewLayers.push({
        "id": `rental-${zip}`,
        "source": `rental-${zip}`,
        "maxzoom": 15.5,
        "type": "circle",
        "paint": {
            "circle-radius": 6,
            "circle-color": "#194ed7"
        },
        "event": true
      });
      controller.defaultSettings.activeLayers.push(`rental-${zip}`);
    }
    tempNewLayers.push({
      "id": "rental-parcels",
      "type": "fill",
      "source": "parcels",
      "minzoom": 15.5,
      'source-layer': 'parcelsgeojson',
      'filter': controller.activeRentalParcels,
      "paint": {
        "fill-color":"#194ed7",
        "fill-opacity":1
      },
      "event": true
    });
    controller.defaultSettings.activeLayers.push("rental-parcels");
    controller.map.addLayers(tempNewLayers, controller);
    controller.createZipcodesLayers(controller);
    document.getElementById('initial-loader-overlay').className = '';
  }
  checkLayerType(ev, layerID, layer, controller){
    // console.log(ev);
    console.log(layerID);
    console.log(layer);
    switch (layer.layer.id) {
      case 'parcel-fill':
        // console.log('parcel');
        controller.map.map.setFilter("parcel-fill-selected", ["==", "parcelno", layer.properties.parcelno]);
        let url = `https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/ZipCodes/FeatureServer/0/query?where=&objectIds=&time=&geometry=${ev.lngLat.lng}%2C+${ev.lngLat.lat}%0D%0A%0D%0A%0D%0A&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=zipcode&returnGeometry=false&returnCentroid=false&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=json&token=`;
        fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          // console.log(data);
          if(controller.defaultSettings.zipcodes.includes(data.features[0].attributes.zipcode)){
            controller.panel.creatPanel('parcel', controller, layer, true);
          }else {
            controller.panel.creatPanel('parcel', controller, layer);
          }
        });
        break;
      case 'rental-parcels':
        controller.panel.creatPanel('parcel', controller, layer, true);
        break;
      default:
        // console.log('rental');
        // console.log(layer.properties.parcelnum);
        if(layer.properties.parcelnum != undefined){
          controller.map.map.setFilter("parcel-fill-selected", ["==", "parcelno", layer.properties.parcelnum]);
          let url = `https://data.detroitmi.gov/resource/baxk-dxw9.json?$where=parcelnum = '${encodeURI(layer.properties.parcelno)}'`;
          fetch(url)
          .then((resp) => resp.json()) // Transform the data into json
          .then(function(data) {
            console.log(data);
            if(data.length){
              controller.panel.creatPanel('rental', controller, layer, true, true);
            }else{
              controller.panel.creatPanel('rental', controller, layer, true);
            }
          });
        }
    }
    controller.map.map.flyTo({
        // These options control the ending camera position: centered at
        // the target, at zoom level 9, and north up.
        center: [ev.lngLat.lng, ev.lngLat.lat],
        zoom: 16.5,
        bearing: 0,

        // These options control the flight curve, making it move
        // slowly and zoom out almost completely before starting
        // to pan.
        speed: 2, // make the flying slow
        curve: 1, // change the speed at which it zooms out

        // This can be any easing function: it takes a number between
        // 0 and 1 and returns another number between 0 and 1.
        easing: function (t) {
            return t;
        }
    });
  }
  geocoderResults(e, controller){
    let tempAddr = e.result.place_name.split(",");
    tempAddr = tempAddr[0];
    tempAddr = tempAddr.split(" ");
    let newTempAddr = '';
    let size = tempAddr.length;
    tempAddr.forEach(function(item, index) {
      newTempAddr += item;
      ((index < size) && (index + 1) !== size) ? newTempAddr += '+': 0;
    });
    // console.log(newTempAddr);
    let url = "https://gis.detroitmi.gov/arcgis/rest/services/DoIT/CompositeGeocoder/GeocodeServer/findAddressCandidates?Street=&City=&ZIP=&SingleLine=" + newTempAddr + "&category=&outFields=User_fld&maxLocations=&outSR=4326&searchExtent=&location=&distance=&magicKey=&f=json";
    fetch(url)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) {
      // console.log(data);
      if(data.candidates.length){
        if(data.candidates[0].attributes.User_fld != ""){
          // console.log('parcel found');
          controller.dataManager.buildData(data.candidates[0], controller);
          // controller.panel.creatPanel("parcel", data.candidates[0].attributes.User_fld, controller);
        }else{
          // console.log("no parcel found");
        }
      }else{
        // console.log("no parcel found");
      }
    });
  }
  closeAlert(ev){
    (ev.target.parentNode.parentNode.id === 'alert-overlay') ? document.getElementById('alert-overlay').className = '': document.getElementById('drill-down-overlay').className = '';
  }
}
