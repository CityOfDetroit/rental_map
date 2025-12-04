'use strict';
import styles from '!!raw-loader!./Geocoder.css';
export default class Geocoder extends HTMLElement {
  static get observedAttributes() {
    return ['form', 'parcelStatus', 'user'];
  }

  constructor() {
    // Always call super first in constructor
    super();

    // Set Attributes
    this.form = null;
    this.parcelStatus = 'Invalid';
    this.user = null;
    this.styles = document.createElement('style');
    this.styles.textContent = styles;

    // Create a shadow root
    const shadow = this.attachShadow({ mode: 'open' });

    // Create geocoder section
    shadow.appendChild(this.styles);
    const geocoderWraper = document.createElement('article');
    geocoderWraper.id = 'geocoder';

    const form = document.createElement('form');

    const label = document.createElement('label');
    label.style.fontFamily = 'Montserrat, sans-serif';
    label.style.fontWeight = 'bold';

    const input = document.createElement('input');

    const list = document.createElement('datalist');

    const icon = document.createElement('i');
    form.addEventListener('submit', (ev) => {
      this.submit(ev, this);
    });
    icon.className = 'fas fa-map-marker-alt';
    // Get label text
    const app = document.getElementsByTagName('my-home-info');
    label.innerText = 'Property Address:';
    try {
      if (app[0].getAttribute('data-geocoder-label')) {
        // TODO: Fix old ESLint errors - see issue #1099
        // eslint-disable-next-line eqeqeq
        if (app[0].getAttribute('data-geocoder-label') != '') {
          label.innerText = app[0].getAttribute('data-geocoder-label');
        }
      }
    } catch (error) {
      // Continue regardless of error.
    }
    label.setAttribute('for', 'geocoder-input');
    input.type = 'text';
    input.setAttribute('list', 'addresses-list');
    input.placeholder = 'Enter address';
    input.setAttribute('id', 'geocoder-input');
    input.setAttribute('autocomplete', 'off');
    input.addEventListener('keyup', (ev) => {
      this.inputChange(ev, this);
    });
    list.setAttribute('id', 'addresses-list');

    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(icon);
    form.appendChild(list);
    this.form = form;
    geocoderWraper.appendChild(form);
    shadow.appendChild(geocoderWraper);
  }

  supplementGeocoder(address, geocoder, type) {
    const parentComponent = geocoder.getAttribute('data-parent-component');
    let app = null;
    (parentComponent) ? app = document.getElementsByTagName(parentComponent) : app = document.getElementsByTagName('my-home-info');
    let tempAddr = address.split(',');
    tempAddr = tempAddr[0];
    tempAddr = tempAddr.split(' ');
    let newTempAddr = '';

    const size = tempAddr.length;
    tempAddr.forEach(function (item, index) {
      newTempAddr += item;
      index < size && index + 1 !== size ? (newTempAddr += '+') : 0;
    });

    const url = `https://opengis.detroitmi.gov/opengis/rest/services/BaseUnits/BaseUnitGeocoder/GeocodeServer/findAddressCandidates?Address=&Address2=&Address3=&Neighborhood=&City=&Subregion=&Region=&Postal=&PostalExt=&CountryCode=&SingleLine=${newTempAddr}&outFields=*&maxLocations=&matchOutOfRange=true&langCode=&locationType=&sourceCountry=&category=&location=&distance=&searchExtent=&outSR=&magicKey=&f=json`;

    try {
      fetch(url)
        .then((resp) => resp.json()) // Transform the data into json
        .then(function (data) {
          // console.log(data);
          if (type === 'suggestions') {
            data.candidates.forEach((item) => {
              const sugg = document.createElement('option');
              if (item.attributes.parcel_id === '') {
                sugg.value = item.address;
                sugg.setAttribute('data-parsel', 'no-parcel');
              } else {
                sugg.value = `${item.address} RECOMMENDED`;
                sugg.setAttribute('data-parsel', item.attributes.parcel_id);
              }

              sugg.onclick = (ev) => {
                geocoder.selectSuggestion(ev, geocoder);
              };
              geocoder.form.childNodes[3].appendChild(sugg);
            });
          } else {
            if (data.candidates.length) {
              const url = `https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/City_of_Detroit_Boundary/FeatureServer/0/query?where=&objectIds=&time=&geometry=${data.candidates[0].location.x}%2C+${data.candidates[0].location.y}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=4326&returnGeometry=true&returnCentroid=false&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=geojson&token=`;
              try {
                fetch(url)
                  .then((resp) => resp.json()) // Transform the data into json
                  .then(function (city) {
                    if (city.features.length) {
                      let parcel = null;
                      let location;
                      data.candidates.forEach((item) => {
                        if (item.attributes.parcel_id !== '') {
                          if (
                            geocoder.checkParcelValid(item.attributes.parcel_id)
                          ) {
                            parcel = item;
                          }
                        }
                      });

                      // TODO: Fix old ESLint errors - see issue #1099
                      // eslint-disable-next-line eqeqeq
                      parcel == null
                        ? (location = data.candidates[0].location)
                        : (location = null);
                      if (parcel === null) {
                        geocoder.parcelStatus = 'Invalid';
                        geocoder.needGeocode(address, geocoder, location);
                        geocoder.clearSuggestions(geocoder);
                        app[0].setAttribute(
                          'data-parcel-id',
                          JSON.stringify(data.candidates[0]),
                        );
                        geocoder.form.reset();
                        // geocoder.controller.panel.loaderToggle(true);
                        // geocoder.controller.panel.clearPanel();
                        // geocoder.controller.dataManager.buildData(data.candidates[0], geocoder.controller);
                      } else {
                        geocoder.parcelStatus = 'Valid';
                        geocoder.needGeocode(address, geocoder, location);
                        geocoder.clearSuggestions(geocoder);
                        console.log(app);
                        app[0].setAttribute(
                          'data-parcel-id',
                          JSON.stringify(parcel),
                        );
                        geocoder.form.reset();
                        // geocoder.controller.panel.loaderToggle(true);
                        // geocoder.controller.panel.clearPanel();
                        // geocoder.controller.dataManager.buildData(parcel, geocoder.controller);
                      }
                    } else {
                      geocoder.parcelStatus = 'Invalid';
                      geocoder.needGeocode(address, geocoder, location);
                      geocoder.clearSuggestions(geocoder);
                      app[0].setAttribute('data-app-state', 'error');
                    }
                  });
              } catch (error) {
                geocoder.parcelStatus = 'Invalid';
                geocoder.needGeocode(address, geocoder, location);
                geocoder.clearSuggestions(geocoder);
                app[0].setAttribute('data-app-state', 'error');
              }
            } else {
              geocoder.parcelStatus = 'Invalid';
              geocoder.needGeocode(address, geocoder, location);
              geocoder.clearSuggestions(geocoder);
              app[0].setAttribute('data-app-state', 'error');
            }
          }
        });
    } catch (error) {
      geocoder.parcelStatus = 'Invalid';
      geocoder.needGeocode(address, geocoder, location);
      geocoder.clearSuggestions(geocoder);
      app[0].setAttribute('data-app-state', 'error');
    }
  }

