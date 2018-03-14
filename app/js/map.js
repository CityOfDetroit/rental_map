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
var currentURLParams = {
  'zoom'        : 0,
  'lat'         : 0,
  'lng'         : 0
};
var listOfZipcodes = ['48215','48224'];
var rentalData = null;
var inspectionData = null;
// $.getJSON('https://data.detroitmi.gov/resource/vphr-kg52.geojson?$limit=200000' , function( data ) {
//   rentalData = data;
// });
// $.getJSON('https://data.detroitmi.gov/resource/x3fu-i52p.geojson?$limit=200000' , function( data ) {
//   inspectionData = data;
//   console.log(inspectionData);
// });
mapboxgl.accessToken = 'pk.eyJ1Ijoic2x1c2Fyc2tpZGRldHJvaXRtaSIsImEiOiJjaXZsNXlwcXQwYnY5MnlsYml4NTJ2Mno4In0.8wKUnlMPIlxq-eWH0d10-Q';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/slusarskiddetroitmi/' + baseMapStyles[0], //stylesheet location
  center: [-83.15, 42.36], // starting position
  zoom: 11.5, // starting zoom
  keyboard : true
});
map.addControl(new mapboxgl.NavigationControl());
moment.tz.add("America/Detroit|LMT CST EST EWT EPT EDT|5w.b 60 50 40 40 40|01234252525252525252525252525252525252525252525252525252525252525252525252525252525252525252525252525252525252525252525252525252525252525252|-2Cgir.N peqr.N 156L0 8x40 iv0 6fd0 11z0 Jy10 SL0 dnB0 1cL0 s10 1Vz0 1cN0 1cL0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 1cN0 1fz0 1a10 1fz0 1cN0 1cL0 1cN0 1cL0 1cN0 1cL0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|37e5");
// ================== functions =====================
var loadSuggestedAddr = function loadSuggestedAddr(link){
  console.log(link.innerHTML);
  console.log(link.getAttribute('data-lng'));
  console.log(link.getAttribute('data-lat'));
  var tempArr = link.innerHTML.split(' ');
  var addr = '';
  for (var i = 0; i < tempArr.length; i++) {
    addr += tempArr[i];
    ((i < tempArr.length) && (i + 1) !== tempArr.length) ? addr += '+': 0;
  }
  console.log(addr);
  var ev = {'result':{'geometry':{'coordinates':[link.getAttribute('data-lng'), link.getAttribute('data-lat')]}}};
  console.log(ev);
  loadPanel(addr,ev);
};
var loadPanel = function loadPanel(addr,ev){
  //================ get parcel data ==========================
  $.getJSON('https://gis.detroitmi.gov/arcgis/rest/services/DoIT/CompositeGeocoder/GeocodeServer/findAddressCandidates?Street=&City=&ZIP=&SingleLine='+ addr +'&category=&outFields=User_fld&maxLocations=&outSR=&searchExtent=&location=&distance=&magicKey=&f=pjson' , function( data ) {
    console.log(data.candidates[0].attributes.User_fld);
    if(data.candidates[0].attributes.User_fld !== ''){
      console.log('flying');
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
      map.setFilter("parcel-fill-hover", ["==", "parcelno", data.candidates[0].attributes.User_fld]);
      var tempParcelDataHTML = '';
      $.getJSON("https://data.detroitmi.gov/resource/vphr-kg52.json?$where=parcelnum = '"+ encodeURI(data.candidates[0].attributes.User_fld) + "'", function( Rental_Inspections ) {
        console.log(Rental_Inspections);
        if(Rental_Inspections.length){
          tempParcelDataHTML += '<article class="info-items"><span>COMPLIANCE STATUS</span> ';
          switch (Rental_Inspections[0].action_description) {
            case 'Issue Initial Registration ':
              tempParcelDataHTML += 'NOT APPROVED RENTAL<br><img src="img/done.png" alt="check"> <item>Registered on '+ moment.tz(Rental_Inspections[0].csa_creation_date,"America/Detroit").format('MMM Do,YYYY') +'</item><br><img src="img/cancel.png" alt="x"> <item>Compliance</item></article>';
              break;
            case 'Issue Renewal Registration':
              tempParcelDataHTML += 'NOT APPROVED RENTAL<br><img src="img/done.png" alt="check"> <item>Registered on '+ moment.tz(Rental_Inspections[0].csa_creation_date,"America/Detroit").format('MMM Do,YYYY') +'</item><br><img src="img/cancel.png" alt="x"> <item>Compliance</item></article>';
              break;
            default:
              // if (moment.tz(Rental_Inspections[0].csa_creation_date,"America/Detroit").isBefore(moment())) {
              //   tempParcelDataHTML += '<initial>APPROVED FOR RENTAL</initial></article>';
              // }else{
              //   tempParcelDataHTML += '<expired>EXPIRED RENTAL</expired></article>';
              // }
              tempParcelDataHTML += '<img src="img/done.png" alt="x"> <item>APPROVED FOR RENTAL</item></article>';
          }
          document.querySelector('.parcel-info.rental-info').innerHTML = tempParcelDataHTML;
          // document.querySelector('.info-container > .rental').innerHTML = '<a href="https://app.smartsheet.com/b/form?EQBCT=f3d4f41a75624b6fb497daa71ef79810" target="_blank"><article class="form-btn">SUBMIT RENTAL COMPLAINT</article></a>';
          document.querySelector('.info-container > .not-rental').innerHTML = '';
        }else{
          tempParcelDataHTML += '<article class="info-items"><span>COMPLIANCE STATUS</span> NOT APPROVED RENTAL<br><img src="img/cancel.png" alt="x"> <item>Registered</item><br><img src="img/cancel.png" alt="x"> <item>Compliance</item></article>';
          document.querySelector('.parcel-info.rental-info').innerHTML = tempParcelDataHTML;
          // document.querySelector('.info-container > .not-rental').innerHTML = '<a href="https://app.smartsheet.com/b/form/d2f38105a59d45e9a6636d92cdf07b80" target="_blank"><article class="form-btn">REGISTER MY RENTAL</article></a>';
          document.querySelector('.info-container > .rental').innerHTML = '';
        }
      });
      $.getJSON("https://data.detroitmi.gov/resource/x3fu-i52p.geojson?$where=parcelnum = '"+ encodeURI(data.candidates[0].attributes.User_fld) + "'" , function( data1 ) {
        console.log(data1);
        if(data1.features.length){
          tempParcelDataHTML += '<article class="info-items"><span>INSPECTION(S) STATUS</span>';
          for (var i = 0; i < data1.features.length; i++) {
            switch (data1.features[i].properties.action_description.trim()) {
              case "Called Emergency Re-Inspection":
                tempParcelDataHTML += '<img src="img/done.png" alt="x"> <item>Called Emergency Re-Inspection</item><br>';
                break;
              case "Emergency Called Inspection":
                tempParcelDataHTML += '<img src="img/done.png" alt="x"> <item>Emergency Called Inspection</item><br>';
                break;
              case "Emergency Re-Inspection":
                tempParcelDataHTML += '<img src="img/done.png" alt="x"> <item>Emergency Re-Inspection</item><br>';
                break;
              case "Called Inspection":
                tempParcelDataHTML += '<img src="img/done.png" alt="x"> <item>Called Inspection</item><br>';
                break;
              case "Inspection":
              console.log('inspection');
                tempParcelDataHTML += '<img src="img/done.png" alt="x"> <item>Inspection</item><br>';
                break;
              case "Complaint Inspection":
                tempParcelDataHTML += '<img src="img/done.png" alt="x"> <item>Complaint Inspection</item><br>';
                break;
              case "Lead Inspection report received":
                tempParcelDataHTML += '<img src="img/done.png" alt="x"> <item>Lead Inspection report received</item><br>';
                break;
              case "3rd Party Inspection":
                tempParcelDataHTML += '<img src="img/done.png" alt="x"> <item>3rd Party Inspection</item><br>';
                break;
              default:
            }
          }
          tempParcelDataHTML += '</article>';
          console.log(tempParcelDataHTML);
          document.querySelector('.parcel-info.rental-info').innerHTML = tempParcelDataHTML;
          // document.querySelector('.info-container > .not-rental').innerHTML = '<a href="https://app.smartsheet.com/b/form/d2f38105a59d45e9a6636d92cdf07b80" target="_blank"><article class="form-btn">REGISTER MY RENTAL</article></a>';
          document.querySelector('.info-container > .rental').innerHTML = '';
        }
      });
      $.getJSON("https://apis.detroitmi.gov/assessments/parcel/"+data.candidates[0].attributes.User_fld.replace(/\./g,'_')+"/", function( parcel ) {
        // console.log(parcel);
        document.querySelector('.info-container > .street-name').innerHTML = parcel.propstreetcombined;
        // tempParcelDataHTML += '<article class="info-items"><span>OWNER</span> ' + parcel.ownername1 + '</article>';
        // tempParcelDataHTML += '<article class="info-items"><span>BUILDING TYPE</span> ' + parcel.resb_style + '</article>';
        // tempParcelDataHTML += '<article class="info-items"><span>PARCEL NUMBER</span> ' + parcel.pnum + '</article>';
        // tempParcelDataHTML += '<article class="info-items"><span>YEAR BUILT</span> ' + parcel.resb_yearbuilt + '</article>';
        // document.querySelector('.parcel-info').innerHTML = tempParcelDataHTML;
        document.querySelector('.parcel-data.owner').innerHTML = '<div class="data-view-btn" data-view="owner" onclick="switchParcelDataViews(this)">OWNER INFORMATION <span>&#10095;</span></div>';
        document.querySelector('.parcel-data.building').innerHTML = '<div class="data-view-btn" data-view="building" onclick="switchParcelDataViews(this)">PROPERTY INFORMATION <span>&#10095;</span></div>';
        parcelData['parcel-data'] = parcel;
      });
    }else{console.log(ev.result.geometry.coordinates[0]+','+ev.result.geometry.coordinates[1]);
      $.getJSON('https://gis.detroitmi.gov/arcgis/rest/services/DoIT/CompositeGeocoder/GeocodeServer/reverseGeocode?location=%7B%22x%22%3A+'+ev.result.geometry.coordinates[0]+'%2C%22y%22%3A+'+ev.result.geometry.coordinates[1]+'%2C%22spatialReference%22%3A+%7B%22wkid%22%3A+4326%7D%7D&distance=&langCode=&outSR=4326&returnIntersection=false&f=pjson' , function( data ) {
        console.log(data);
        var displaySearchAddr = '';
        var splitAddr = addr.split('+');
        for (var i = 0; i < splitAddr.length; i++) {
          displaySearchAddr += splitAddr[i] + ' ';
        }
        document.querySelector('.info-container > .street-name').innerHTML = displaySearchAddr;
        document.querySelector('.parcel-info.rental-info').innerHTML = '<article class="info-items"><span>SEARCH STATUS</span> NO DATA FOUND<br><br>Did you mean?<br><initial><i id="suggested-addr" onclick="loadSuggestedAddr(this)" data-lng="'+ev.result.geometry.coordinates[0]+'" data-lat="'+ev.result.geometry.coordinates[1]+'">'+ data.address.Street +'</i></initial></article>';
      });
    }
    var allGeocoders = document.querySelectorAll('.mapboxgl-ctrl-geocoder input[type="text"]');
    for (var t = 0; t < allGeocoders.length; t++) {
      allGeocoders[t].value = "";
    }
  });
  (document.querySelector('#info').className === 'active') ? 0 : document.querySelector('#info').className = 'active';
}
var loadCityNumbers = function loadCityNumbers(){
  // clearing panel data
  document.querySelector('.overall-number').innerHTML = '';
  document.querySelector('.parcel-info').innerHTML = '';
  document.querySelector('.info-container > .not-rental').innerHTML = '';
  document.querySelector('.info-container > .rental').innerHTML = '';
  document.querySelector('.info-container > .total-rentals').innerHTML = '';
  document.querySelector('.parcel-data.owner').innerHTML = '';
  document.querySelector('.parcel-data.building').innerHTML = '';
  document.querySelector('.parcel-info.display-section').innerHTML = '';
  // ============================================================
  document.querySelector('.info-container > .street-name').innerHTML = 'CITY OF DETROIT';
  var tempDataHTML = '';
  var certRegistration = 0;
  var totalRentals = 0;
  var registerRental = 0;
  var renewalRental = 0;

  var calledEmergencyReInspection = 0;
  var calledEmergencyInspection = 0;
  var emergencyReInspection = 0;
  var calledInspection = 0;
  var inspection = 0;
  var complaintInspection = 0;
  var leadInspectionReport = 0;
  var thirdPartyInspection = 0;

  document.querySelector('.info-container > .total-rentals').innerHTML = "<h4>TOTAL RENTALS</h4><p>0</p>";
  $.getJSON('https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/ZipCodes/FeatureServer/0/query?where=&objectIds=29%2C30&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=' , function( data ) {
    var certifiedLayerData = null;
    var simplePolygon = turf.simplify(data.features[0], {tolerance: 0.003, highQuality: false});
    console.log(simplePolygon);
    var socrataPolygon = Terraformer.WKT.convert(simplePolygon.geometry);
    console.log(socrataPolygon);
    var new_Filter = ["in",'parcelno'];
    $.getJSON("https://data.detroitmi.gov/resource/vphr-kg52.geojson?$query=SELECT * WHERE within_polygon(location, '" + socrataPolygon + "') AND csa_creation_date > '2017-12-31'" , function( data1 ) {
      console.log(data1);
      for (var i = 0; i < data1.features.length; i++) {
        switch (data1.features[i].properties.action_description.trim()) {
          case "Issue Initial Registration":
            registerRental++;
            break;
          case "Issue Renewal Registration":
            renewalRental++;
            break;
          default:
            certRegistration++;
        }
      }
      $.getJSON("https://data.detroitmi.gov/resource/x3fu-i52p.geojson?$query=SELECT * WHERE within_polygon(location, '" + socrataPolygon + "') AND csa_creation_date > '2017-12-31'" , function( data1 ) {
        console.log(data1);
        for (var i = 0; i < data1.features.length; i++) {
          switch (data1.features[i].properties.action_description.trim()) {
            case "Called Emergency Re-Inspection":
              calledEmergencyReInspection++;
              break;
            case "Emergency Called Inspection":
              calledEmergencyInspection++;
              break;
            case "Emergency Re-Inspection":
              emergencyReInspection++;
              break;
            case "Called Inspection":
              calledInspection++;
              break;
            case "Inspection":
              inspection++;
              break;
            case "Complaint Inspection":
              complaintInspection++;
              break;
            case "Lead Inspection report received":
              leadInspectionReport++;
              break;
            case "3rd Party Inspection":
              thirdPartyInspection++;
              break;
            default:
          }
        }
        var simplePolygon = turf.simplify(data.features[1], {tolerance: 0.003, highQuality: false});
        console.log(simplePolygon);
        var socrataPolygon = Terraformer.WKT.convert(simplePolygon.geometry);
        $.getJSON("https://data.detroitmi.gov/resource/vphr-kg52.geojson?$query=SELECT * WHERE within_polygon(location, '" + socrataPolygon + "') AND csa_creation_date > '2017-12-31'" , function( data2 ) {
          console.log(data2);
          for (var i = 0; i < data2.features.length; i++) {
            switch (data2.features[i].properties.action_description.trim()) {
              case "Issue Initial Registration":
                registerRental++;
                break;
              case "Issue Renewal Registration":
                renewalRental++;
                break;
              default:
                certRegistration++;
            }
          }
          $.getJSON("https://data.detroitmi.gov/resource/x3fu-i52p.geojson?$query=SELECT * WHERE within_polygon(location, '" + socrataPolygon + "') AND csa_creation_date > '2017-12-31'" , function( data1 ) {
            console.log(data1);
            for (var i = 0; i < data1.features.length; i++) {
              switch (data1.features[i].properties.action_description.trim()) {
                case "Called Emergency Re-Inspection":
                  calledEmergencyReInspection++;
                  break;
                case "Emergency Called Inspection":
                  calledEmergencyInspection++;
                  break;
                case "Emergency Re-Inspection":
                  emergencyReInspection++;
                  break;
                case "Called Inspection":
                  calledInspection++;
                  break;
                case "Inspection":
                  inspection++;
                  break;
                case "Complaint Inspection":
                  complaintInspection++;
                  break;
                case "Lead Inspection report received":
                  leadInspectionReport++;
                  break;
                case "3rd Party Inspection":
                  thirdPartyInspection++;
                  break;
                default:
              }
            }
            totalRentals = registerRental + certRegistration;
            tempDataHTML += '<article class="initial"><span>INITIAL CERT. OF REGISTRATION</span> ' + registerRental + '</article><article class="cofc"><span>CERTIFICATE OF COMPLIANCE</span> ' + certRegistration + '</article><article class="normal"><span>CALLED EMERGENCY RE-INSPECTION</span> ' + calledEmergencyReInspection + '</article><article class="normal"><span>EMERGENCY CALLED INSPECTION</span> ' + calledEmergencyInspection + '</article><article class="normal"><span>EMERGENCY RE-INSPECTION</span> ' + emergencyReInspection + '</article><article class="normal"><span>CALLED INSPECTION</span> ' + calledInspection + '</article><article class="normal"><span>INSPECTION</span> ' + inspection + '</article><article class="normal"><span>COMPLAINT INSPECTION</span> ' + complaintInspection + '</article><article class="normal"><span>LEAD INSPECTION REPORT RECEIVED</span> ' + leadInspectionReport + '</article><article class="normal"><span>3RD PARTY INSPECTION</span> ' + thirdPartyInspection + '</article>';
            document.querySelector('.overall-number').innerHTML = tempDataHTML;
            document.querySelector('.info-container > .total-rentals > p').innerHTML = totalRentals;
            (document.querySelector('#info').className === 'active') ? 0 : document.querySelector('#info').className = 'active';
          });
        });
      });
    });
  });
};
var switchParcelDataViews = function switchParcelDataViews(e){
  //cons.log(e.getAttribute('data-view'));
  switch (e.getAttribute('data-view')) {
    case 'owner':
      var tempOwnerData = '';
      tempOwnerData += '<article class="info-items"><span>OWNER CITY</span> ' + parcelData['parcel-data'].ownercity + '</article>';
      tempOwnerData += '<article class="info-items"><span>OWNER NAME</span> ' + parcelData['parcel-data'].ownername1 + '</article>';
      tempOwnerData += '<article class="info-items"><span>OWNER STATE</span> ' + parcelData['parcel-data'].ownerstate + '</article>';
      tempOwnerData += '<article class="info-items"><span>OWNER ADDRESS</span> ' + parcelData['parcel-data'].ownerstreetaddr + '</article>';
      tempOwnerData += '<article class="info-items"><span>OWNER ZIP</span> ' + parcelData['parcel-data'].ownerzip + '</article>';
      document.querySelector('.parcel-info.display-section').innerHTML = tempOwnerData;
      //cons.log(parcelData['parcel-data']);
      break;
    case 'building':
      var tempBuldingData = '';
      tempBuldingData += '<article class="info-items"><span>PARCEL NUMBER</span> ' + parcelData['parcel-data'].pnum + '</article>';
      if(parcelData['parcel-data'].resb_calcvalue !== 0){
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
        tempBuldingData += '<article class="info-items"><span>YEAR BUILD</span> ' + parcelData['parcel-data'].resb_yearbuilt + '</article>';
      }else{
        tempBuldingData += '<article class="info-items"><span>BUILDING CLASS</span> ' + parcelData['parcel-data'].cib_bldgclass + '</article>';
        tempBuldingData += '<article class="info-items"><span>CALCULATED VALUE</span> $' + parseInt(parcelData['parcel-data'].cib_calcvalue).toLocaleString() + '</article>';
        tempBuldingData += '<article class="info-items"><span>FLOOR AREA</span> ' + parcelData['parcel-data'].cib_floorarea.toLocaleString() + '</article>';
        tempBuldingData += '<article class="info-items"><span>COMMERCIAL OCCUPANT</span> ' + parcelData['parcel-data'].cib_occ + '</article>';
        tempBuldingData += '<article class="info-items"><span>COMMERCIAL FLOOR PRICE</span> $' + parcelData['parcel-data'].cib_pricefloor.toLocaleString() + '</article>';
        tempBuldingData += '<article class="info-items"><span>NUMBER OF STORIES</span> ' + parcelData['parcel-data'].cib_stories + '</article>';
        tempBuldingData += '<article class="info-items"><span>YEAR BUILD</span> ' + parcelData['parcel-data'].cib_yearbuilt + '</article>';
      }
      document.querySelector('.parcel-info.display-section').innerHTML = tempBuldingData;
      //cons.log(parcelData['parcel-data']);
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
  document.querySelector('.parcel-data.owner').innerHTML = '';
  document.querySelector('.parcel-data.building').innerHTML = '';
  document.querySelector('.parcel-info.display-section').innerHTML = '';
  // console.log(ev.result.geometry);
  // updateURLParams([ev.result.geometry.coordinates[0],ev.result.geometry.coordinates[1]]);
  var tempInputList = document.querySelectorAll('.mapboxgl-ctrl-geocoder.mapboxgl-ctrl > input');
  var tempAddr = '';
  for (var i = 0; i < tempInputList.length; i++) {
    if (tempInputList[i].value.split(',')[0] !== '') {
      // console.log(tempInputList[i].value.split(',')[0]);
      tempAddr = tempInputList[i].value.split(',')[0];
      tempAddr = tempAddr.split(' ');
      break;
    }else {
      // console.log("Empty input");
    }
  }
  var newTempAddr = '';
  var size = tempAddr.length;
  tempAddr.forEach(function(item, index) {
    newTempAddr += item;
    ((index < size) && (index + 1) !== size) ? newTempAddr += '+': 0;
  });
  console.log(newTempAddr);
  loadPanel(newTempAddr,ev);
};
var toggleBaseMap = function toggleBaseMap(e) {
  //console.log(e);
  if(e.target.className !== ''){
    //console.log(e.target.className);
    (e.target.className === 'map-view')? map.setStyle('mapbox://styles/slusarskiddetroitmi/' + baseMapStyles[0]) : map.setStyle('mapbox://styles/slusarskiddetroitmi/' + baseMapStyles[1]);
  }else{
    //console.log(e.target.parentElement);
    (e.target.parentElement.className === 'map-view')? map.setStyle('mapbox://styles/slusarskiddetroitmi/' + baseMapStyles[0]) : map.setStyle('mapbox://styles/slusarskiddetroitmi/' + baseMapStyles[1]);
  }
};
var closeInfo = function closeInfo() {
  //console.log('closing');
  // (document.querySelector('#info').className === 'active') ? document.querySelector('#info').className = '' : document.querySelector('#info').className = 'active';
  (document.querySelector('.info-container > .street-name').innerHTML === 'CITY OF DETROIT') ? document.querySelector('#info').className = '' : loadCityNumbers();
  document.querySelector('.mapboxgl-ctrl-geocoder > input[type="text"]').value = '';
  //console.log('going back to city view');
  map.flyTo({
      center: [-83.15, 42.36], // starting position
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
  map.addSource('zip-codes', {
    type: 'geojson',
    data: 'https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/ZipCodes/FeatureServer/0/query?where=&objectIds=29%2C30&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token='
  });
  map.addLayer({
    "id": "zip-fill-hover",
    "type": "fill",
    "source": "zip-codes",  maxzoom: 13,
    "layout": {},
    "paint": {
      "fill-color": '#0065c3',
      "fill-opacity": .5
    },
    "filter": ["==", "name", ""]
  });
  map.addLayer({
    "id": "zip-borders",
    "type": "line",
    "source": "zip-codes",
    "layout": {},
    "paint": {
      "line-color": "#004b90",
      "line-width": 3
    }
  });
  map.addLayer({
    "id": "zip-fill",
    "type": "fill",
    "source": "zip-codes", maxzoom:13,
    "paint":{
      "fill-color": '#fff',
      'fill-opacity': 0
    },
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
           "line-width": 2
      },
      'source-layer': 'parcelsgeojson'
   });
   map.addLayer({
     "id": "parcel-fill-hover",
     "type": "line",
     "source": "parcels",  minzoom: 15.5,
     "layout": {},
     "paint": {
       "line-color": '#a40040',
       "line-width": 3
     },
     'source-layer': 'parcelsgeojson',
     "filter": ["==", "parcelno", ""]
   });
   var zipLabes = {
     "type": "FeatureCollection",
     "features": []
   };

  $.getJSON('https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/ZipCodes/FeatureServer/0/query?where=&objectIds=29%2C30&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&returnCentroid=false&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=' , function( data ) {
    console.log(data);
    for (var i = 0; i < data.features.length; i++) {
      console.log(data.features[i].geometry.coordinates[0]);
      var tempPolygon = turf.polygon([data.features[i].geometry.coordinates[0]]);
      var tempCenter = turf.centroid(tempPolygon);
      var tempFeature = {
          "type": "Feature",
          "geometry": {
              "type": "Point",
              "coordinates": tempCenter.geometry.coordinates
          },
          "properties":{
            "name": data.features[i].properties.zipcode
          }
      };
      zipLabes.features.push(tempFeature);
    }
    console.log(zipLabes);
    map.addSource('zip-codes-labels', {
      type: 'geojson',
      data: zipLabes
    });
    map.addLayer({
      'id': 'zip-labels',
      'type': 'symbol',
      'source': "zip-codes-labels",
      'maxzoom': 15.5,
      'layout': {
        "text-font": ["Mark SC Offc Pro Bold"],
        'text-field': '{name}'
      },
      'paint': {
        'text-color': 'black'
      }
    });
    var certifiedLayerData = null;
    var simplePolygon = turf.simplify(data.features[0], {tolerance: 0.003, highQuality: false});
    console.log(simplePolygon);
    var socrataPolygon = Terraformer.WKT.convert(simplePolygon.geometry);
    console.log(socrataPolygon);
    var new_Filter = ["in",'parcelno'];
    $.getJSON("https://data.detroitmi.gov/resource/vphr-kg52.geojson?$query=SELECT * WHERE within_polygon(location, '" + socrataPolygon + "') AND action_description = 'Issue City C of C -  Ord 18-03'" , function( data1 ) {
      console.log(data1);
      certifiedLayerData = data1;
      data1.features.forEach(function(rental){
        new_Filter.push(rental.properties.parcelnum);
      });
      var simplePolygon = turf.simplify(data.features[1], {tolerance: 0.003, highQuality: false});
      console.log(simplePolygon);
      var socrataPolygon = Terraformer.WKT.convert(simplePolygon.geometry);
      $.getJSON("https://data.detroitmi.gov/resource/vphr-kg52.geojson?$query=SELECT * WHERE within_polygon(location, '" + socrataPolygon + "') AND action_description = 'Issue City C of C -  Ord 18-03'" , function( data2 ) {
        data2.features.forEach(function(rental){
          new_Filter.push(rental.properties.parcelnum);
          certifiedLayerData.features.push(rental);
        });
        console.log(new_Filter);
        console.log(certifiedLayerData);
        map.addLayer({
           "id": "parcel-fill-certified",
           "type": "fill",
           "source": "parcels",
           "minzoom": 15.5,
           'source-layer': 'parcelsgeojson',
           'filter': new_Filter,
           "paint": {
             "fill-color":"#068A24",
             "fill-opacity":0.5
           }
         });
         map.addSource('certified', {
           type: 'geojson',
           data: certifiedLayerData
         });
         map.addLayer({
           "id": "circle-certified",
           "source": "certified",
           "maxzoom": 15.5,
           "type": "circle",
           "paint": {
               "circle-radius": 6,
               "circle-color": "#068A24",
           }
         });
      });
    });
  });
};
map.on('style.load', function(){
  addDataLayers();
  map.resize();
});
map.on('load', function(window) {
  loadCityNumbers();
  map.on("mousemove", function(e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: ["zip-fill"]
    });
    if (features.length) {
      map.setFilter("zip-fill-hover", ["==", "zipcode", features[0].properties.zipcode]);
    }else{
      map.setFilter("zip-fill-hover", ["==", "zipcode", ""]);
      features = map.queryRenderedFeatures(e.point, {
        layers: ["circle-certified"]
      });
      if (!features.length) {
        features = map.queryRenderedFeatures(e.point, {
          layers: ["parcel-fill"]
        });
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
  var allGeocoders = document.querySelectorAll('.mapboxgl-ctrl-geocoder input[type="text"]');
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
  // console.log(map.getZoom());
  // updateURLParams([map.getZoom()]);
});
document.getElementById('close-emergency-modal-btn').addEventListener('click',closeInfo);
var toggleBaseMapBtns = document.querySelectorAll('#basemap-toggle > article');
for (var i = 0; i < toggleBaseMapBtns.length; i++) {
  toggleBaseMapBtns[i].addEventListener('click',function(e){
    toggleBaseMap(e);
  });
}
