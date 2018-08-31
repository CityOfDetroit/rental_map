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
      instpections: {},
      certificates: {},
      occupancy: {}
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
    // console.log(controller.activeAreas);
    controller.activeAreas.features.forEach(function(zip, index){
      let socrataPolygon = WKT.convert(zip.geometry);
      let registrations = new Promise((resolve, reject) => {
        let url = `https://data.detroitmi.gov/resource/vphr-kg52.geojson?$query=SELECT * WHERE intersects(location, '${socrataPolygon}') AND parcelnum IS NOT NULL`;
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          // console.log(zip);
          resolve({"id": zip.properties.GEOID10, "type": "rentals", "data": data});
        });
      });
      let certificates = new Promise((resolve, reject) => {
        let url = `https://data.detroitmi.gov/resource/baxk-dxw9.geojson?$query=SELECT * WHERE intersects(location, '${socrataPolygon}') AND parcelnum IS NOT NULL`;
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          // console.log(zip);
          resolve({"id": zip.properties.GEOID10, "type": "certificates", "data": data});
        });
      });
      let occupancy = new Promise((resolve, reject) => {
        let url = `https://data.detroitmi.gov/resource/4tq8-6eaw.geojson?$query=SELECT * WHERE intersects(location, '${socrataPolygon}') AND parcel_no IS NOT NULL AND  bld_type_use_calculated='Residential'`;
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          // console.log(zip);
          resolve({"id": zip.properties.GEOID10, "type": "occupancy", "data": data});
        });
      });
      Promise.all([registrations, certificates, occupancy]).then(values => {
        // console.log(values);
          let rentals = {
            "type": "FeatureCollection",
            "features": []
          };
          let tempOccup = {
            "type": "FeatureCollection",
            "features": []
          };
          let approved = values[1].data;
          // console.log(tempRentals);
          values[0].data.features.forEach(function(value){
            let test = false;
            values[1].data.features.forEach(function(item){
              (item.properties.parcelnum === value.properties.parcelnum) ? test = true : 0;
            });
            // console.log(test);
            if(!test){
              // console.log(value);
              rentals.features.push(value);
            }
          });
          // ==============================
          // Separating occupied with registration and occupied without registration
          // ==============================
          values[2].data.features.forEach(function(value){
            let test = false;
            values[0].data.features.forEach(function(item){
              (item.properties.parcelnum === value.properties.parcel_no) ? test = true : 0;
            });
            // console.log(test);
            if(!test){
              // console.log(value);
              tempOccup.features.push(value);
            }else{
              approved.features.push(value);
            }
          });
          // console.log(tempOccup);
          controller.dataManager.initialDataBank.rentals[values[0].id] = rentals;
          controller.dataManager.initialDataBank.certificates[values[1].id] = approved;
          controller.dataManager.initialDataBank.occupancy[values[2].id] = tempOccup;
          // console.log(controller.dataManager.initialDataBank);
          if(index == controller.activeAreas.features.length - 1){
            controller.panel.creatPanel('initial', controller);
          }
          controller.createRentalsLayer(controller);
          
      }).catch(reason => {
        console.log(reason);
      });
    });
  }
  buildTempData(type, location, controller){
    // console.log(location);
    let registrations = new Promise((resolve, reject) => {
      let url = `https://data.detroitmi.gov/resource/vphr-kg52.geojson?$where=parcelnum = '${encodeURI(location.data.properties.parcelno)}'`;
      return fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
        resolve({"id": location.data.properties.parcelno, "type": "registration", "data": data});
      });
    });
    let certified = new Promise((resolve, reject) => {
      let url = `https://data.detroitmi.gov/resource/baxk-dxw9.json?$where=parcelnum = '${encodeURI(location.data.properties.parcelno)}'`;
      return fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
        resolve({"id": location.data.properties.parcelno, "type": "certified", "data": data});
      });
    });
    let occupancy = new Promise((resolve, reject) => {
      let url = `https://data.detroitmi.gov/resource/4tq8-6eaw.geojson?$query=SELECT * WHERE parcel_no='${encodeURI(location.data.properties.parcelno)}' AND  bld_type_use_calculated='Residential'`;
      return fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
        resolve({"id": location.data.properties.parcelno, "type": "occupancy", "data": data});
      });
    });
    let assessors = new Promise((resolve, reject) => {
      let url = `https://apis.detroitmi.gov/assessments/parcel/${location.data.properties.parcelno}/`;
      fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
        // console.log(data);
        let tempAddr = data.propstreetcombined.split(",");
        tempAddr = tempAddr[0];
        tempAddr = tempAddr.split(" ");
        let newTempAddr = '';
        let size = tempAddr.length;
        tempAddr.forEach(function(item, index) {
          newTempAddr += item;
          ((index < size) && (index + 1) !== size) ? newTempAddr += '+': 0;
        });
        let url = `https://gis.detroitmi.gov/arcgis/rest/services/DoIT/CompositeGeocoder/GeocodeServer/findAddressCandidates?Street=&City=&ZIP=&SingleLine=${tempAddr}&category=&outFields=ZIP&maxLocations=&outSR=&searchExtent=&location=&distance=&magicKey=&f=json`;
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(zip) {
          resolve({"id": location.data.properties.parcelno, "type": "assessors", "data": data, "zip": zip.candidates[0].attributes.ZIP});
        });
      });
    });
    switch (type) {
      case 'parcel':
        Promise.all([registrations, certified, assessors, occupancy]).then(values => {
          console.log(values);
          let occupied = false;
          let certified = false;
          let tempData = {
            register: false,
            registrationDate: null,
            zipcode: values[2].zip
          };
          controller.parcelData = values[2].data;
          if(values[0].data.features.length){
            tempData.register = true;
            tempData.registrationDate = moment(values[0].data.features[0].properties.csa_date3).format('MMM Do,YYYY');
          }
          if(values[1].data.length){
            certified = true;
          }
          if(values[3].data.features.length){
            occupied = true;
          }
          controller.panel.creatPanel('parcel', controller, tempData, location.active, certified, occupied);
        }).catch(reason => {
          console.log(reason);
        });
        break;
      case 'rental-parcels':
        Promise.all([registrations, certified, assessors, occupancy]).then(values => {
          // console.log(values);
          let certified = false;
          let tempData = {
            register: false,
            registrationDate: null,
            zipcode: values[2].zip
          };
          controller.parcelData = values[2].data;
          if(values[0].data.features.length){
            tempData.register = true;
            tempData.registrationDate = moment(values[0].data.features[0].properties.csa_date3).format('MMM Do,YYYY');
          }
          if(values[1].data.length){
            certified = true;
          }
          controller.panel.creatPanel('parcel', controller, tempData, location.active, certified);
        }).catch(reason => {
          console.log(reason);
        });
        break;
      case 'rental':
        Promise.all([certified, assessors, occupancy]).then(values => {
          // console.log(values);
          let certified = false;
          let tempData = {
            register: false,
            registrationDate: null,
            zipcode: values[2].zip
          };
          controller.parcelData = values[2].data;
          if(values[0].data.features.length){
            tempData.register = true;
            tempData.registrationDate = moment(values[0].data.features[0].properties.csa_date3).format('MMM Do,YYYY');
          }
          if(values[1].data.length){
            certified = true;
          }
          controller.panel.creatPanel('parcel', controller, tempData, location.active, certified);
        }).catch(reason => {
          console.log(reason);
        });
        break;
      default:

    }
  }
}
