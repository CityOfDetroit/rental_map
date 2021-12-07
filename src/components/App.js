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
            url: 'https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/RentalStatuses/FeatureServer/0',
            pointToLayer: function (geojson, latlng) {
                return L.circleMarker(latlng, {
                    fillColor: '#194ed7',
                    fillOpacity: 1,
                    stroke: false,
                    radius: 5
                });
            }
        }).on('click',function (layer) {
            _app.panel.data = {
                address : `${layer.propagatedFrom.feature.properties.street_num} ${layer.propagatedFrom.feature.properties.street_name}`,
                parcel: layer.propagatedFrom.feature.properties.parcel_id,
                date: moment(layer.propagatedFrom.feature.properties.date_status).format('MMM Do, YYYY'),
                type: layer.propagatedFrom.feature.properties.task
            };
            _app.panel.createPanel(_app.panel);
            _app.queryLayer(_app, layer.latlng);
        }).addTo(_app.map);

        _app.layers['rentalCoC'] = esri.featureLayer({
            url: 'https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/CertificateOfCompliance/FeatureServer/0',
            pointToLayer: function (geojson, latlng) {
                return L.circleMarker(latlng, {
                    fillColor: '#068A24',
                    fillOpacity: 1,
                    stroke: false,
                    radius: 5
                });
            }
        }).on('click',function (layer) {
            _app.panel.data = {
                address : `${layer.propagatedFrom.feature.properties.street_num} ${layer.propagatedFrom.feature.properties.street_name}`,
                parcel: layer.propagatedFrom.feature.properties.parcel_id,
                date: moment(layer.propagatedFrom.feature.properties.date_status).format('MMM Do, YYYY'),
                type: layer.propagatedFrom.feature.properties.task
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
            esri.query({ url:'https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/CertificateOfCompliance/FeatureServer/0'}).where(`parcel_id = '${_app.panel.data.parcel}'`).run(function (error, featureCollection) {
                if (error) {
                  console.log(error);
                  return;
                }
                if(featureCollection.features.length){
                    _app.panel.data.date = moment(featureCollection.features[0].properties.date_status).format('MMM Do, YYYY');
                    _app.panel.data.type = featureCollection.features[0].properties.task;
                    _app.panel.createPanel(_app.panel);
                }else{
                    esri.query({ url:'https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/RentalStatuses/FeatureServer/0'}).where(`parcel_id = '${_app.panel.data.parcel}'`).run(function (error, featureCollection) {
                        if (error) {
                        console.log(error);
                        return;
                        }

                        if(featureCollection.features.length){
                            _app.panel.data.date = moment(featureCollection.features[0].properties.date_status).format('MMM Do, YYYY');
                            _app.panel.data.type = featureCollection.features[0].properties.task;
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