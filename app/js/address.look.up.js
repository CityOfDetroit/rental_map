(function(){
  var startCalendarServices = function startCalendarServices() {
    let tempAddr = document.querySelector('#address-search').value.split(',')[0];
    tempAddr = tempAddr.split(' ');
    let newTempAddr = '';
    let size = tempAddr.length;
    tempAddr.forEach(function(item, index) {
      newTempAddr += item;
      ((index < size) && (index + 1) !== size) ? newTempAddr += '+': 0;
    });
    console.log(newTempAddr);
    $.getJSON('http://gis.detroitmi.gov/arcgis/rest/services/DoIT/AddressPointGeocoder/GeocodeServer/findAddressCandidates?Street='+ newTempAddr +'&ZIP=&Single+Line+Input=&category=&outFields=&maxLocations=&outSR=&searchExtent=&location=&distance=&magicKey=&f=json', function( data ) {
      let addressCoordinates = data.candidates[0].location;
      console.log(addressCoordinates.x);
      console.log(addressCoordinates.y);
      $.getJSON('http://gis.detroitmi.gov/arcgis/rest/services/Services/WastePickup/FeatureServer/0/query?where=&objectIds=&time=&geometry='+addressCoordinates.x+'%2C+'+addressCoordinates.y+'&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelWithin&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=json' , function( data ) {
        console.log(data);
      });
    });
    //startCalendar();
  };
  var addresSearch = document.getElementById('address-search');
  console.log(addresSearch);
  if(addresSearch !== null){
    addresSearch.addEventListener('keydown', function (e) {
      console.log(e);
      startCalendarServices();
    });
  }
  document.getElementById('search-btn').addEventListener('click', startCalendarServices);
})(window);
