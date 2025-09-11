import * as esri from 'esri-leaflet';
import * as L from 'leaflet';
import moment from 'moment';
import Panel from './Panel';
import Geocoder from './Geocoder';
import './App.scss';
import '../../node_modules/leaflet/dist/leaflet.css';

export default class App {
    constructor() {
        this.month = moment().month() + 1;
        this.year = moment().year();
        this.lastUpdated = null;
        this.point = null;
        this.map = null;
        this.layers = {};
        this.panel = new Panel(this);
        this.geocoder = new Geocoder('geocoder', this);
        this.initialLoad(this);
    }

    initialLoad(_app){
        document.getElementById('close-welcome').addEventListener('click', ()=>{
            document.getElementById('welcome-panel').className = '';
        });
        _app.map = L.map('map', {
            renderer: L.canvas()
        }).setView([42.36, -83.1], 12);
        
        esri.basemapLayer('Topographic', {
            detectRetina: true
        }).addTo(_app.map);

        _app.map.createPane('reg').style.zIndex=600;
        _app.map.createPane('coc').style.zIndex=650;

        _app.layers['zipCodes'] = esri.featureLayer({
            url: 'https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/ZipCodes/FeatureServer/0',
            interactive:false,
            style: {
              color : '#004445',
              fill: false  
            }
        }).addTo(_app.map);

        let labels = {};
        _app.layers['zipCodes'].on('createfeature', function (e) {
            let id = e.feature.id;
            let feature = _app.layers['zipCodes'].getFeature(id);
            let center = feature.getBounds().getCenter();
            let label = L.marker(center, {
              icon: L.divIcon({
                iconSize: null,
                className: 'label',
                html: '<div>' + e.feature.properties.zipcode + '</div>'
              })
            }).addTo(_app.map);
            labels[id] = label;
        });
    
        _app.layers['zipCodes'].on('addfeature', function (e) {
            let label = labels[e.feature.id];
            if (label) {
                label.addTo(_app.map);
            }
        });
    
        _app.layers['zipCodes'].on('removefeature', function (e) {
            let label = labels[e.feature.id];
            if (label) {
                _app.map.removeLayer(label);
            }
        });

        _app.layers['rentalRegistrations'] = esri.featureLayer({
            url: 'https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/bseed_building_rental_compliance/FeatureServer/0',
            pointToLayer: function (geojson, latlng) {
                return L.circleMarker(latlng, {
                    pane: 'reg',
                    fillColor: '#194ed7',
                    fillOpacity: 1,
                    stroke: false,
                    radius: 5
                });
            },
            where: "has_rental_registration='True' AND has_residential_cofc='False'"
        }).on('click',function (layer) {
            _app.panel.data = {
                address : layer.propagatedFrom.feature.properties.rental_registration_addresses,
                parcel: layer.propagatedFrom.feature.properties.parcel_id,
                type: layer.propagatedFrom.feature.properties.task,
                addressID: layer.propagatedFrom.feature.properties.address_id,
                buildingID: layer.propagatedFrom.feature.properties.building_id,
                record: layer.propagatedFrom.feature.properties.rental_registration_records,
                recordAddress: layer.propagatedFrom.feature.properties.rental_registration_addresses
            };
            _app.panel.createPanel(_app.panel);
            _app.queryLayer(_app, layer.latlng);
        }).addTo(_app.map);

        _app.layers['rentalCoC'] = esri.featureLayer({
            url: 'https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/bseed_building_rental_compliance/FeatureServer/0',
            pointToLayer: function (geojson, latlng) {
                return L.circleMarker(latlng, {
                    pane: 'coc',
                    fillColor: '#068A24',
                    fillOpacity: 1,
                    stroke: false,
                    radius: 5
                });
            },
            where: "has_residential_cofc='True'"
        }).on('click',function (layer) {
            _app.panel.data = {
                address : layer.propagatedFrom.feature.properties.residential_cofc_addresses,
                parcel: layer.propagatedFrom.feature.properties.parcel_id,
                type: layer.propagatedFrom.feature.properties.task,
                addressID: layer.propagatedFrom.feature.properties.address_id,
                buildingID: layer.propagatedFrom.feature.properties.building_id,
                record: layer.propagatedFrom.feature.properties.residential_cofc_records,
                recordAddress: layer.propagatedFrom.feature.properties.residential_cofc_addresses
            };
            _app.panel.createPanel(_app.panel);
            _app.queryLayer(_app, layer.latlng);
        }).addTo(_app.map);
    }



