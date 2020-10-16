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
        this.point = null;
        this.map = null;
        this.layers = {};
        this.panel = new Panel(this);
        this.geocoder = new Geocoder('geocoder', this);
        this.initialLoad(this);
    }

    initialLoad(_app){
        _app.map = L.map('map', {
            renderer: L.canvas()
        }).setView([42.36, -83.1], 12);
        
        esri.basemapLayer('Gray', {
            detectRetina: true
        }).addTo(_app.map);

        _app.layers['zipCodes'] = esri.featureLayer({
            url: 'https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/ZipCodes/FeatureServer/0',
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

        fetch(`https://gis.detroitmi.gov/arcgis/rest/services/OpenData/RentalStatuses/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=300000&f=geojson`)
        .then((res) => {
            res.json().then(data => {
                console.log(data);
                L.geoJSON(data, {
                    pointToLayer: function (geojson, latlng) {
                        return L.circleMarker(latlng, {
                            fillColor: '#194ed7',
                            fillOpacity: 1,
                            stroke: false,
                            radius: 5
                        });
                    }
                }).on('click',function (layer) {
                    console.log(layer)
                    // return layer.feature.properties;
                }).addTo(_app.map);
        
                // _app.map.on('click', function (e) {
                //     _app.queryLayer(_app, 'rentalRegistrations',e.latlng);
                // });
            });
        })
        .catch((error) => {
            console.log(error);
        });
    }

    queryLayer(_app, layer, latlng){
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
        _app.layers[layer].query().intersects(latlng).run(function (error, featureCollection, response) {
            if (error) {
              console.log(error);
              return;
            }
            if(_app.point){
                _app.point.clearLayers();
                _app.point = userPoint.addLayer(L.marker(tempLocation,{icon: myIcon}));
            }else{ 
                _app.point = userPoint.addLayer(L.marker(tempLocation,{icon: myIcon}));
            }
            _app.map.flyTo(tempLocation, 15);
            _app.panel.currentProvider = featureCollection.features[0].properties.contractor;
            fetch(`https://apis.detroitmi.gov/waste_schedule/details/${featureCollection.features[0].properties.FID}/year/${_app.year}/month/${_app.month}/`)
            .then((res) => {
                res.json().then(data => {
                    _app.panel.location.lat = tempLocation.lat;
                    _app.panel.location.lng = tempLocation.lng;
                    _app.panel.data = data;
                    if(needAdress){
                        fetch(`https://gis.detroitmi.gov/arcgis/rest/services/DoIT/StreetCenterlineLatLng/GeocodeServer/reverseGeocode?location=${_app.panel.location.lng}%2C+${_app.panel.location.lat}&distance=&outSR=&f=pjson`)
                        .then((res) => {
                            res.json().then(data => {
                                _app.panel.address = data.address.Street;
                                _app.panel.createPanel(_app.panel);
                            });
                        }).catch((error) => {
                            console.log(error);
                        });
                    }else{
                        _app.panel.createPanel(_app.panel);
                    }
                });
            })
            .catch((error) => {
                console.log(error);
            });
        });
    }

    checkParcelValid(parcel){
        return /\d/.test(parcel);
    }
}