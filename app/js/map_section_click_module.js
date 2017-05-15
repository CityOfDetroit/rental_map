var mapSectionClickModule = (function(calendarEvents){
  map.on('click', function (e) {
    console.log(e);
    let councilFeatures = null;
    let neighborhoodsFeatures = null;
    let parcelFeatures = null;
    try {
      councilFeatures = map.queryRenderedFeatures(e.point, { layers: ['council-fill'] });
      neighborhoodsFeatures = map.queryRenderedFeatures(e.point, { layers: ['neighborhoods-fill'] });
      parcelFeatures = map.queryRenderedFeatures(e.point, { layers: ['parcel-fill'] });
    } catch (e) {
      console.log("ERROR: " +e);
    } finally {
      console.log(councilFeatures.length);
      console.log(neighborhoodsFeatures.length);
      console.log(parcelFeatures.length);
    }
    switch (true) {
      case councilFeatures.length !== 0:
        var features = map.queryRenderedFeatures(e.point, { layers: ['council-fill'] });
        let feature = features[0];
        console.log(feature);
        let simplifiedFeatured = turf.simplify(feature, 0.003, false);
        console.log(simplifiedFeatured);
        let arcPolygon = Terraformer.ArcGIS.convert(simplifiedFeatured.geometry);
        console.log(arcPolygon);
        // clearing panel data
        document.querySelector('.overall-number').innerHTML = '';
        document.querySelector('.parcel-info').innerHTML = '';
        document.querySelector('.info-container > .not-rental').innerHTML = '';
        document.querySelector('.info-container > .rental').innerHTML = '';
        document.querySelector('.info-container > .total-rentals').innerHTML = '';
        document.querySelector('.parcel-data.owner').innerHTML = '';
        document.querySelector('.parcel-data.building').innerHTML = '';
        let tempDataHTML = '';
        let totalRentals = 0;
        document.querySelector('.info-container > .total-rentals').innerHTML = "<h4>TOTAL RENTALS</h4><p>0</p>";
        $.getJSON("https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Rental_Inspections/FeatureServer/0/query?where=ACTION_DESCRIPTION%3D%27Issue+Initial+Registration%27+AND+ParcelNo+IS+NOT+NULL&objectIds=&time=&geometry="+ encodeURI(JSON.stringify(arcPolygon))+"&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=true&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=json&token=", function( data ) {
          console.log(data.count);
          tempDataHTML += '<article class="initial"><span>INITIAL REGISTRATION</span> ' + data.count + '</article>';
          document.querySelector('.overall-number').innerHTML = tempDataHTML;
          totalRentals += data.count;
          document.querySelector('.info-container > .total-rentals > p').innerHTML = totalRentals;
        });
        $.getJSON("https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Rental_Inspections/FeatureServer/0/query?where=ACTION_DESCRIPTION%3D%27Issue+Renewal+Registration%27+AND+ParcelNo+IS+NOT+NULL&objectIds=&time=&geometry="+ encodeURI(JSON.stringify(arcPolygon))+"&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=true&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=json&token=", function( data ) {
          console.log(data.count);
          tempDataHTML += '<article class="renewal"><span>RENEWAL REGISTRATION</span> ' + data.count + '</article>';
          document.querySelector('.overall-number').innerHTML = tempDataHTML;
          totalRentals += data.count;
          document.querySelector('.info-container > .total-rentals > p').innerHTML = totalRentals;
        });
        $.getJSON("https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Rental_Inspections/FeatureServer/0/query?where=ACTION_DESCRIPTION%3D%27Issue+City+C+of+C+-++Ord+18-03%27+AND+ParcelNo+IS+NOT+NULL&objectIds=&time=&geometry="+ encodeURI(JSON.stringify(arcPolygon))+"&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=true&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=json&token=", function( data ) {
          console.log(data.count);
          tempDataHTML += '<article class="cofc"><span>CITY C OF C</span> ' + data.count + '</article>';
          document.querySelector('.overall-number').innerHTML = tempDataHTML;
          totalRentals += data.count;
          document.querySelector('.info-container > .total-rentals > p').innerHTML = totalRentals;
        });
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
        let totalRentalsNeighborhood = 0;
        document.querySelector('.info-container > .total-rentals').innerHTML = "<h4>TOTAL RENTALS</h4><p>0</p>";
        $.getJSON('http://gis.detroitmi.gov/arcgis/rest/services/NeighborhoodsApp/Neighborhoods/MapServer/1/query?where=&text=&objectIds=&time=&geometry='+ e.lngLat.lng + '%2C' + e.lngLat.lat +'&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=geojson', function( data ) {
          console.log(data.features[0]);
          let simplifiedFeatured = turf.simplify(data.features[0], 0.0005, false);
          document.querySelector('.info-container > .street-name').innerHTML = simplifiedFeatured.properties.name;
          (document.querySelector('#info').className === 'active') ? 0 : document.querySelector('#info').className = 'active';
          console.log(simplifiedFeatured);
          let arcPolygon = Terraformer.ArcGIS.convert(simplifiedFeatured.geometry);
          console.log(arcPolygon);
          let tempDataHTML = '';
          $.getJSON("https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Rental_Inspections/FeatureServer/0/query?where=ACTION_DESCRIPTION%3D%27Issue+Initial+Registration%27+AND+ParcelNo+IS+NOT+NULL&objectIds=&time=&geometry="+ encodeURI(JSON.stringify(arcPolygon))+"&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=true&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=json&token=", function( data ) {
            console.log(data.count);
            tempDataHTML += '<article class="initial"><span>INITIAL REGISTRATION</span> ' + data.count + '</article>';
            document.querySelector('.overall-number').innerHTML = tempDataHTML;
            totalRentalsNeighborhood += data.count;
            document.querySelector('.info-container > .total-rentals > p').innerHTML = totalRentalsNeighborhood;
          });
          $.getJSON("https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Rental_Inspections/FeatureServer/0/query?where=ACTION_DESCRIPTION%3D%27Issue+Renewal+Registration%27+AND+ParcelNo+IS+NOT+NULL&objectIds=&time=&geometry="+ encodeURI(JSON.stringify(arcPolygon))+"&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=true&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=json&token=", function( data ) {
            console.log(data.count);
            tempDataHTML += '<article class="renewal"><span>RENEWAL REGISTRATION</span> ' + data.count + '</article>';
            document.querySelector('.overall-number').innerHTML = tempDataHTML;
            totalRentalsNeighborhood += data.count;
            document.querySelector('.info-container > .total-rentals > p').innerHTML = totalRentalsNeighborhood;
          });
          $.getJSON("https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/Rental_Inspections/FeatureServer/0/query?where=ACTION_DESCRIPTION%3D%27Issue+City+C+of+C+-++Ord+18-03%27+AND+ParcelNo+IS+NOT+NULL&objectIds=&time=&geometry="+ encodeURI(JSON.stringify(arcPolygon))+"&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=true&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=json&token=", function( data ) {
            console.log(data.count);
            tempDataHTML += '<article class="cofc"><span>CITY C OF C</span> ' + data.count + '</article>';
            document.querySelector('.overall-number').innerHTML = tempDataHTML;
            totalRentalsNeighborhood += data.count;
            document.querySelector('.info-container > .total-rentals > p').innerHTML = totalRentalsNeighborhood;
          });
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
        console.log(parcelFeatures[0].properties);
        map.setFilter("parcel-fill-hover", ["==", "parcelno", parcelFeatures[0].properties.parcelno]);
        $.getJSON("https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/Rental_Inspections/FeatureServer/0/query?where="+ encodeURI("ParcelNo='"+parcelFeatures[0].properties.parcelno+"'")+"&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=ACTION_DESCRIPTION%2C+ParcelNo&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=json&token=", function( Rental_Inspections ) {
          console.log(Rental_Inspections);
          let tempParcelDataHTML = '';
          if(Rental_Inspections.features.length){
            if(Rental_Inspections.features[0].properties){
              tempParcelDataHTML += '<article class="info-items"><span>RENTAL STATUS</span> ';
              switch (Rental_Inspections.features[0].properties.ACTION_DESCRIPTION) {
                case 'Issue Initial Registration':
                  tempParcelDataHTML += '<initial><strong>' + Rental_Inspections.features[0].properties.ACTION_DESCRIPTION + '</strong></initial></article>';
                  break;
                case 'Issue Renewal Registration':
                  tempParcelDataHTML += '<renewal><strong>' + Rental_Inspections.features[0].properties.ACTION_DESCRIPTION + '</strong></renewal></article>';
                  break;
                default:
                  tempParcelDataHTML += '<cofc><strong>' + Rental_Inspections.features[0].properties.ACTION_DESCRIPTION + '</strong></cofc></article>';
              }
            }else{
              tempParcelDataHTML += '<article class="info-items"><span>RENTAL STATUS</span> ';
              switch (Rental_Inspections.features[0].attributes.ACTION_DESCRIPTION) {
                case 'Issue Initial Registration ':
                  tempParcelDataHTML += '<initial><strong>' + Rental_Inspections.features[0].attributes.ACTION_DESCRIPTION + '</strong></initial></article>';
                  break;
                case 'Issue Renewal Registration':
                  tempParcelDataHTML += '<renewal><strong>' + Rental_Inspections.features[0].attributes.ACTION_DESCRIPTION + '</strong></renewal></article>';
                  break;
                default:
                  tempParcelDataHTML += '<cofc><strong>' + Rental_Inspections.features[0].attributes.ACTION_DESCRIPTION + '</strong></cofc></article>';
              }
            }
            document.querySelector('.parcel-info.rental-info').innerHTML = tempParcelDataHTML;
            document.querySelector('.info-container > .rental').innerHTML = '<a href="https://app.smartsheet.com/b/form?EQBCT=efa41296fdc646dcadc3cbca2d6fd6ac" target="_blank"><article class="form-btn">SUBMIT A RENTER\'S COMPLAINT</article></a>';
            document.querySelector('.info-container > .not-rental').innerHTML = '';
          }else{
            tempParcelDataHTML += '<article class="info-items"><span>RENTAL STATUS</span> Not a Rental</article>';
            document.querySelector('.parcel-info.rental-info').innerHTML = tempParcelDataHTML;
            document.querySelector('.info-container > .not-rental').innerHTML = '<a href="https://app.smartsheet.com/b/form?EQBCT=7b3746bd20a048a5919ae07bd9ed89de" target="_blank"><article class="form-btn">REGISTER MY RENTAL</article></a>';
            document.querySelector('.info-container > .rental').innerHTML = '';
          }
        });
        $.getJSON("http://apis.detroitmi.gov/assessments/parcel/"+parcelFeatures[0].properties.parcelno.replace(/\./g,'_')+"/", function( parcel ) {
          console.log(parcel);
          document.querySelector('.info-container > .street-name').innerHTML = parcel.propstreetcombined;
          // tempParcelDataHTML += '<article class="info-items"><span>OWNER</span> ' + parcel.ownername1 + '</article>';
          // tempParcelDataHTML += '<article class="info-items"><span>BUILDING TYPE</span> ' + parcel.resb_style + '</article>';
          // tempParcelDataHTML += '<article class="info-items"><span>PARCEL NUMBER</span> ' + parcel.pnum + '</article>';
          // tempParcelDataHTML += '<article class="info-items"><span>YEAR BUILT</span> ' + parcel.resb_yearbuilt + '</article>';
          // document.querySelector('.parcel-info').innerHTML = tempParcelDataHTML;
          document.querySelector('.parcel-data.owner').innerHTML = '<div class="data-view-btn" data-view="owner" onclick="switchParcelDataViews(this)">OWNER\'S DATA <span>&#10095;</span></div>';
          document.querySelector('.parcel-data.building').innerHTML = '<div class="data-view-btn" data-view="building" onclick="switchParcelDataViews(this)">BUILDING\'S DATA <span>&#10095;</span></div>';
          parcelData['parcel-data'] = parcel;
        });
        (document.querySelector('#info').className === 'active') ? 0 : document.querySelector('#info').className = 'active';
        break;
      default:

      }
  });
})(window);
