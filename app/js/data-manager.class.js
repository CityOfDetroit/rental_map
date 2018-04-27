'use strict';
const moment = require('moment');
const turf = require('@turf/turf');
const arcGIS = require('terraformer-arcgis-parser');
const WKT = require('terraformer-wkt-parser');
export default class DataManager {
  constructor() {
    // NOTE: rental data
    this.initialDataBank = {
      rentals: {},
      instpections: {}
    };
    this.tempDataBank = {
      rentals: {},
      instpections: {}
    };
  }
  buildData(type, controller, location = null){
    (type === 'initial') ? controller.dataManager.buildInitialData(controller) : controller.dataManager.buildTempData(location, controller);
  }
  buildInitialData(controller){
    // NOTE: Fetching initial data
    controller.activeAreas.features.forEach(function(zip){
      let socrataPolygon = WKT.convert(zip.geometry);
      let registrations = new Promise((resolve, reject) => {
        let url = `https://data.detroitmi.gov/resource/vphr-kg52.geojson?$query=SELECT * WHERE within_polygon(location, '${socrataPolygon}') AND parcelnum IS NOT NULL`;
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          resolve({"id": zip.properties.zipcode, "type": "rentals", "data": data});
        });
      });
      Promise.all([registrations]).then(values => {
          values.forEach(function(set){
            if(set.data.features.length){
              switch (set.type) {
                case 'rentals':
                  controller.dataManager.initialDataBank.rentals[set.id] = set.data;
                  break;
                default:

              }
            }
          });
          console.log(controller.dataManager.initialDataBank);
          controller.createRentalsLayer(controller);
          controller.panel.creatPanel('initial', controller);
      }).catch(reason => {
        console.log(reason);
      });
    });
  }
  buildTempData(type, location, controller){
    switch (type) {
      case 'parcel':
        
        break;
      case 'rental-parcels':

        break;
      default:

    }
  }
}
