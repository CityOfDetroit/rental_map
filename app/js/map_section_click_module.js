var mapSectionClickModule = (function(calendarEvents){
  map.on('click', function (e) {
    //console.log(e);
    var councilFeatures = null;
    var neighborhoodsFeatures = null;
    var parcelFeatures = null;
    try {
      councilFeatures = [];
      zipFeatures = map.queryRenderedFeatures(e.point, { layers: ['zip-fill'] });
      parcelFeatures = map.queryRenderedFeatures(e.point, { layers: ['parcel-fill'] });
      certifiedFeatures = map.queryRenderedFeatures(e.point, { layers: ['circle-certified'] });
    } catch (error) {
      //console.log("ERROR: " +error);
    } finally {
      //console.log(councilFeatures.length);
      //console.log(neighborhoodsFeatures.length);
      //console.log(parcelFeatures.length);
    }
    switch (true) {
      case councilFeatures.length !== 0:
        var features = map.queryRenderedFeatures(e.point, { layers: ['council-fill'] });
        var feature = features[0];
        //console.log(feature);
        var simplifiedFeatured = turf.simplify(feature, {tolerance: 0.003, highQuality: false});
        //console.log(simplifiedFeatured);
        var arcPolygon = Terraformer.ArcGIS.convert(simplifiedFeatured.geometry);
        //console.log(arcPolygon);
        // clearing panel data
        document.querySelector('.overall-number').innerHTML = '';
        document.querySelector('.parcel-info').innerHTML = '';
        document.querySelector('.info-container > .not-rental').innerHTML = '';
        document.querySelector('.info-container > .rental').innerHTML = '';
        document.querySelector('.info-container > .total-rentals').innerHTML = '';
        document.querySelector('.parcel-data.owner').innerHTML = '';
        document.querySelector('.parcel-data.building').innerHTML = '';
        document.querySelector('.parcel-info.display-section').innerHTML = '';
        document.querySelector('.info-container > .street-name').innerHTML = simplifiedFeatured.properties.name;
        (document.querySelector('#info').className === 'active') ? 0 : document.querySelector('#info').className = 'active';
        map.flyTo({
            center: [e.lngLat.lng, e.lngLat.lat],
            zoom: 13,
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
        break;
      case zipFeatures.length !== 0:
        console.log(zipFeatures);
        document.querySelector('.info-container > .street-name').innerHTML = "ZIP CODE: " + zipFeatures[0].properties.zipcode;
        map.flyTo({
            center: [e.lngLat.lng, e.lngLat.lat],
            zoom: 13.5,
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
        // clearing panel data
        document.querySelector('.overall-number').innerHTML = '';
        document.querySelector('.parcel-info').innerHTML = '';
        document.querySelector('.info-container > .not-rental').innerHTML = '';
        document.querySelector('.info-container > .rental').innerHTML = '';
        document.querySelector('.info-container > .total-rentals').innerHTML = '';
        document.querySelector('.parcel-data.owner').innerHTML = '';
        document.querySelector('.parcel-data.building').innerHTML = '';
        document.querySelector('.parcel-info.display-section').innerHTML = '';
        var simplifiedFeatured = turf.simplify(zipFeatures[0], {tolerance: 0.003, highQuality: false});
        var socrataPolygon = Terraformer.WKT.convert(simplifiedFeatured.geometry);
        console.log(socrataPolygon);
        var tempDataHTML = '';
        var certRegistration = 0;
        var totalRentals = 0;

        var totalInspections = 0;
        var leadInspectionReport = 0;
        var thirdPartyInspection = 0;
        $.getJSON("https://data.detroitmi.gov/resource/vphr-kg52.geojson?$query=SELECT * WHERE within_polygon(location, '" + socrataPolygon + "') AND csa_date3 > '2017-12-31'", function( data ) {
          console.log(data);
          totalRentals = data.features.length;
          $.getJSON("https://data.detroitmi.gov/resource/baxk-dxw9.geojson?$query=SELECT * WHERE within_polygon(location, '" + socrataPolygon + "') AND csa_date3 > '2017-12-31'", function( data ) {
            certRegistration = data.features.length;
            $.getJSON("https://data.detroitmi.gov/resource/x3fu-i52p.geojson?$query=SELECT * WHERE within_polygon(location, '" + socrataPolygon + "') AND csa_creation_date > '2017-12-31'" , function( data1 ) {
              console.log(data1);
              for (var i = 0; i < data1.features.length; i++) {
                switch (data1.features[i].properties.action_description.trim()) {
                  case "Called Emergency Re-Inspection":
                    totalInspections++;
                    break;
                  case "Emergency Called Inspection":
                    totalInspections++;
                    break;
                  case "Emergency Re-Inspection":
                    totalInspections++;
                    break;
                  case "Called Inspection":
                    totalInspections++;
                    break;
                  case "Inspection":
                    totalInspections++;
                    break;
                  case "Complaint Inspection":
                    totalInspections++;
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
              tempDataHTML += '<article class="cofc"><span>CERTIFICATE OF COMPLIANCE</span> ' + certRegistration + '</article><article class="normal"><span>INSPECTIONS</span> ' + totalInspections + '</article><article class="normal"><span>LEAD INSPECTION REPORT RECEIVED</span> ' + leadInspectionReport + '</article><article class="normal"><span>3RD PARTY INSPECTION</span> ' + thirdPartyInspection + '</article>';
              document.querySelector('.overall-number').innerHTML = tempDataHTML;
            });
          });
        });
        (document.querySelector('#info').className === 'active') ? 0 : document.querySelector('#info').className = 'active';
        break;
      case parcelFeatures.length !== 0:
        // clearing panel data
        document.querySelector('.overall-number').innerHTML = '';
        document.querySelector('.parcel-info').innerHTML = '';
        document.querySelector('.info-container > .street-name').innerHTML = '';
        document.querySelector('.info-container > .total-rentals').innerHTML = '';
        document.querySelector('.parcel-data.owner').innerHTML = '';
        document.querySelector('.parcel-data.building').innerHTML = '';
        document.querySelector('.parcel-info.display-section').innerHTML = '';
        //console.log(parcelFeatures[0].properties);
        map.setFilter("parcel-fill-hover", ["==", "parcelno", parcelFeatures[0].properties.parcelno]);
        var tempParcelDataHTML = '';
        $.getJSON("https://data.detroitmi.gov/resource/baxk-dxw9.json?$where=parcelnum = '"+ encodeURI(parcelFeatures[0].properties.parcelno) + "'", function( certified ) {
          console.log(certified);
          if(certified.length){
            tempParcelDataHTML += '<article class="info-items"><span>COMPLIANCE STATUS</span> <img src="img/done.png" alt="x"> <item>APPROVED FOR RENTAL</item></article>';
            document.querySelector('.parcel-info.rental-info').innerHTML = tempParcelDataHTML;
            // document.querySelector('.info-container > .rental').innerHTML = '<a href="https://app.smartsheet.com/b/form?EQBCT=f3d4f41a75624b6fb497daa71ef79810" target="_blank"><article class="form-btn">SUBMIT RENTAL COMPLAINT</article></a>';
            document.querySelector('.info-container > .not-rental').innerHTML = '';
          }else{
            $.getJSON("https://data.detroitmi.gov/resource/vphr-kg52.json?$where=parcelnum = '"+ encodeURI(parcelFeatures[0].properties.parcelno) + "'", function( register ) {
              console.log(register);
              if(register.length){
                tempParcelDataHTML += '<article class="info-items"><span>COMPLIANCE STATUS</span> ';
                switch (register[0].action_description) {
                  case 'Issue Initial Registration ':
                    tempParcelDataHTML += 'NOT APPROVED RENTAL<br><img src="img/done.png" alt="check"> <item>Registered on '+ moment.tz(register[0].csa_date3,"America/Detroit").format('MMM Do,YYYY') +'</item><br><img src="img/cancel.png" alt="x"> <item>Compliance</item></article>';
                    break;
                  case 'Issue Renewal Registration':
                    tempParcelDataHTML += 'NOT APPROVED RENTAL<br><img src="img/done.png" alt="check"> <item>Registered on '+ moment.tz(register[0].csa_date3,"America/Detroit").format('MMM Do,YYYY') +'</item><br><img src="img/cancel.png" alt="x"> <item>Compliance</item></article>';
                    break;
                  default:
                    tempParcelDataHTML += '<img src="img/done.png" alt="x"> <item>APPROVED FOR RENTAL</item></article>';
                }
              }else{
                tempParcelDataHTML += '<article class="info-items"><span>COMPLIANCE STATUS</span> NOT APPROVED RENTAL<br><img src="img/cancel.png" alt="x"> <item>Registered</item><br><img src="img/cancel.png" alt="x"> <item>Compliance</item></article>';
              }
              document.querySelector('.parcel-info.rental-info').innerHTML = tempParcelDataHTML;
              // document.querySelector('.info-container > .not-rental').innerHTML = '<a href="https://app.smartsheet.com/b/form/d2f38105a59d45e9a6636d92cdf07b80" target="_blank"><article class="form-btn">REGISTER MY RENTAL</article></a>';
              document.querySelector('.info-container > .rental').innerHTML = '';
            });
          }
        });
        $.getJSON("https://data.detroitmi.gov/resource/x3fu-i52p.geojson?$where=parcelnum = '"+ encodeURI(parcelFeatures[0].properties.parcelno) + "'" , function( data1 ) {
          console.log(data1);
          if(data1.features.length){
            tempParcelDataHTML += '<article class="info-items"><span>INSPECTION(S) STATUS</span>';
            for (var i = 0; i < data1.features.length; i++) {
              var inspectionOn = false;
              switch (data1.features[i].properties.action_description.trim()) {
                case "Called Emergency Re-Inspection":
                  inspectionOn = true;
                  break;
                case "Emergency Called Inspection":
                  inspectionOn = true;
                  break;
                case "Emergency Re-Inspection":
                  inspectionOn = true;
                  break;
                case "Called Inspection":
                  inspectionOn = true;
                  break;
                case "Inspection":
                  inspectionOn = true;
                  break;
                case "Complaint Inspection":
                  inspectionOn = true;
                  break;
                case "Lead Inspection report received":
                  tempParcelDataHTML += '<img src="img/done.png" alt="x"> <item>Lead Inspection report received</item><br>';
                  break;
                case "3rd Party Inspection":
                  tempParcelDataHTML += '<img src="img/done.png" alt="x"> <item>3rd Party Inspection</item><br>';
                  break;
                default:
              }
              if(inspectionOn){tempParcelDataHTML += '<img src="img/done.png" alt="x"> <item>Inspection</item><br>';}
            }
            tempParcelDataHTML += '</article>';
            document.querySelector('.parcel-info.rental-info').innerHTML = tempParcelDataHTML;
            // document.querySelector('.info-container > .not-rental').innerHTML = '<a href="https://app.smartsheet.com/b/form/d2f38105a59d45e9a6636d92cdf07b80" target="_blank"><article class="form-btn">REGISTER MY RENTAL</article></a>';
            document.querySelector('.info-container > .rental').innerHTML = '';
          }
        });
        $.getJSON("http://apis.detroitmi.gov/assessments/parcel/"+parcelFeatures[0].properties.parcelno.replace(/\./g,'_')+"/", function( parcel ) {
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
        (document.querySelector('#info').className === 'active') ? 0 : document.querySelector('#info').className = 'active';
        break;
      case certifiedFeatures.length !== 0:
        console.log(certifiedFeatures);
        document.querySelector('.overall-number').innerHTML = '';
        document.querySelector('.parcel-info').innerHTML = '';
        document.querySelector('.info-container > .street-name').innerHTML = '';
        document.querySelector('.info-container > .total-rentals').innerHTML = '';
        document.querySelector('.parcel-data.owner').innerHTML = '';
        document.querySelector('.parcel-data.building').innerHTML = '';
        document.querySelector('.parcel-info.display-section').innerHTML = '';

        var tempParcelDataHTML = '<article class="info-items"><span>COMPLIANCE STATUS</span><img src="img/done.png" alt="x"> <item>APPROVED FOR RENTAL</item></article>';
        document.querySelector('.parcel-info.rental-info').innerHTML = tempParcelDataHTML;
        // document.querySelector('.info-container > .rental').innerHTML = '<a href="https://app.smartsheet.com/b/form?EQBCT=f3d4f41a75624b6fb497daa71ef79810" target="_blank"><article class="form-btn">SUBMIT RENTAL COMPLAINT</article></a>';
        document.querySelector('.info-container > .not-rental').innerHTML = '';
        $.getJSON("http://apis.detroitmi.gov/assessments/parcel/" + certifiedFeatures[0].properties.parcelnum + "/", function( parcel ) {
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
        (document.querySelector('#info').className === 'active') ? 0 : document.querySelector('#info').className = 'active';
        break;
      default:

      }
  });
})(window);
