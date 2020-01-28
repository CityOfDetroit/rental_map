'use strict';
const moment = require('moment');
export default class DataManager {
  constructor() {
    // NOTE: rental data
    this.initialDataBank = {
      rentals: null,
      instpections: null,
      certificates: null,
      occupancy: null
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
    let registrations = new Promise((resolve, reject) => {
      let url = `https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Rental_Registrations_(Combined)/FeatureServer/0/query?outFields=*&outSR=4326&f=geojson&where=1%3D1&resultRecordCount=300000`;
      return fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
        //console.log(data);
        resolve({"id": "rentals", "data": data});
      });

    });

    //console.log(registrations);
    let certificates = new Promise((resolve, reject) => {
      let url =`https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Residential_Inspections_(combined)/FeatureServer/0/query?outFields=*&outSR=4326&f=geojson&where=result+%3D+%27OK%27+and+parcel_number+<>+null&resultRecordCount=300000`;
      return fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
         //console.log(data);
        resolve({"id": "certificates", "data": data});
      });
    });
    let occupancy = new Promise((resolve, reject) => {
     let url =`https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Certificate_of_Occupancy_(combined)/FeatureServer/0/query?outFields=*&outSR=4326&f=geojson&where=1%3D1&resultRecordCount=300000`;
      return fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
         //console.log(zip);
        resolve({"id": "occupancy", "data": data});
      });
    });
    Promise.all([registrations, certificates, occupancy]).then(values => {
      console.log(values);
        controller.dataManager.initialDataBank.rentals = values[0].data;
        controller.dataManager.initialDataBank.certificates = values[1].data;
        controller.dataManager.initialDataBank.occupancy = values[2].data;
        // console.log(controller.dataManager.initialDataBank);
        controller.panel.creatPanel('initial', controller);
        //console.log(controller);
        controller.createRentalsLayer(controller);

    }).catch(reason => {
      console.log(reason);
    });
  }
  buildTempData(type, location, controller){
    //  console.log(location);

    let registrations = new Promise((resolve, reject) => {
      let url = `https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Rental_Registrations_(Combined)/FeatureServer/0/query?where=parcel_number+%3D+%27${encodeURI(location.data.properties.parcelno)}%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=`;
      return fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
        resolve({"id": location.data.properties.parcelno, "type": "registration", "data": data});
      });
    });
    let certified = new Promise((resolve, reject) => {
      let url = `https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Residential_Inspections_(combined)/FeatureServer/0/query?where=result+%3D+%27OK%27+and+parcel_number+%3D+%27${encodeURI(location.data.properties.parcelno)}%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=`;
      return fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
        resolve({"id": location.data.properties.parcelno, "type": "certified", "data": data});
      });
    });
    let occupancy = new Promise((resolve, reject) => {
      let url = `https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Certificate_of_Occupancy_(combined)/FeatureServer/0/query?where=parcel_number+%3D+%27${encodeURI(location.data.properties.parcelno)}%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=`;
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
        if(data.detail == "Not found."){
          let url = `https://gis.detroitmi.gov/arcgis/rest/services/OpenData/Parcels/FeatureServer/0/query?where=parcel_number%3D%27${location.data.properties.parcelno}%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson`;
          return fetch(url)
          .then((resp) => resp.json()) // Transform the data into json
          .then(function(parcel) {
            resolve({"id": location.data.properties.parcelno, "type": "assessors", "data": parcel, "zip": parcel.features[0].attributes.zip_code});
          });
        }else{
          let tempAddr = data.propaddr.split(",");
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
        }
        
      });
    });
    switch (type) {
      case 'parcel':
        Promise.all([registrations, certified, assessors, occupancy]).then(values => {
          // console.log(values);
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
          if(values[1].data.features.length){
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
            tempData.registrationDate = moment(values[0].data.features[0].properties.date).format('MMM Do,YYYY');
          }
          if(values[1].data.features.length){
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
            tempData.registrationDate = moment(values[0].data.features[0].properties.date).format('MMM Do,YYYY');
          }
          if(values[1].data.features.length){
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
