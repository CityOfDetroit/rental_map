var mapSectionClickModule = (function(calendarEvents){
  map.on('click', function (e) {
    //console.log(e);
    var councilFeatures = null;
    var neighborhoodsFeatures = null;
    var parcelFeatures = null;
    try {
      councilFeatures = map.queryRenderedFeatures(e.point, { layers: ['council-fill'] });
      neighborhoodsFeatures = map.queryRenderedFeatures(e.point, { layers: ['neighborhoods-fill'] });
      parcelFeatures = map.queryRenderedFeatures(e.point, { layers: ['parcel-fill'] });
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
        var simplifiedFeatured = turf.simplify(feature, 0.003, false);
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
      case neighborhoodsFeatures.length !== 0:
        map.flyTo({
            center: [e.lngLat.lng, e.lngLat.lat],
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
        // clearing panel data
        document.querySelector('.overall-number').innerHTML = '';
        document.querySelector('.parcel-info').innerHTML = '';
        document.querySelector('.info-container > .not-rental').innerHTML = '';
        document.querySelector('.info-container > .rental').innerHTML = '';
        document.querySelector('.info-container > .total-rentals').innerHTML = '';
        document.querySelector('.parcel-data.owner').innerHTML = '';
        document.querySelector('.parcel-data.building').innerHTML = '';
        document.querySelector('.parcel-info.display-section').innerHTML = '';
        // let totalRentalsNeighborhood = 0;
        // document.querySelector('.info-container > .total-rentals').innerHTML = "<h4>TOTAL RENTALS</h4><p>0</p>";
        $.getJSON('http://gis.detroitmi.gov/arcgis/rest/services/NeighborhoodsApp/Neighborhoods/MapServer/1/query?where=&text=&objectIds=&time=&geometry='+ e.lngLat.lng + '%2C' + e.lngLat.lat +'&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=geojson', function( data ) {
          //console.log(data.features[0]);
          var simplifiedFeatured = turf.simplify(data.features[0], 0.0005, false);
          // document.querySelector('.info-container > .rental').innerHTML = '<a href="https://app.smartsheet.com/b/form?EQBCT=91c0d55e47064373835ce198802764e2" target="_blank"><article class="form-btn">SUBMIT RENTAL COMPLAINT</article></a>';
          document.querySelector('.info-container > .street-name').innerHTML = simplifiedFeatured.properties.name;
          (document.querySelector('#info').className === 'active') ? 0 : document.querySelector('#info').className = 'active';
          //console.log(simplifiedFeatured);
          var arcPolygon = Terraformer.ArcGIS.convert(simplifiedFeatured.geometry);
          //console.log(arcPolygon);

          // let tempDataHTML = '';
          // let certRegistrationNeighborhood = 0;
          // document.querySelector('.info-container > .total-rentals').innerHTML = "<h4>TOTAL RENTALS</h4><p>0</p>";
          // $.getJSON("https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Rental_Inspections/FeatureServer/0/query?where=ACTION_DESCRIPTION%3D%27Issue+Initial+Registration%27+AND+ParcelNo+IS+NOT+NULL&objectIds=&time=&geometry="+ encodeURI(JSON.stringify(arcPolygon))+"&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=true&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=json&token=", function( data ) {
          //   //console.log(data.count);
          //   // tempDataHTML += '<article class="initial"><span>INITIAL CERT. OF REGISTRATION</span> ' + data.count + '</article>';
          //   // document.querySelector('.overall-number').innerHTML = tempDataHTML;
          //   totalRentalsNeighborhood += data.count;
          //   certRegistrationNeighborhood += data.count;
          //   // document.querySelector('.info-container > .total-rentals > p').innerHTML = totalRentals;
          //   $.getJSON("https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Rental_Inspections/FeatureServer/0/query?where=ACTION_DESCRIPTION%3D%27Issue+Renewal+Registration%27+AND+ParcelNo+IS+NOT+NULL&objectIds=&time=&geometry="+ encodeURI(JSON.stringify(arcPolygon))+"&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=true&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=json&token=", function( data ) {
          //     //console.log(data.count);
          //     certRegistrationNeighborhood += data.count;
          //     tempDataHTML += '<article class="initial"><span>CERTIFICATE OF REGISTRATION</span> ' + certRegistrationNeighborhood + '</article>';
          //     document.querySelector('.overall-number').innerHTML = tempDataHTML;
          //     totalRentalsNeighborhood += data.count;
          //     document.querySelector('.info-container > .total-rentals > p').innerHTML = totalRentalsNeighborhood;
          //   });
          // });
          // $.getJSON("https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Rental_Inspections/FeatureServer/0/query?where=ACTION_DESCRIPTION%3D%27Issue+City+C+of+C+-++Ord+18-03%27+AND+ParcelNo+IS+NOT+NULL&objectIds=&time=&geometry="+ encodeURI(JSON.stringify(arcPolygon))+"&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=true&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=json&token=", function( data ) {
          //   //console.log(data.count);
          //   tempDataHTML += '<article class="cofc"><span>CERTIFICATE OF COMPLIANCE</span> ' + data.count + '</article>';
          //   document.querySelector('.overall-number').innerHTML = tempDataHTML;
          //   totalRentalsNeighborhood += data.count;
          //   document.querySelector('.info-container > .total-rentals > p').innerHTML = totalRentalsNeighborhood;
          // });
        });
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
        $.getJSON("https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/Rental_Inspections/FeatureServer/0/query?where="+ encodeURI("ParcelNo='"+parcelFeatures[0].properties.parcelno+"'")+"&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=ACTION_DESCRIPTION%2C+ParcelNo%2C+CSA_CREATION_DATE&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=json&token=", function( Rental_Inspections ) {
          // console.log(Rental_Inspections);
          var tempParcelDataHTML = '';
          if(Rental_Inspections.features.length){
            if(Rental_Inspections.features[0].properties){
              tempParcelDataHTML += '<article class="info-items"><span>COMPLIANCE STATUS</span> ';
              switch (Rental_Inspections.features[0].properties.ACTION_DESCRIPTION) {
                case 'Issue Initial Registration':
                  tempParcelDataHTML += 'NOT APPROVED RENTAL<br><img src="img/done.png" alt="check"> <item>Registered on '+ moment.tz(Rental_Inspections.features[0].attributes.CSA_CREATION_DATE,"America/Detroit").format('MMM Do,YYYY') +'</item><br><img src="img/cancel.png" alt="x"> <item>Compliance</item></article>';
                  break;
                case 'Issue Renewal Registration':
                  tempParcelDataHTML += 'NOT APPROVED RENTAL<br><img src="img/done.png" alt="check"> <item>Registered on '+ moment.tz(Rental_Inspections.features[0].attributes.CSA_CREATION_DATE,"America/Detroit").format('MMM Do,YYYY') +'</item><br><img src="img/cancel.png" alt="x"> <item>Compliance</item></article>';
                  break;
                default:
                  if (moment.tz(Rental_Inspections.features[0].attributes.CSA_CREATION_DATE,"America/Detroit").isBefore(moment())) {
                    tempParcelDataHTML += '<initial>APPROVED FOR RENTAL</initial></article>';
                  }else{
                    tempParcelDataHTML += '<expired>EXPIRED RENTAL</expired></article>';
                  }
              }
            }else{
              tempParcelDataHTML += '<article class="info-items"><span>COMPLIANCE STATUS</span> ';
              switch (Rental_Inspections.features[0].attributes.ACTION_DESCRIPTION) {
                case 'Issue Initial Registration ':
                  tempParcelDataHTML += 'NOT APPROVED RENTAL<br><img src="img/done.png" alt="check"> <item>Registered on '+ moment.tz(Rental_Inspections.features[0].attributes.CSA_CREATION_DATE,"America/Detroit").format('MMM Do,YYYY') +'</item><br><img src="img/cancel.png" alt="x"> <item>Compliance</item></article>';
                  break;
                case 'Issue Renewal Registration':
                  tempParcelDataHTML += 'NOT APPROVED RENTAL<br><img src="img/done.png" alt="check"> <item>Registered on '+ moment.tz(Rental_Inspections.features[0].attributes.CSA_CREATION_DATE,"America/Detroit").format('MMM Do,YYYY') +'</item><br><img src="img/cancel.png" alt="x"> <item>Compliance</item></article>';
                  break;
                default:
                  if (moment.tz(Rental_Inspections.features[0].attributes.CSA_CREATION_DATE,"America/Detroit").isBefore(moment())) {
                    tempParcelDataHTML += '<initial>APPROVED FOR RENTAL</initial></article>';
                  }else{
                    tempParcelDataHTML += '<expired>EXPIRED</expired></article>';
                  }
              }
            }
            document.querySelector('.parcel-info.rental-info').innerHTML = tempParcelDataHTML;
            // document.querySelector('.info-container > .rental').innerHTML = '<a href="https://app.smartsheet.com/b/form?EQBCT=f3d4f41a75624b6fb497daa71ef79810" target="_blank"><article class="form-btn">SUBMIT RENTAL COMPLAINT</article></a>';
            document.querySelector('.info-container > .not-rental').innerHTML = '';
          }else{
            tempParcelDataHTML += '<article class="info-items"><span>COMPLIANCE STATUS</span> NOT APPROVED RENTAL<br><img src="img/cancel.png" alt="x"> <item>Registered</item><br><img src="img/cancel.png" alt="x"> <item>Compliance</item></article>';
            document.querySelector('.parcel-info.rental-info').innerHTML = tempParcelDataHTML;
            document.querySelector('.info-container > .not-rental').innerHTML = '<a href="https://app.smartsheet.com/b/form?EQBCT=7b3746bd20a048a5919ae07bd9ed89de" target="_blank"><article class="form-btn">REGISTER MY RENTAL</article></a>';
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
      default:

      }
  });
})(window);
