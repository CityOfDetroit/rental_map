'use strict';
import Map from './map.class.js';
import Panel from './panel.class.js';
import DataManager from './data-manager.class.js';
import mapboxgl from 'mapbox-gl';
const turf = require('@turf/turf');
const moment = require('moment');
export default class Controller {
  constructor(map, zipcodes) {
    this.activeArea = null;
    this.defaultSettings = {zipcodes: zipcodes};
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
      controller.activeAreas = data.features;
      controller.defaultSettings.startDate = '2017-12-31';
      controller.dataManager.buildData('initial', controller);
    });
  }
  createRentalsLayer(controller){
    console.log(controller.dataManager.initialDataBank);
    for (var zip in controller.dataManager.initialDataBank.rentals) {
      let new_Filter = ["in",'parcelno'];
      if (controller.dataManager.initialDataBank.rentals.hasOwnProperty(zip)) {
        controller.dataManager.initialDataBank.rentals[zip].features.forEach(function(parcel){
          new_Filter.push(parcel.properties.parcelnum);
        });
      }
      console.log(`rental-${zip}`);
      let tempNewLayer = null;
      if(controller.map.map.getSource(`rental-${zip}`)){
        controller.map.map.getSource(`rental-${zip}`).setData(controller.dataManager.initialDataBank.rentals[zip]);
        tempNewLayer = {
          "id": `rental-${zip}`,
          "source": `rental-${zip}`,
          "type": "circle",
          "paint": {
              "circle-radius": 6,
              "circle-color": "#194ed7"
          },
          "event": true
        };
      }else{
        console.log("no source found");
        let sources = [{
          "id":  `rental-${zip}`,
          "type": "geojson",
          "data": controller.dataManager.initialDataBank.rentals[zip]
        }];
        controller.map.addSources(sources, controller);
        tempNewLayer = {
          "id": `rental-${zip}`,
          "source": `rental-${zip}`,
          "type": "circle",
          "paint": {
              "circle-radius": 6,
              "circle-color": "#194ed7"
          },
          "event": true
        };
      }
      controller.map.addLayers([tempNewLayer], controller);
    }

    document.getElementById('initial-loader-overlay').className = '';
  }
  checkLayerType(ev, layerID, layer, controller){
    console.log(ev);
    console.log(layerID);
    console.log(layer);
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
