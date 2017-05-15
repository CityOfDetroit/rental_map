// ================ variables ======================
var bounds = [
    [		-83.3437, 	42.2102], // Southwest coordinates
    [		-82.8754, 	42.5197]  // Northeast coordinates
];
var baseMapStyles = [
  'cj2m68vfx001s2rs0nyherr29',
  'cj2m1f9k400132rmr1jhjq2gn'
];
var parcelData = {
  'rental-status'     : null,
  'parcel-data'       : null
};
mapboxgl.accessToken = 'pk.eyJ1Ijoic2x1c2Fyc2tpZGRldHJvaXRtaSIsImEiOiJjaXZsNXlwcXQwYnY5MnlsYml4NTJ2Mno4In0.8wKUnlMPIlxq-eWH0d10-Q';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/slusarskiddetroitmi/' + baseMapStyles[0], //stylesheet location
  center: [-83.1, 42.36], // starting position
  zoom: 11.5 // starting zoom
});
// ================== functions =====================
var switchParcelDataViews = function switchParcelDataViews(e){
  console.log(e.getAttribute('data-view'));
  switch (e.getAttribute('data-view')) {
    case 'owner':
      let tempOwnerData = '';
      tempOwnerData += '<article class="info-items"><span>OWNER CITY</span> ' + parcelData['parcel-data'].ownercity + '</article>';
      tempOwnerData += '<article class="info-items"><span>OWNER NAME</span> ' + parcelData['parcel-data'].ownername1 + '</article>';
      tempOwnerData += '<article class="info-items"><span>OWNER STATE</span> ' + parcelData['parcel-data'].ownerstate + '</article>';
      tempOwnerData += '<article class="info-items"><span>OWNER ADDRESS</span> ' + parcelData['parcel-data'].ownerstreetaddr + '</article>';
      tempOwnerData += '<article class="info-items"><span>OWNER ZIP</span> ' + parcelData['parcel-data'].ownerzip + '</article>';
      document.querySelector('.parcel-info.display-section').innerHTML = tempOwnerData;
      console.log(parcelData['parcel-data']);
      break;
    case 'building':
      let tempBuldingData = '';
      tempBuldingData += '<article class="info-items"><span>PARCEL NUMBER</span> ' + parcelData['parcel-data'].pnum + '</article>';
      tempBuldingData += '<article class="info-items"><span>BASEMENT AREA</span> ' + parcelData['parcel-data'].resb_basementarea + '</article>';
      tempBuldingData += '<article class="info-items"><span>BUILDING CLASS</span> ' + parcelData['parcel-data'].resb_bldgclass + '</article>';
      tempBuldingData += '<article class="info-items"><span>CALCULATED VALUE</span> $' + parseInt(parcelData['parcel-data'].resb_calcvalue).toLocaleString() + '</article>';
      tempBuldingData += '<article class="info-items"><span>EXTERIOR</span> ' + parcelData['parcel-data'].resb_exterior + '</article>';
      tempBuldingData += '<article class="info-items"><span>NUMBER OF FIREPLACES</span> ' + parcelData['parcel-data'].resb_fireplaces + '</article>';
      tempBuldingData += '<article class="info-items"><span>FLOOR AREA</span> ' + parcelData['parcel-data'].resb_floorarea.toLocaleString() + '</article>';
      tempBuldingData += '<article class="info-items"><span>GARAGE AREA</span> ' + parcelData['parcel-data'].resb_garagearea.toLocaleString() + '</article>';
      tempBuldingData += '<article class="info-items"><span>GARAGE TYPE</span> ' + parcelData['parcel-data'].resb_gartype + '</article>';
      tempBuldingData += '<article class="info-items"><span>GROUND AREA</span> ' + parcelData['parcel-data'].resb_groundarea.toLocaleString() + '</article>';
      tempBuldingData += '<article class="info-items"><span>HALF BATHS</span> ' + parcelData['parcel-data'].resb_halfbaths + '</article>';
      tempBuldingData += '<article class="info-items"><span>NUMBER OF BEDROOMS</span> ' + parcelData['parcel-data'].resb_nbed + '</article>';
      document.querySelector('.parcel-info.display-section').innerHTML = tempBuldingData;
      console.log(parcelData['parcel-data']);
      break;
    default:

  }
};
var startGeocoderResults = function startGeocoderResults(ev){
  document.querySelector('.overall-number').innerHTML = '';
  document.querySelector('.parcel-info').innerHTML = '';
  document.querySelector('.info-container > .not-rental').innerHTML = '';
  document.querySelector('.info-container > .rental').innerHTML = '';
  document.querySelector('.info-container > .total-rentals').innerHTML = '';
  console.log(ev.result.geometry);
  map.flyTo({
      center: [ev.result.geometry.coordinates[0], ev.result.geometry.coordinates[1]],
      zoom: 16,
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
  let tempInputList = document.querySelectorAll('.mapboxgl-ctrl-geocoder.mapboxgl-ctrl > input');
  let tempAddr = '';
  for (var i = 0; i < tempInputList.length; i++) {
    if (tempInputList[i].value.split(',')[0] !== '') {
      console.log(tempInputList[i].value.split(',')[0]);
      tempAddr = tempInputList[i].value.split(',')[0];
      tempAddr = tempAddr.split(' ');
      break;
    }else {
      console.log("Empty input");
    }
  }
  let newTempAddr = '';
  let size = tempAddr.length;
  tempAddr.forEach(function(item, index) {
    newTempAddr += item;
    ((index < size) && (index + 1) !== size) ? newTempAddr += '+': 0;
  });
  console.log(newTempAddr);
  //================ get parcel data ==========================
  $.getJSON('http://gis.detroitmi.gov/arcgis/rest/services/DoIT/CompositeGeocoder/GeocodeServer/findAddressCandidates?Street=&City=&ZIP=&SingleLine='+ newTempAddr +'&category=&outFields=User_fld&maxLocations=&outSR=&searchExtent=&location=&distance=&magicKey=&f=pjson' , function( data ) {
    console.log(data.candidates[0].attributes.User_fld);
    map.setFilter("parcel-fill-hover", ["==", "parcelno", data.candidates[0].attributes.User_fld]);
    $.getJSON("https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/Rental_Inspections/FeatureServer/0/query?where="+ encodeURI('ParcelNo=\''+data.candidates[0].attributes.User_fld+'\'')+"&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=pjson&token=", function( Rental_Inspections ) {
      console.log(Rental_Inspections);
      if(Rental_Inspections.features.length){
        document.querySelector('.parcel-info.rental-info').innerHTML = '<article class="info-items"><span>RENTAL STATUS</span> ' + Rental_Inspections.features[0].attributes.ACTION_DESCRIPTION + '</article>';
        document.querySelector('.info-container > .rental').innerHTML = '<a href="https://app.smartsheet.com/b/form?EQBCT=efa41296fdc646dcadc3cbca2d6fd6ac" target="_blank"><article class="form-btn">SUBMIT A RENTER\'S COMPLAINT</article></a>';
        document.querySelector('.info-container > .not-rental').innerHTML = '';
        parcelData['rental-status'] = Rental_Inspections.features[0].attributes.ACTION_DESCRIPTION;
      }else{
        document.querySelector('.parcel-info.rental-info').innerHTML = '<article class="info-items"><span>RENTAL STATUS</span> Not a Rental</article>';
        document.querySelector('.info-container > .not-rental').innerHTML = '<a href="https://app.smartsheet.com/b/form?EQBCT=7b3746bd20a048a5919ae07bd9ed89de" target="_blank"><article class="form-btn">REGISTER MY RENTAL</article></a>';
        parcelData['rental-status'] = 'Not a Rental';
      }
      $.getJSON("http://apis.detroitmi.gov/assessments/parcel/"+data.candidates[0].attributes.User_fld.replace(/\./g,'_')+"/", function( parcel ) {
        console.log(parcel);
        document.querySelector('.info-container > .street-name').innerHTML = parcel.propstreetcombined;
        // parcelData['owner-display'] += '<article class="info-items"><span>OWNER</span> ' + parcel.ownername1 + '</article>';
        // parcelData['building-display'] += '<article class="info-items"><span>BUILDING TYPE</span> ' + parcel.resb_style + '</article>';
        // parcelData['building-display'] += '<article class="info-items"><span>PARCEL NUMBER</span> ' + parcel.pnum + '</article>';
        // parcelData['building-display'] += '<article class="info-items"><span>YEAR BUILT</span> ' + parcel.resb_yearbuilt + '</article>';
        // document.querySelector('.parcel-info').innerHTML = tempParcelDataHTML;
        document.querySelector('.parcel-data.owner').innerHTML = '<div class="data-view-btn" data-view="owner" onclick="switchParcelDataViews(this)">OWNER\'S DATA <span>&#10095;</span></div>';
        document.querySelector('.parcel-data.building').innerHTML = '<div class="data-view-btn" data-view="building" onclick="switchParcelDataViews(this)">BUILDING\'S DATA <span>&#10095;</span></div>';
        parcelData['parcel-data'] = parcel;
      });
    });
    let allGeocoders = document.querySelectorAll('.mapboxgl-ctrl-geocoder input[type="text"]');
    for (var t = 0; t < allGeocoders.length; t++) {
      allGeocoders[t].value = "";
    }
  });
  (document.querySelector('#info').className === 'active') ? 0 : document.querySelector('#info').className = 'active';
};
var toggleBaseMap = function toggleBaseMap(e) {
  console.log(e);
  if(e.target.className !== ''){
    console.log(e.target.className);
    (e.target.className === 'map-view')? map.setStyle('mapbox://styles/slusarskiddetroitmi/' + baseMapStyles[0]) : map.setStyle('mapbox://styles/slusarskiddetroitmi/' + baseMapStyles[1]);
  }else{
    console.log(e.target.parentElement);
    (e.target.parentElement.className === 'map-view')? map.setStyle('mapbox://styles/slusarskiddetroitmi/' + baseMapStyles[0]) : map.setStyle('mapbox://styles/slusarskiddetroitmi/' + baseMapStyles[1]);
  }
};
var closeInfo = function closeInfo() {
  console.log('closing');
  (document.querySelector('#info').className === 'active') ? document.querySelector('#info').className = '' : document.querySelector('#info').className = 'active';
  document.querySelector('.mapboxgl-ctrl-geocoder > input[type="text"]').value = '';
  console.log('going back to city view');
  map.flyTo({
      center: [-83.1, 42.367],
      zoom: 11.5,
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
};
var addDataLayers = function addDataLayers(){
  map.addSource('parcels', {
    type: 'vector',
    url: 'mapbox://slusarskiddetroitmi.cwobdjn0'
  });
  map.addSource('councils', {
    type: 'geojson',
    data: "https://gis.detroitmi.gov/arcgis/rest/services/NeighborhoodsApp/council_district/MapServer/1/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=geojson"
  });
  map.addSource('councils_labels', {
    type: 'geojson',
    data: "https://gis.detroitmi.gov/arcgis/rest/services/NeighborhoodsApp/council_district/MapServer/1/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=geojson"
  });
  map.addSource('neighborhoods', {
    type: 'geojson',
    data: 'https://gis.detroitmi.gov/arcgis/rest/services/NeighborhoodsApp/Neighborhoods/MapServer/1/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=2898&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=geojson'
  });
  map.addSource('neighborhoods-labels', {
    type: 'geojson',
    data: 'http://gis.detroitmi.gov/arcgis/rest/services/NeighborhoodsApp/Neighborhoods/MapServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=2898&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=geojson'
  });
  map.addLayer({
    'id': 'councils_labels',
    'type': 'symbol',
    'source': 'councils_labels', maxzoom: 12,
    'layout': {
      "text-font": ["Mark SC Offc Pro Bold"],
      "text-field": "{name}",
      "symbol-placement": "point",
      "text-size": 22
    },
    'paint': {
      'text-color': 'black'
    }
  });
  map.addLayer({
    "id": "council-borders",
    "type": "line",
    "source": "councils", maxzoom: 12,
    "layout": {},
    "paint": {
      "line-color": "#004b90",
      "line-width": 3
    }
  });
  map.addLayer({
    "id": "council-fill",
    "type": "fill",
    "source": "councils",  maxzoom: 12,
    "layout": {},
    "paint": {
      "fill-color": '#0065c3',
      "fill-opacity": 0
    }
  });
  map.addLayer({
    "id": "council-fill-hover",
    "type": "fill",
    "source": "councils",  maxzoom: 12,
    "layout": {},
    "paint": {
      "fill-color": '#0065c3',
      "fill-opacity": .5
    },
    "filter": ["==", "name", ""]
  });
  map.addLayer({
    "id": "neighborhoods-borders",
    "type": "line",
    "source": "neighborhoods",  minzoom: 12,maxzoom:15.5,
    "layout": {},
    "paint": {
      "line-color": "#004b90",
      "line-width": 3
    }
  });
  map.addLayer({
    "id": "neighborhoods-fill",
    "type": "fill",
    "source": "neighborhoods",  minzoom: 12,maxzoom:15.5,
    "paint":{
      "fill-color": '#fff',
      'fill-opacity': 0
    },
  });
  map.addLayer({
    'id': 'neighborhoods-labels',
    'type': 'symbol',
    'source': 'neighborhoods-labels',
            'minzoom': 12,maxzoom:15.5,
    'layout': {
      "text-font": ["Mark SC Offc Pro Bold"],
      'text-field': '{name}'
    },
    'paint': {
      'text-color': 'black'
    }
  });
  map.addLayer({
      "id": "parcel-fill",
      "type": "fill",
      "source": "parcels", minzoom: 15.5,
      "layout": {
      },
      "paint": {
           "fill-color":"#fff",
           "fill-opacity":0
      },
      'source-layer': 'parcelsgeojson'
   });
   map.addLayer({
      "id": "parcel-line",
      "type": "line",
      "source": "parcels", minzoom: 15.5,
      "layout": {
      },
      "paint": {
           "line-color":"#cbcbcb",
      },
      'source-layer': 'parcelsgeojson'
   });
   map.addLayer({
     "id": "parcel-fill-hover",
     "type": "line",
     "source": "parcels",  minzoom: 15.5,
     "layout": {},
     "paint": {
       "line-color": '#a40040'
     },
     'source-layer': 'parcelsgeojson',
     "filter": ["==", "parcelno", ""]
   });

   $.getJSON("https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/Rental_Inspections/FeatureServer/0/query?where=ACTION_DESCRIPTION%3D%27Issue+City+C+of+C+-++Ord+18-03%27+AND+ParcelNo+IS+NOT+NULL&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=parcelno&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=pjson&token=", function( data ) {
     console.log(data);
     var new_Filter = ["in",'parcelno'];
     for (var i = 0; i < data.features.length; i++) {
       new_Filter.push(data.features[i].attributes.ParcelNo);
     }
     map.addLayer({
      "id": "parcel-fill-cofc",
      "type": "fill",
      "source": "parcels",
      'source-layer': 'parcelsgeojson',
      'filter': new_Filter,
      "paint": {
        "fill-color":"#068A24",
        "fill-opacity":0.5
      }
    });
   });
   $.getJSON("https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/Rental_Inspections/FeatureServer/0/query?where=ACTION_DESCRIPTION%3D%27Issue+Initial+Registration%27+AND+ParcelNo+IS+NOT+NULL&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=parcelno&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=pjson&token=", function( data ) {
     console.log(data);
     var new_Filter = ["in",'parcelno'];
     for (var i = 0; i < data.features.length; i++) {
       new_Filter.push(data.features[i].attributes.ParcelNo);
     }
     map.addLayer({
      "id": "parcel-fill-initial",
      "type": "fill",
      "source": "parcels",
      'source-layer': 'parcelsgeojson',
      'filter': new_Filter,
      "paint": {
        "fill-color":"#114BC7",
        "fill-opacity":0.5
      }
    });
   });
   $.getJSON("https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/Rental_Inspections/FeatureServer/0/query?where=ACTION_DESCRIPTION%3D%27Issue+Renewal+Registration%27+AND+ParcelNo+IS+NOT+NULL&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=parcelno&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=pjson&token=", function( data ) {
     console.log(data);
     var new_Filter = ["in",'parcelno'];
     for (var i = 0; i < data.features.length; i++) {
       new_Filter.push(data.features[i].attributes.ParcelNo);
     }
     map.addLayer({
      "id": "parcel-fill-renewal",
      "type": "fill",
      "source": "parcels",
      'source-layer': 'parcelsgeojson',
      'filter': new_Filter,
      "paint": {
        "fill-color":"#DF5800",
        "fill-opacity":0.5
      }
    });
   });
};
map.on('style.load', function(){
  addDataLayers();
  map.resize();
});
map.on('load', function(window) {
  map.on("mousemove", function(e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: ["council-fill"]
    });
    if (features.length) {
      map.setFilter("council-fill-hover", ["==", "districts", features[0].properties.districts]);
    }else{
      map.setFilter("council-fill-hover", ["==", "districts", ""]);
      features = map.queryRenderedFeatures(e.point, {
        layers: ["neighborhoods-fill"]
      });
      if (!features.length) {
        features = map.queryRenderedFeatures(e.point, {
          layers: ["parcel-fill"]
        });
        // console.log(features);
        // if (features.length) {
        //   map.setFilter("parcel-fill-hover", ["==", "parcelno", features[0].properties.parcelno]);
        // }else{
        //   map.setFilter("parcel-fill-hover", ["==", "parcelno", ""]);
        // }
      }
    }
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
  });
  var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    bbox: [
        -83.3437,42.2102,
        -82.8754, 42.5197
      ]
  });
  map.addControl(geocoder, 'top-left');
  var sideBarGeocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    bbox: [
        -83.3437,42.2102,
        -82.8754, 42.5197
      ]
  });
  document.getElementById('geocoder').appendChild(sideBarGeocoder.onAdd(map));
  let allGeocoders = document.querySelectorAll('.mapboxgl-ctrl-geocoder input[type="text"]');
  for (var i = 0; i < allGeocoders.length; i++) {
    allGeocoders[i].placeholder = "Lookup an address";
  }
  geocoder.on('result', function(ev) {
    startGeocoderResults(ev);
  });
  sideBarGeocoder.on('result', function(ev) {
    startGeocoderResults(ev);
  });
});
map.on('zoom', function() {
  console.log(map.getZoom());
});
document.getElementById('close-emergency-modal-btn').addEventListener('click',closeInfo);
var toggleBaseMapBtns = document.querySelectorAll('#basemap-toggle > article');
for (var i = 0; i < toggleBaseMapBtns.length; i++) {
  toggleBaseMapBtns[i].addEventListener('click',function(e){
    toggleBaseMap(e);
  });
}