    queryLayer(_app, latlng){
        let needAdress = false;
        let myIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            iconSize: [25, 35],
            iconAnchor: [25, 35],
            popupAnchor: [-3, -76],
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            shadowSize: [68, 95],
            shadowAnchor: [22, 94]
        });
        let tempLocation = null;
        if(latlng.geometry){
            tempLocation = {lat: latlng.geometry.coordinates[1],lng:  latlng.geometry.coordinates[0]};            
        }else{
            needAdress = true;
            tempLocation = latlng;
        }
        let userPoint = L.layerGroup().addTo(_app.map);
        if(_app.point){
            _app.point.clearLayers();
            _app.point = userPoint.addLayer(L.marker(tempLocation,{icon: myIcon}));
        }else{ 
            _app.point = userPoint.addLayer(L.marker(tempLocation,{icon: myIcon}));
        }
        _app.map.flyTo(tempLocation, 18);
        if(_app.panel.data.type == null){
            esri.query({ url:'https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/bseed_building_rental_compliance/FeatureServer/0'}).where(`parcel_id = '${_app.panel.data.parcel}' AND has_residential_cofc='True'`).run(function (error, cocs) {
                if (error) {
                  console.log(error);
                  return;
                }
                if(cocs.features.length){
                    console.log(cocs.features);
                    if(cocs.features.length > 1){
                         esri.query({ url:'https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/bseed_building_rental_compliance/FeatureServer/0'}).where(`building_id = '${_app.panel.data.buildingID}' AND has_residential_cofc='True'`).run(function (error, multiCOC) {
                            if (error) {
                            console.log(error);
                            return;
                            }
                            console.log(multiCOC);
                            if(multiCOC.features.length){
                                _app.panel.data.recordAddress = multiCOC.features[0].properties.residential_cofc_addresses
                                _app.panel.data.record = multiCOC.features[0].properties.residential_cofc_records
                                _app.panel.data.type = 'Issue CofC';
                                _app.panel.createPanel(_app.panel);
                            }else{
 esri.query({ url:'https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/bseed_building_rental_compliance/FeatureServer/0'}).where(`parcel_id = '${_app.panel.data.parcel}' AND has_rental_registration='True' AND has_residential_cofc='False'`).run(function (error, registration) {
                    if (error) {
                        console.log(error);
                        return;
                    }
                    if(registration.features.length){
                        if(registration.features.length > 1){
                             esri.query({ url:'https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/bseed_building_rental_compliance/FeatureServer/0'}).where(`building_id = '${_app.panel.data.buildingID}' AND has_rental_registration='True' AND has_residential_cofc='False'`).run(function (error, multiRegistration) {
                                if (error) {
                                console.log(error);
                                return;
                                }
                                _app.panel.data.recordAddress = multiRegistration.features[0].properties.rental_registration_addresses
                                _app.panel.data.record = multiRegistration.features[0].properties.rental_registration_records
                                _app.panel.data.type = 'Issue Registration';
                                _app.panel.createPanel(_app.panel);
                            });
                        }else{
                            _app.panel.data.recordAddress = registration.features[0].properties.rental_registration_addresses
                            _app.panel.data.record = registration.features[0].properties.rental_registration_records
                            _app.panel.data.type = 'Issue Registration';
                            _app.panel.createPanel(_app.panel);
                        }
                    }else{
                        _app.panel.data.type = null;
                    }
                    _app.panel.createPanel(_app.panel);
                    });
                            }
                            
                         });
                    }else{
                        _app.panel.data.recordAddress = cocs.features[0].properties.residential_cofc_addresses
                        _app.panel.data.record = cocs.features[0].properties.residential_cofc_records
                        _app.panel.data.type = 'Issue CofC';
                        _app.panel.createPanel(_app.panel);
                    }
                }else{
                    esri.query({ url:'https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/bseed_building_rental_compliance/FeatureServer/0'}).where(`parcel_id = '${_app.panel.data.parcel}' AND has_rental_registration='True' AND has_residential_cofc='False'`).run(function (error, registration) {
                    if (error) {
                        console.log(error);
                        return;
                    }
                    if(registration.features.length){
                        if(registration.features.length > 1){
                             esri.query({ url:'https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/bseed_building_rental_compliance/FeatureServer/0'}).where(`building_id = '${_app.panel.data.buildingID}' AND has_rental_registration='True' AND has_residential_cofc='False'`).run(function (error, multiRegistration) {
                                if (error) {
                                console.log(error);
                                return;
                                }
                                _app.panel.data.recordAddress = multiRegistration.features[0].properties.rental_registration_addresses
                                _app.panel.data.record = multiRegistration.features[0].properties.rental_registration_records
                                _app.panel.data.type = 'Issue Registration';
                                _app.panel.createPanel(_app.panel);
                            });
                        }else{
                            _app.panel.data.recordAddress = registration.features[0].properties.rental_registration_addresses
                            _app.panel.data.record = registration.features[0].properties.rental_registration_records
                            _app.panel.data.type = 'Issue Registration';
                            _app.panel.createPanel(_app.panel);
                        }
                    }else{
                        _app.panel.data.type = null;
                    }
                    _app.panel.createPanel(_app.panel);
                    });
                }
            });
        }
    }

    checkParcelValid(parcel){
        return /\d/.test(parcel);
    }
}