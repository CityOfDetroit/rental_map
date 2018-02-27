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
        //=============================================
        // let tempDataHTML = '';
        // let certRegistration = 0;
        // let totalRentals = 0;
        // document.querySelector('.info-container > .total-rentals').innerHTML = "<h4>TOTAL RENTALS</h4><p>0</p>";
        // $.getJSON("https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Rental_Inspections/FeatureServer/0/query?where=ACTION_DESCRIPTION%3D%27Issue+Initial+Registration%27+AND+ParcelNo+IS+NOT+NULL&objectIds=&time=&geometry="+ encodeURI(JSON.stringify(arcPolygon))+"&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=true&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=json&token=", function( data ) {
        //   //console.log(data.count);
        //   // tempDataHTML += '<article class="initial"><span>INITIAL CERT. OF REGISTRATION</span> ' + data.count + '</article>';
        //   // document.querySelector('.overall-number').innerHTML = tempDataHTML;
        //   totalRentals += data.count;
        //   certRegistration += data.count;
        //   // document.querySelector('.info-container > .total-rentals > p').innerHTML = totalRentals;
        //   $.getJSON("https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Rental_Inspections/FeatureServer/0/query?where=ACTION_DESCRIPTION%3D%27Issue+Renewal+Registration%27+AND+ParcelNo+IS+NOT+NULL&objectIds=&time=&geometry="+ encodeURI(JSON.stringify(arcPolygon))+"&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=true&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=json&token=", function( data ) {
        //     //console.log(data.count);
        //     certRegistration += data.count;
        //     tempDataHTML += '<article class="initial"><span>CERTIFICATE OF REGISTRATION</span> ' + certRegistration + '</article>';
        //     document.querySelector('.overall-number').innerHTML = tempDataHTML;
        //     totalRentals += data.count;
        //     document.querySelector('.info-container > .total-rentals > p').innerHTML = totalRentals;
        //   });
        // });
        // $.getJSON("https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Rental_Inspections/FeatureServer/0/query?where=ACTION_DESCRIPTION%3D%27Issue+City+C+of+C+-++Ord+18-03%27+AND+ParcelNo+IS+NOT+NULL&objectIds=&time=&geometry="+ encodeURI(JSON.stringify(arcPolygon))+"&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=true&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=json&token=", function( data ) {
        //   //console.log(data.count);
        //   tempDataHTML += '<article class="cofc"><span>CERTIFICATE OF COMPLIANCE</span> ' + data.count + '</article>';
        //   document.querySelector('.overall-number').innerHTML = tempDataHTML;
        //   totalRentals += data.count;
        //   document.querySelector('.info-container > .total-rentals > p').innerHTML = totalRentals;
        // });
        // document.querySelector('.info-container > .rental').innerHTML = '<a href="https://app.smartsheet.com/b/form?EQBCT=91c0d55e47064373835ce198802764e2" target="_blank"><article class="form-btn">SUBMIT RENTAL COMPLAINT</article></a>';
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
        $.getJSON("https://data.detroitmi.gov/resource/vphr-kg52.json?$where=within_polygon(location,"+ JSON.stringify(socrataPolygon) + ") LIMIT 500000", function( data ) {
          console.log(data);
          var tempDataHTML = '';
          var certRegistration = 0;
          var totalRentals = 0;
          var registerRental = 0;
          var renewalRental = 0;
          for (var i = 0; i < data.length; i++) {
            switch (data[i].action_description.trim()) {
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
          totalRentals = data.length;
          tempDataHTML += '<article class="initial"><span>INITIAL CERT. OF REGISTRATION</span> ' + registerRental + '</article><article class="renewal"><span>RENEWAL REGISTRATION</span> ' + renewalRental + '</article><article class="cofc"><span>CERTIFICATE OF COMPLIANCE</span> ' + certRegistration + '</article>';
          document.querySelector('.overall-number').innerHTML = tempDataHTML;
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
        $.getJSON("https://data.detroitmi.gov/resource/vphr-kg52.json?$where=parcelnum = '"+ encodeURI(parcelFeatures[0].properties.parcelno) + "'", function( Rental_Inspections ) {
          console.log(Rental_Inspections);
          var tempParcelDataHTML = '';
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
                tempParcelDataHTML += '<initial>APPROVED FOR RENTAL</initial></article>';
            }
            document.querySelector('.parcel-info.rental-info').innerHTML = tempParcelDataHTML;
            // document.querySelector('.info-container > .rental').innerHTML = '<a href="https://app.smartsheet.com/b/form?EQBCT=f3d4f41a75624b6fb497daa71ef79810" target="_blank"><article class="form-btn">SUBMIT RENTAL COMPLAINT</article></a>';
            document.querySelector('.info-container > .not-rental').innerHTML = '';
          }else{
            tempParcelDataHTML += '<article class="info-items"><span>COMPLIANCE STATUS</span> NOT APPROVED RENTAL<br><img src="img/cancel.png" alt="x"> <item>Registered</item><br><img src="img/cancel.png" alt="x"> <item>Compliance</item></article>';
            document.querySelector('.parcel-info.rental-info').innerHTML = tempParcelDataHTML;
            document.querySelector('.info-container > .not-rental').innerHTML = '<a href="https://app.smartsheet.com/b/form/d2f38105a59d45e9a6636d92cdf07b80" target="_blank"><article class="form-btn">REGISTER MY RENTAL</article></a>';
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

        var tempParcelDataHTML = '<article class="info-items"><span>COMPLIANCE STATUS</span><initial>APPROVED FOR RENTAL</initial></article>';
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
