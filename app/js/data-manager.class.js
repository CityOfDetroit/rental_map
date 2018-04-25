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
    controller.activeAreas.forEach(function(zip){
      let socrataPolygon = WKT.convert(zip.geometry);
      let registrations = new Promise((resolve, reject) => {
        let url = `https://data.detroitmi.gov/resource/vphr-kg52.geojson?$query=SELECT * WHERE within_polygon(location, '${socrataPolygon}') AND csa_date3 > '${controller.defaultSettings.startDate}'`;
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
  buildTempData(location, controller){
    let dataObj = {title: location.address};
    let simplePolygon = null;
    // -------------------------------------------------------------------------
    // NOTE: Fetching temp data.
    // -------------------------------------------------------------------------
    let council = new Promise((resolve, reject) => {
      let url = "https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/Council_Districts/FeatureServer/0/query?where=&objectIds=&time=&geometry=" + location.location.x + "%2C" + location.location.y + "&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=name&returnGeometry=false&returnCentroid=false&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=json&token=";
      return fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
        let councilInfo = {"id": "council", "data": null};
        switch (data.features[0].attributes.Name) {
          case "District 1":
            councilInfo.data = controller.dataManager.currentGovOfficials.d1;
            break;
          case "District 2":
            councilInfo.data = controller.dataManager.currentGovOfficials.d2;
            break;
          case "District 3":
            councilInfo.data = controller.dataManager.currentGovOfficials.d3;
            break;
          case "District 4":
            councilInfo.data = controller.dataManager.currentGovOfficials.d4;
            break;
          case "District 5":
            councilInfo.data = controller.dataManager.currentGovOfficials.d5;
            break;
          case "District 6":
            councilInfo.data = controller.dataManager.currentGovOfficials.d6;
            break;
          case "District 7":
            councilInfo.data = controller.dataManager.currentGovOfficials.d7;
            break;
          default:

        }
        resolve(councilInfo);
      });
    });
    let neighborhoods = new Promise((resolve, reject) => {
      let url = "https://gis.detroitmi.gov/arcgis/rest/services/DoIT/Neighborhoods17/MapServer/1/query?where=&text=&objectIds=&time=&geometry=+" + location.location.x + "%2C" + location.location.y + "+&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=&returnGeometry=false&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=json";
      return fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
        resolve({"id": "neighborhood", "data": data});
      });
    });
    let assessorsData = new Promise((resolve, reject) => {
      let url = "https://apis.detroitmi.gov/assessments/parcel/" + location.attributes.User_fld + "/";
      return fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
        resolve({"id": "assessors-data", "data": data});
      });
    });
    let permitData = new Promise((resolve, reject) => {
      let url = "https://data.detroitmi.gov/resource/but4-ky7y.json?$query=SELECT * WHERE parcel_no='" + location.attributes.User_fld + "' ORDER BY permit_issued DESC LIMIT 2";
      return fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
        resolve({"id": "permit-data", "data": data});
      });
    });
    let blightData = new Promise((resolve, reject) => {
      let url = "https://data.detroitmi.gov/resource/s7hj-n86v.json?$query=SELECT * WHERE parcelno='" + location.attributes.User_fld + "' ORDER BY violation_date DESC LIMIT 2";
      return fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
        resolve({"id": "blight-data", "data": data});
      });
    });
    let salesHistoryData = new Promise((resolve, reject) => {
      let url = "https://data.detroitmi.gov/resource/9xku-658c.json?$query=SELECT * WHERE parcel_no='" + location.attributes.User_fld + "' ORDER BY sale_date DESC LIMIT 2";
      return fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
        resolve({"id": "sales-data", "data": data});
      });
    });
    let demosData = new Promise((resolve, reject) => {
      let point = turf.point([location.location.x, location.location.y]);
      let buffer = turf.buffer(point, 1, {units: 'miles'});
      let simplePolygon = turf.simplify(buffer.geometry, {tolerance: 0.005, highQuality: false});
      let socrataPolygon = WKT.convert(simplePolygon);
      let url = "https://data.detroitmi.gov/resource/nfx3-ihbp.json?$query=SELECT * WHERE demolish_by_date between '" + controller.defaultSettings.startDate + "' AND '" + controller.defaultSettings.endDate + "' AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ") ORDER BY demolish_by_date ASC LIMIT 3";
      return fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
        resolve({"id": "demos-data", "data": data});
      });
    });
    let pSchools = new Promise((resolve, reject) => {
      let point = turf.point([location.location.x, location.location.y]);
      let buffer = turf.buffer(point, 1, {units: 'miles'});
      let simplePolygon = turf.simplify(buffer.geometry, {tolerance: 0.005, highQuality: false});
      let arcsimplePolygon = arcGIS.convert(simplePolygon);
      let url = "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Schools2017/FeatureServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry="+ encodeURI(JSON.stringify(arcsimplePolygon))+"&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=json";
      return fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
        resolve({"id" : "schools", "data": data});
      });
    });
    let npo = new Promise((resolve, reject) => {
      let url = "https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/Neighborhood_Police_Officers/FeatureServer/0/query?where=&objectIds=&time=&geometry=" + location.location.x + "%2C" + location.location.y + "&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=json&token=";
      return fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
        resolve({"id" : "npo", "data": data});
      });
    });
    let improveDet = new Promise((resolve, reject) => {
      let point = turf.point([location.location.x, location.location.y]);
      let buffer = turf.buffer(point, 300, {units: 'meters'});
      let simplePolygon = turf.simplify(buffer.geometry, {tolerance: 0.005, highQuality: false});
      let socrataPolygon = WKT.convert(simplePolygon);
      let url = "https://data.detroitmi.gov/resource/a9kb-mhiu.json?$query=SELECT * WHERE status NOT IN ('Closed','Archived')  AND within_polygon(location,"+ JSON.stringify(socrataPolygon) + ") LIMIT 3";
      return fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
        resolve({"id": "improve-det", "data": data});
      });
    });
    let recycling = new Promise((resolve, reject) => {
      let url = "https://gis.detroitmi.gov/arcgis/rest/services/DPW/All_Services/MapServer/0/query?where=&text=&objectIds=&time=&geometry=" + location.location.x + "%2C+" + location.location.y + "&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=json";
      fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function(data) {
        let todaysMonth =  moment().month() + 1;
        let todaysYear = moment().year();
        let url = null;
        (data.features.length > 1) ? url = 'https://apis.detroitmi.gov/waste_schedule/details/' + data.features[0].attributes.FID + ',' + data.features[1].attributes.FID + ',' + data.features[2].attributes.FID + '/year/' + todaysYear + '/month/' + todaysMonth + '/' : url = 'https://apis.detroitmi.gov/waste_schedule/details/' + data.features[0].attributes.FID  + '/year/' + todaysYear + '/month/' + todaysMonth + '/';
        return fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          resolve({"id": "recycling", "data": data});
        });
      });
    });

    Promise.all([council,neighborhoods,assessorsData,permitData,blightData,salesHistoryData,demosData,npo,improveDet,recycling]).then(values => {
        let dataSets = [];
        let initalLoadInfo = {};
        let initialLoadChecker = true;
        values.forEach(function(value) {
          if(value != null) {
            dataSets.push(value);
            initalLoadInfo[value.id] = value.data;
          }else{
            initialLoadChecker = false;
          }
        });
        dataObj.dataSets = dataSets;
        controller.panel.creatPanel(dataObj, controller);
    }).catch(reason => {
      console.log(reason);
    });
  }
}
