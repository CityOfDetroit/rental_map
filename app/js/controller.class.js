'use strict';
import Map from './map.class.js';
import Panel from './panel.class.js';
import DataManager from './data-manager.class.js';
import mapboxgl from 'mapbox-gl';
const turf = require('@turf/turf');
const moment = require('moment');
export default class Controller {
  constructor(map, zipcodes) {
    this.parcelData = null;
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
    let url = `https://gis.detroitmi.gov/arcgis/rest/services/DoIT/MetroZipCodes/MapServer/0/query?where=ZCTA5CE10+in+%28${queryStr}%29&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=`;
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
            "name": controller.activeAreas.features[i].properties.ZCTA5CE10
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
    // console.log(layerID);
    // console.log(layer);
    controller.panel.clearPanel();
    switch (layer.layer.id) {
      case 'parcel-fill':
        // console.log('parcel');
        controller.map.map.setFilter("parcel-fill-selected", ["==", "parcelno", layer.properties.parcelno]);
        let url = `
        https://gis.detroitmi.gov/arcgis/rest/services/DoIT/MetroZipCodes/MapServer/0/query?where=&text=&objectIds=&time=&geometry=${ev.lngLat.lng}%2C+${ev.lngLat.lat}%0D%0A&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=ZCTA5CE10&returnGeometry=false&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=json`;
        fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          // console.log(data);
          if(controller.defaultSettings.zipcodes.includes(data.features[0].attributes.ZCTA5CE10)){
            controller.dataManager.buildTempData('parcel', {active: true, data: layer}, controller);
          }else {
            controller.dataManager.buildTempData('parcel', {active: false, data: layer}, controller);
          }
        });
        break;
      case 'rental-parcels':
        controller.dataManager.buildTempData('rental-parcel', {active: true, data: layer}, controller);
        break;
      default:
        // console.log('rental');
        // console.log(layer);
        if(layer.properties.parcelnum != undefined){
          controller.map.map.setFilter("parcel-fill-selected", ["==", "parcelno", layer.properties.parcelnum]);
          controller.dataManager.buildTempData('parcel', {active: true, data: {properties:{parcelno: layer.properties.parcelnum}}}, controller);
          // let url = `https://apis.detroitmi.gov/assessments/parcel/${layer.properties.parcelnum}/`;
          // fetch(url)
          // .then((resp) => resp.json()) // Transform the data into json
          // .then(function(data) {
          //   console.log(data);
          //   controller.parcelData = data;
          //   let tempParam = {data: layer, zip: null};
          //   let tempAddr = data.propstreetcombined.split(",");
          //   tempAddr = tempAddr[0];
          //   tempAddr = tempAddr.split(" ");
          //   let newTempAddr = '';
          //   let size = tempAddr.length;
          //   tempAddr.forEach(function(item, index) {
          //     newTempAddr += item;
          //     ((index < size) && (index + 1) !== size) ? newTempAddr += '+': 0;
          //   });
          //   let url = `https://gis.detroitmi.gov/arcgis/rest/services/DoIT/CompositeGeocoder/GeocodeServer/findAddressCandidates?Street=&City=&ZIP=&SingleLine=${tempAddr}&category=&outFields=ZIP&maxLocations=&outSR=&searchExtent=&location=&distance=&magicKey=&f=json`;
          //   fetch(url)
          //   .then((resp) => resp.json()) // Transform the data into json
          //   .then(function(zip) {
          //     tempParam.zip = zip.candidates[0].attributes.ZIP;
          //     let url = `https://data.detroitmi.gov/resource/baxk-dxw9.json?$where=parcelnum = '${encodeURI(layer.properties.parcelnum)}'`;
          //     fetch(url)
          //     .then((resp) => resp.json()) // Transform the data into json
          //     .then(function(data) {
          //       console.log(data);
          //       if(data.length){
          //         controller.panel.creatPanel('rental', controller, tempParam, true, true);
          //       }else{
          //         controller.panel.creatPanel('rental', controller, tempParam, true);
          //       }
          //     });
          //   });
          // });
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
  switchParcelDataViews(e, controller){
    // console.log(e);
    switch (e.target.attributes[1].value) {
      case 'owner':
        var tempOwnerData = '';
        tempOwnerData += '<article class="info-items"><span>OWNER CITY</span> ' + controller.parcelData.ownercity + '</article>';
        tempOwnerData += '<article class="info-items"><span>OWNER NAME</span> ' + controller.parcelData.ownername1 + '</article>';
        tempOwnerData += '<article class="info-items"><span>OWNER STATE</span> ' + controller.parcelData.ownerstate + '</article>';
        tempOwnerData += '<article class="info-items"><span>OWNER ADDRESS</span> ' + controller.parcelData.ownerstreetaddr + '</article>';
        tempOwnerData += '<article class="info-items"><span>OWNER ZIP</span> ' + controller.parcelData.ownerzip + '</article>';
        document.querySelector('.parcel-info.display-section').innerHTML = tempOwnerData;
        //cons.log(controller.parcelData);
        break;
      case 'building':
        var tempBuldingData = '';
        tempBuldingData += '<article class="info-items"><span>PARCEL NUMBER</span> ' + controller.parcelData.pnum + '</article>';
        if(controller.parcelData.resb_calcvalue !== 0){
          tempBuldingData += '<article class="info-items"><span>BASEMENT AREA</span> ' + controller.parcelData.resb_basementarea + '</article>';
          tempBuldingData += '<article class="info-items"><span>BUILDING CLASS</span> ' + controller.parcelData.resb_bldgclass + '</article>';
          tempBuldingData += '<article class="info-items"><span>CALCULATED VALUE</span> $' + parseInt(controller.parcelData.resb_calcvalue).toLocaleString() + '</article>';
          tempBuldingData += '<article class="info-items"><span>EXTERIOR</span> ' + controller.parcelData.resb_exterior + '</article>';
          tempBuldingData += '<article class="info-items"><span>NUMBER OF FIREPLACES</span> ' + controller.parcelData.resb_fireplaces + '</article>';
          tempBuldingData += '<article class="info-items"><span>FLOOR AREA</span> ' + controller.parcelData.resb_floorarea.toLocaleString() + '</article>';
          tempBuldingData += '<article class="info-items"><span>GARAGE AREA</span> ' + controller.parcelData.resb_garagearea.toLocaleString() + '</article>';
          tempBuldingData += '<article class="info-items"><span>GARAGE TYPE</span> ' + controller.parcelData.resb_gartype + '</article>';
          tempBuldingData += '<article class="info-items"><span>GROUND AREA</span> ' + controller.parcelData.resb_groundarea.toLocaleString() + '</article>';
          tempBuldingData += '<article class="info-items"><span>HALF BATHS</span> ' + controller.parcelData.resb_halfbaths + '</article>';
          tempBuldingData += '<article class="info-items"><span>NUMBER OF BEDROOMS</span> ' + controller.parcelData.resb_nbed + '</article>';
          tempBuldingData += '<article class="info-items"><span>YEAR BUILD</span> ' + controller.parcelData.resb_yearbuilt + '</article>';
        }else{
          tempBuldingData += '<article class="info-items"><span>BUILDING CLASS</span> ' + controller.parcelData.cib_bldgclass + '</article>';
          tempBuldingData += '<article class="info-items"><span>CALCULATED VALUE</span> $' + parseInt(controller.parcelData.cib_calcvalue).toLocaleString() + '</article>';
          tempBuldingData += '<article class="info-items"><span>FLOOR AREA</span> ' + controller.parcelData.cib_floorarea.toLocaleString() + '</article>';
          tempBuldingData += '<article class="info-items"><span>COMMERCIAL OCCUPANT</span> ' + controller.parcelData.cib_occ + '</article>';
          tempBuldingData += '<article class="info-items"><span>COMMERCIAL FLOOR PRICE</span> $' + controller.parcelData.cib_pricefloor.toLocaleString() + '</article>';
          tempBuldingData += '<article class="info-items"><span>NUMBER OF STORIES</span> ' + controller.parcelData.cib_stories + '</article>';
          tempBuldingData += '<article class="info-items"><span>YEAR BUILD</span> ' + controller.parcelData.cib_yearbuilt + '</article>';
        }
        document.querySelector('.parcel-info.display-section').innerHTML = tempBuldingData;
        //cons.log(controller.parcelData);
        break;
      default:

    }
  }
  loadSuggestedAddr(e, controller){
    // console.log(e);
    let tempArr = e.target.innerHTML.split(' ');
    let addr = '';
    for (let i = 0; i < tempArr.length; i++) {
      addr += tempArr[i];
      ((i < tempArr.length) && (i + 1) !== tempArr.length) ? addr += '+': 0;
    }
    // console.log(addr);
    let ev = {'result':{'geometry':{'coordinates':[e.target.attributes[1], e.target.attributes[2]]},'place_name': `${e.target.innerHTML},`}};
    controller.starGeocoder(ev, controller);
  }
  starGeocoder(e, controller){
    let tempAddr = e.result.place_name.split(",");
    tempAddr = tempAddr[0];
    tempAddr = tempAddr.split(" ");
    let newTempAddr = '';
    let size = tempAddr.length;
    tempAddr.forEach(function(item, index) {
      newTempAddr += item;
      ((index < size) && (index + 1) !== size) ? newTempAddr += '+': 0;
    });
    let url = "https://gis.detroitmi.gov/arcgis/rest/services/DoIT/CompositeGeocoder/GeocodeServer/findAddressCandidates?Street=&City=&ZIP=&SingleLine=" + newTempAddr + "&category=&outFields=User_fld&maxLocations=&outSR=4326&searchExtent=&location=&distance=&magicKey=&f=json";
    fetch(url)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) {
      // console.log(data);
      if(data.candidates.length){
        if(data.candidates[0].attributes.User_fld != ""){
          // console.log('parcel found');
          controller.map.map.setFilter("parcel-fill-selected", ["==", "parcelno", data.candidates[0].attributes.User_fld]);
          controller.dataManager.buildTempData('parcel',{data:{properties:{parcelno: data.candidates[0].attributes.User_fld}}}, controller);
          controller.panel.clearPanel();
        }else{
          let url = `https://gis.detroitmi.gov/arcgis/rest/services/DoIT/CompositeGeocoder/GeocodeServer/reverseGeocode?location=%7B%22x%22%3A+${e.result.geometry.coordinates[0]}%2C%22y%22%3A+${e.result.geometry.coordinates[1]}%2C%22spatialReference%22%3A+%7B%22wkid%22%3A+4326%7D%7D&distance=&langCode=&outSR=4326&returnIntersection=false&f=json`;
          fetch(url)
          .then((resp) => resp.json()) // Transform the data into json
          .then(function(data) {
            // console.log(data);
            var displaySearchAddr = '';
            var splitAddr = addr.split('+');
            for (var i = 0; i < splitAddr.length; i++) {
              displaySearchAddr += splitAddr[i] + ' ';
            }
            document.querySelector('.info-container > .street-name').innerHTML = displaySearchAddr;
            document.querySelector('.parcel-info.rental-info').innerHTML = '<article class="info-items"><span>SEARCH STATUS</span> NO DATA FOUND<br><br>Did you mean?<br><initial><i id="suggested-addr"  data-lng="'+e.result.geometry.coordinates[0]+'" data-lat="'+e.result.geometry.coordinates[1]+'">'+ data.address.Street +'</i></initial></article>';

            document.getElementById('suggested-addr').addEventListener('click', function(e){
              controller.loadSuggestedAddr(e, controller);
            });
          });
        }
      }else{
        // console.log("no parcel found");
        let url = `https://gis.detroitmi.gov/arcgis/rest/services/DoIT/CompositeGeocoder/GeocodeServer/reverseGeocode?location=%7B%22x%22%3A+${e.result.geometry.coordinates[0]}%2C%22y%22%3A+${e.result.geometry.coordinates[1]}%2C%22spatialReference%22%3A+%7B%22wkid%22%3A+4326%7D%7D&distance=&langCode=&outSR=4326&returnIntersection=false&f=json`;
        fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
          let displaySearchAddr = '';
          let splitAddr = newTempAddr.split('+');
          for (let i = 0; i < splitAddr.length; i++) {
            displaySearchAddr += splitAddr[i] + ' ';
          }
          controller.panel.suggestedAddress({old: displaySearchAddr, lng: e.result.geometry.coordinates[0], lat: e.result.geometry.coordinates[1], new: data.address.Street}, controller);
        });
      }
    });
  }
  geocoderResults(e, controller){
    controller.starGeocoder(e, controller);
  }
  closeAlert(ev){
    (ev.target.parentNode.parentNode.id === 'alert-overlay') ? document.getElementById('alert-overlay').className = '': document.getElementById('drill-down-overlay').className = '';
  }
}