  selectSuggestion(ev, geocoder) {
    let selection = null;
    if (ev.target.tagName === 'SPAN') {
      selection = ev.target.parentNode;
    } else {
      selection = ev.target;
    }
    if (selection.attributes[0].value === 'no-parcel') {
      geocoder.clearSuggestions(geocoder);
      geocoder.supplementGeocoder(selection.innerText, geocoder, 'submit');
    } else {
      geocoder.supplementGeocoder(selection.innerText, geocoder, 'submit');
    }
  }

  inputChange(ev, geocoder) {
    switch (ev.key) {
      case 'Enter':
        // TODO: Fix old ESLint errors - see issue #1099
        // eslint-disable-next-line eqeqeq
        ev.target.value != '' && ev.target.value != undefined
          ? geocoder.supplementGeocoder(ev.target.value, geocoder, 'submit')
          : 0;
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
        // TODO: Fix old ESLint errors - see issue #1099
        // eslint-disable-next-line eqeqeq
        ev.target.value != '' && ev.target.value != undefined
          ? geocoder.supplementGeocoder(ev.target.value, geocoder, 'submit')
          : 0;
        break;

      default:
        geocoder.clearSuggestions(geocoder);
        geocoder.supplementGeocoder(ev.target.value, geocoder, 'suggestions');
        break;
    }
  }

  clearSuggestions(geocoder) {
    while (geocoder.form.childNodes[3].firstChild) {
      geocoder.form.childNodes[3].removeChild(
        geocoder.form.childNodes[3].firstChild,
      );
    }
  }

  needGeocode(address, geocoder, location) {
    fetch(
      'https://us-central1-local-services-loopkup.cloudfunctions.net/getToken',
    )
      .then((resp) => resp.json()) // Transform the data into json
      .then(function (data) {
        const cleanAddress = address.split(' RECOMMENDED')[0];

        const params = [
          {
            attributes: {
              valid_parcel_status: geocoder.parcelStatus,
              user_input: cleanAddress,
            },
            geometry: {
              x: 0,
              y: 0,
            },
          },
        ];

        // TODO: Fix old ESLint errors - see issue #1099
        // eslint-disable-next-line eqeqeq
        if (location != null) {
          params[0].geometry.x = location.x;
          params[0].geometry.y = location.y;
        }

        const request = new Request(
          `https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/addressvalidator/FeatureServer/0/addFeatures?token=${
            data.access_token
          }&features=${encodeURIComponent(JSON.stringify(params))}&f=json`,
          {
            method: 'POST',
            body: '',
            headers: new Headers(),
            mode: 'cors',
            cache: 'default',
          },
        );

        fetch(request).then((_res) => {
          // console.log(_res);
        });
      });
  }

  checkParcelValid(parcel) {
    return /\d/.test(parcel);
  }

  submit(ev, geocoder) {
    ev.preventDefault();
    geocoder.supplementGeocoder(ev.target['0'].value, geocoder, 'submit');
  }
}
