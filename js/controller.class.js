'use strict';
import Map from './map.class.js';
import Panel from './panel.class.js';
import DataManager from './data-manager.class.js';
const turf = require('@turf/turf');
export default class Controller {
  constructor(map, zipcodes, escrows) {
    this.parcelData = null;
    this.activeAreas = null;
    this.activeFilter = [];
    this.userSources = {
      rental: null,
      cert: null,
      occupied: null
    };
    this.activeRentalParcels = ["in", "parcelno"];
    this.activeCertParcels = ["in", "parcelno"];
    this.activeOccupParcels = ["in", "parcelno"];
    this.defaultSettings = {
      zipcodes: zipcodes,
      escrows: escrows,
      activeLayers: ['parcel-fill', 'rental', 'cert', 'occupied']
    };
    this.panel = new Panel();
    this.dataManager = new DataManager();
    this.map = new Map(map, this);
    this.initialLoad(this);
  }

  initialLoad(controller) {

    document.getElementById('initial-loader-overlay').className = 'active';
    let url = `https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/ZipCodes/FeatureServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=zipcode&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=geojson`;
    fetch(url)
      .then((resp) => resp.json())
      .then((data) => {
        controller.activeAreas = data;
        controller.defaultSettings.startDate = '2017-12-31';
        controller.dataManager.buildData('initial', controller);
      });
  }
  createZipcodesLayers(controller) {
    let sources = [{
      "id": "zip-borders",
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
      var tempPolygon = turf.polygon(controller.activeAreas.features[i].geometry.coordinates);
      var tempCenter = turf.centroid(tempPolygon);
      var tempFeature = {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": tempCenter.geometry.coordinates
        },
        "properties": {
          "name": controller.activeAreas.features[i].properties.zipcode
        }
      };
      zipLabes.features.push(tempFeature);
    }
    // console.log(zipLabes);
    let zipLabesSource = [{
      "id": "zip-codes-labels",
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

  createRentalsLayer(controller) {
    let tempNewLayers = [];
      // console.log(controller.dataManager.initialDataBank);
      controller.dataManager.initialDataBank.rentals.features.forEach(function (parcel) {
        if (typeof parcel.properties.parcel_id !== undefined && parcel.properties.parcel_id !== null)
          controller.activeRentalParcels.push(parcel.properties.parcel_id);
      });
      
      controller.dataManager.initialDataBank.certificates.features.forEach(function (parcel) {
        if (typeof parcel.properties.parcel_id !== undefined && parcel.properties.parcel_id !== null)
          controller.activeCertParcels.push(parcel.properties.parcel_id);
      });
      controller.dataManager.initialDataBank.occupancy.features.forEach(function (parcel) {
        if (typeof parcel.properties.parcel_id !== undefined && parcel.properties.parcel_id !== null)
          controller.activeOccupParcels.push(parcel.properties.parcel_id);
      });
    controller.map.map.getSource('rental').setData(controller.dataManager.initialDataBank.rentals);
    // controller.map.map.getSource('occupied').setData(controller.dataManager.initialDataBank.occupancy);
    controller.map.map.getSource('cert').setData(controller.dataManager.initialDataBank.certificates);

    controller.map.map.setFilter('rental-parcels', controller.activeRentalParcels);
    controller.map.map.setFilter('cert-parcels', controller.activeCertParcels);
    // controller.map.map.setFilter('occup-parcels', controller.activeOccupParcels);

    controller.map.addLayers(tempNewLayers, controller);
    controller.createZipcodesLayers(controller);
    document.getElementById('initial-loader-overlay').className = '';
  }

  checkLayerType(ev, layerID, layer, controller) {
    controller.panel.clearPanel();
    switch (layer.layer.id) {
      case 'parcel-fill':
        controller.map.map.setFilter("parcel-fill-selected", ["==", "parcelno", layer.properties.parcelno]);
        let url = `
        https://gis.detroitmi.gov/arcgis/rest/services/DoIT/MetroZipCodes/MapServer/0/query?where=&text=&objectIds=&time=&geometry=${ev.lngLat.lng}%2C+${ev.lngLat.lat}%0D%0A&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=ZCTA5CE10&returnGeometry=false&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=json`;
        fetch(url)
          .then((resp) => resp.json()) // Transform the data into json
          .then(function (data) {
            if (controller.defaultSettings.zipcodes.includes(data.features[0].attributes.ZCTA5CE10)) {
              controller.dataManager.buildTempData('parcel', {
                active: true,
                data: layer
              }, controller);
            } else {
              controller.dataManager.buildTempData('parcel', {
                active: false,
                data: layer
              }, controller);
            }
          });
        break;
      case 'rental-parcels':
        controller.dataManager.buildTempData('rental-parcel', {
          active: true,
          data: layer
        }, controller);
        break;
      default:
        if (layer.properties.parcel_id != undefined) {
          controller.map.map.setFilter("parcel-fill-selected", ["==", "parcelno", layer.properties.parcel_id]);
          controller.dataManager.buildTempData('parcel', {
            active: true,
            data: {
              properties: {
                parcelno: layer.properties.parcel_id
              }
            }
          }, controller);
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
  switchParcelDataViews(e, controller) {
    // console.log(e);
    switch (e.target.attributes[1].value) {
      case 'owner':
        document.querySelector('.parcel-info.display-section').innerHTML = `<article class="info-items"><span>OWNER CITY</span> ${controller.parcelData.ownercity ? `${controller.parcelData.ownercity}` : `${controller.parcelData.features[0].attributes.taxpayer_city}`}</article><article class="info-items"><span>OWNER STATE</span> ${controller.parcelData.ownerstate ? `${controller.parcelData.ownerstate}`:`${controller.parcelData.features[0].attributes.taxpayer_state}`}</article><article class="info-items"><span>OWNER ADDRESS</span> ${controller.parcelData.ownerstreetaddr ? `${controller.parcelData.ownerstreetaddr}`:`${controller.parcelData.features[0].attributes.taxpayer_street}`}</article><article class="info-items"><span>OWNER ZIP</span> ${controller.parcelData.ownerzip ? `${controller.parcelData.ownerzip}`:`${controller.parcelData.features[0].attributes.taxpayer_zip}`}</article>`;
        break;
      case 'building':
        let tempBuldingData = '';
        if(controller.parcelData.pnum){
          tempBuldingData += '<article class="info-items"><span>PARCEL NUMBER</span> ' + controller.parcelData.pnum + '</article>';
          if (controller.parcelData.resb_value !== 0) {
            tempBuldingData += '<article class="info-items"><span>BUILDING CLASS</span> ' + controller.parcelData.resb_bldgclass + '</article>';
            tempBuldingData += '<article class="info-items"><span>CALCULATED VALUE</span> $' + parseInt(controller.parcelData.resb_value).toLocaleString() + '</article>';
            tempBuldingData += '<article class="info-items"><span>FLOOR AREA</span> ' + controller.parcelData.resb_floorarea.toLocaleString() + '</article>';
            tempBuldingData += '<article class="info-items"><span>YEAR BUILD</span> ' + controller.parcelData.resb_yearbuilt + '</article>';
          } else {
            tempBuldingData += '<article class="info-items"><span>BUILDING CLASS</span> ' + controller.parcelData.cib_bldgclass + '</article>';
            tempBuldingData += '<article class="info-items"><span>CALCULATED VALUE</span> $' + parseInt(controller.parcelData.cib_calcvalue).toLocaleString() + '</article>';
            tempBuldingData += '<article class="info-items"><span>FLOOR AREA</span> ' + controller.parcelData.cib_floorarea.toLocaleString() + '</article>';
            tempBuldingData += '<article class="info-items"><span>COMMERCIAL OCCUPANT</span> ' + controller.parcelData.cib_occ + '</article>';
            tempBuldingData += '<article class="info-items"><span>COMMERCIAL FLOOR PRICE</span> $' + controller.parcelData.cib_pricefloor.toLocaleString() + '</article>';
            tempBuldingData += '<article class="info-items"><span>NUMBER OF STORIES</span> ' + controller.parcelData.cib_stories + '</article>';
            tempBuldingData += '<article class="info-items"><span>YEAR BUILD</span> ' + controller.parcelData.cib_yearbuilt + '</article>';
          }
        }else{
         tempBuldingData = `
         <article class="info-items"><span>PARCEL NUMBER</span> ${controller.parcelData.features[0].attributes.parcel_id}</article>
         <article class="info-items"><span>BUILDING CLASS</span> ${controller.parcelData.features[0].attributes.property_class_desc}</article>
         <article class="info-items"><span>CALCULATED VALUE</span> $${parseInt(controller.parcelData.features[0].attributes.assessed_value).toLocaleString()}</article>
         <article class="info-items"><span>FLOOR AREA</span> ${controller.parcelData.features[0].attributes.total_floor_area.toLocaleString()}</article>
         <article class="info-items"><span>YEAR BUILD</span> ${controller.parcelData.features[0].attributes.year_built}</article>
         `; 
        }
        document.querySelector('.parcel-info.display-section').innerHTML = tempBuldingData;
        break;
      default:

    }
  }
  loadSuggestedAddr(e, controller) {
    let tempArr = e.target.innerHTML.split(' ');
    let addr = '';
    for (let i = 0; i < tempArr.length; i++) {
      addr += tempArr[i];
      ((i < tempArr.length) && (i + 1) !== tempArr.length) ? addr += '+': 0;
    }
    let ev = {
      'result': {
        'geometry': {
          'coordinates': [e.target.attributes[1], e.target.attributes[2]]
        },
        'place_name': `${e.target.innerHTML},`
      }
    };
    controller.starGeocoder(ev, controller);
  }
  starGeocoder(e, controller) {
    let tempAddr = e.result.place_name.split(",");
    tempAddr = tempAddr[0];
    tempAddr = tempAddr.split(" ");
    let newTempAddr = '';
    let size = tempAddr.length;
    tempAddr.forEach(function (item, index) {
      newTempAddr += item;
      ((index < size) && (index + 1) !== size) ? newTempAddr += '+': 0;
    });
    let url = "https://gis.detroitmi.gov/arcgis/rest/services/DoIT/CompositeGeocoder/GeocodeServer/findAddressCandidates?Street=&City=&ZIP=&SingleLine=" + newTempAddr + "&category=&outFields=User_fld&maxLocations=&outSR=4326&searchExtent=&location=&distance=&magicKey=&f=json";
    fetch(url)
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        if (data.candidates.length) {
          if (data.candidates[0].attributes.User_fld != "") {
            controller.map.map.setFilter("parcel-fill-selected", ["==", "parcelno", data.candidates[0].attributes.User_fld]);
            controller.dataManager.buildTempData('parcel', {
              data: {
                properties: {
                  parcelno: data.candidates[0].attributes.User_fld
                }
              }
            }, controller);
            controller.panel.clearPanel();
          } else {
            let url = `https://gis.detroitmi.gov/arcgis/rest/services/DoIT/CompositeGeocoder/GeocodeServer/reverseGeocode?location=%7B%22x%22%3A+${e.result.geometry.coordinates[0]}%2C%22y%22%3A+${e.result.geometry.coordinates[1]}%2C%22spatialReference%22%3A+%7B%22wkid%22%3A+4326%7D%7D&distance=&langCode=&outSR=4326&returnIntersection=false&f=json`;
            fetch(url)
              .then((resp) => resp.json()) // Transform the data into json
              .then(function (data) {
                console.log(data);
                var displaySearchAddr = '';
                var splitAddr = addr.split('+');
                for (var i = 0; i < splitAddr.length; i++) {
                  displaySearchAddr += splitAddr[i] + ' ';
                }
                document.querySelector('.info-container > .street-name').innerHTML = displaySearchAddr;
                document.querySelector('.parcel-info.rental-info').innerHTML = '<article class="info-items"><span>SEARCH STATUS</span> NO DATA FOUND<br><br>Did you mean?<br><initial><i id="suggested-addr"  data-lng="' + e.result.geometry.coordinates[0] + '" data-lat="' + e.result.geometry.coordinates[1] + '">' + data.address.Street + '</i></initial></article>';

                document.getElementById('suggested-addr').addEventListener('click', function (e) {
                  controller.loadSuggestedAddr(e, controller);
                });
              });
          }
        } else {
          let url = `https://gis.detroitmi.gov/arcgis/rest/services/DoIT/CompositeGeocoder/GeocodeServer/reverseGeocode?location=%7B%22x%22%3A+${e.result.geometry.coordinates[0]}%2C%22y%22%3A+${e.result.geometry.coordinates[1]}%2C%22spatialReference%22%3A+%7B%22wkid%22%3A+4326%7D%7D&distance=&langCode=&outSR=4326&returnIntersection=false&f=json`;
          fetch(url)
            .then((resp) => resp.json()) // Transform the data into json
            .then(function (data) {
              let displaySearchAddr = '';
              let splitAddr = newTempAddr.split('+');
              for (let i = 0; i < splitAddr.length; i++) {
                displaySearchAddr += splitAddr[i] + ' ';
              }
              controller.panel.suggestedAddress({
                old: displaySearchAddr,
                lng: e.result.geometry.coordinates[0],
                lat: e.result.geometry.coordinates[1],
                new: data.address.Street
              }, controller);
            });
        }
      });
  }
  geocoderResults(e, controller) {
    controller.starGeocoder(e, controller);
  }
  closeAlert(ev) {
    (ev.target.parentNode.parentNode.id === 'alert-overlay') ? document.getElementById('alert-overlay').className = '': document.getElementById('drill-down-overlay').className = '';
  }
}
