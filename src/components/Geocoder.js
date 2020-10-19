import * as turf from '@turf/turf';
import './Geocoder.scss';
export default class Geocoder {
  constructor(container, _controller) {
    this.form = null;
    this._controller = _controller;
    this.init(document.getElementById(container), this);
  }

  init(container, geocoder){
    
    let form = document.createElement('form');
    let label = document.createElement('label');
    let input = document.createElement('input');
    let suggestions = document.createElement('ul');
    let list = document.createElement('datalist');
    let icon = document.createElement('i');
    form.addEventListener('submit', (ev) => {
        this.submit(ev, geocoder);
    });
    icon.className = 'fas fa-map-marker-alt';
    label.innerText = "Find My Home:";
    label.setAttribute("for", "geocoder-input"); 
    input.type = 'text';
    input.setAttribute('list','addresses-list');
    input.placeholder = 'Enter address';
    input.setAttribute('id', 'geocoder-input');
    input.setAttribute('autocomplete', 'off');
    input.addEventListener('keyup', (ev)=>{
        this.inputChange(ev, geocoder);
    });
    list.setAttribute('id','addresses-list');
    

    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(icon);
    // form.appendChild(suggestions);
    form.appendChild(list);
    container.appendChild(form);
    this.form = form;
  }

  supplementGeocoder(address, geocoder, type){
    let tempAddr = address.split(",");
    tempAddr = tempAddr[0];
    tempAddr = tempAddr.split(" ");
    let newTempAddr = '';
    let size = tempAddr.length;
    tempAddr.forEach(function(item, index) {
      newTempAddr += item;
      ((index < size) && (index + 1) !== size) ? newTempAddr += '+': 0;
    });
    let url = `https://gis.detroitmi.gov/arcgis/rest/services/DoIT/CompositeGeocoder/GeocodeServer/findAddressCandidates?Street=&City=&ZIP=&SingleLine=${newTempAddr}&category=&outFields=User_fld&maxLocations=4&outSR=4326&searchExtent=&location=&distance=&magicKey=&f=json`;
    
    try {
        fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function(data) {
            // console.log(data);
            if(type === 'suggestions'){
                data.candidates.forEach((item)=>{
                    let sugg = document.createElement('option');
                    if(item.attributes.User_fld === ''){
                        sugg.value = item.address;
                        sugg.setAttribute('data-parsel', 'no-parcel');
                    }else{
                        sugg.value = `${item.address} RECOMMENDED`;
                        sugg.setAttribute('data-parsel', item.attributes.User_fld);
                    }
                    
                    sugg.onclick = (ev) => {
                        geocoder.selectSuggestion(ev, geocoder);
                    }
                    geocoder.form.childNodes[3].appendChild(sugg);
                });
            }else{
                let url = `https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/City_of_Detroit_Boundary/FeatureServer/0/query?where=&objectIds=&time=&geometry=${data.candidates[0].location.x}%2C+${data.candidates[0].location.y}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=4326&returnGeometry=true&returnCentroid=false&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=`;
                try {
                    fetch(url)
                    .then((resp) => resp.json()) // Transform the data into json
                    .then(function(city) {
                        if(city.features.length){
                            geocoder._controller.panel.createErrorMsg(geocoder._controller.panel);
                            let parcel = null;
                            let location;
                            data.candidates.forEach((item) => {
                                if(item.attributes.User_fld !== ''){
                                    if(geocoder._controller.checkParcelValid(item.attributes.User_fld)){
                                        parcel = item;
                                    }
                                }
                            });
                            (parcel == null) ? location = data.candidates[0].location : location = null;
                            let point = turf.point([parcel.location.x, parcel.location.y]);
                            geocoder._controller.panel.data = {
                                address : parcel.address,
                                parcel: parcel.attributes.User_fld,
                                date: null,
                                type: null
                            }
                            geocoder._controller.queryLayer(geocoder._controller,point);
                        }else{
                            geocoder._controller.panel.createErrorMsg(geocoder._controller.panel);
                        }
                    });
                }catch (error) {
                    geocoder._controller.panel.createErrorMsg(geocoder._controller.panel);
                }
            }
        });
    } catch (error) {
        geocoder._controller.panel.createErrorMsg(geocoder._controller.panel);
    }
  }

  selectSuggestion(ev, geocoder){
    let selection = null;
    if(ev.target.tagName === 'SPAN'){
        selection = ev.target.parentNode;
    }else{
        selection = ev.target;
    }
    if(selection.attributes[0].value === 'no-parcel'){
        geocoder.clearSuggestions(geocoder);
        geocoder.supplementGeocoder(selection.innerText, geocoder, 'submit');
    }else{
        geocoder.supplementGeocoder(selection.innerText, geocoder, 'submit');
    }
  }

  inputChange (ev, geocoder){
    switch (ev.key) {
        case 'Enter':
            (ev.target.value != '' && ev.target.value != undefined) ? geocoder.supplementGeocoder(ev.target.value, geocoder, 'submit') : 0;
            break;
    
        case 'ArrowDown':

            break;

        case 'ArrowUp':

            break;

        case 'ArrowRight':

            break;

        case 'ArrowLeft':

            break;

        case undefined:
            (ev.target.value != '' && ev.target.value != undefined) ? geocoder.supplementGeocoder(ev.target.value, geocoder, 'submit') : 0;
            break;

        default:
            geocoder.clearSuggestions(geocoder);
            geocoder.supplementGeocoder(ev.target.value, geocoder, 'suggestions');
            break;
    }
  }

  clearSuggestions(geocoder){
    while (geocoder.form.childNodes[3].firstChild) {
        geocoder.form.childNodes[3].removeChild(geocoder.form.childNodes[3].firstChild);
    }
  }

  submit(ev, geocoder){
      ev.preventDefault();
      geocoder.supplementGeocoder(ev.target['0'].value, geocoder, 'submit');
  }
}