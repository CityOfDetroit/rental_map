'use strict';
import styles from '!!raw-loader!./RentalMap.css';
import layers from './layers.json';

export default class RentalMap extends HTMLElement {
    static get observedAttributes() {
        return ['data-app-state', 'data-parcel-id', 'data-current-interaction', 'data-map-state', 'data-panel-data', 'data-active-boundaries', 'data-active-filters','data-language'];
    }

    constructor() {
        // Always call super first in constructor
        super();

        // Create a shadow root
        const shadow = this.attachShadow({ mode: 'open' });

        // Create result section
        const app = document.getElementsByTagName('rental-map');
        let tempState = app[0].getAttribute('data-app-state');

        this.mainData = {"name":"d6","data":"https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/bseed_building_rental_compliance_public_view/FeatureServer/0/query?where=cofc_records<>null&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson&token="};

        this.layers = layers;

        // Adding styles
        const appStyles = document.createElement('style');
        appStyles.textContent = styles;
        this.shadowRoot.appendChild(appStyles);

        // Creating app wrapper
        this.appWrapper = document.createElement('section');
        this.appWrapper.id = 'app-wrapper';
        shadow.appendChild(this.appWrapper);

        // create panel component
        this.panel = document.createElement('cod-drawer');
        this.panelHeader = document.createElement('div');
        this.panelHeader.setAttribute('slot','label');
        this.panel.id = 'd6-map-panel';
        this.panelHeader.innerText = 'Loading...';
        this.panel.appendChild(this.panelHeader);

        this.panelContent = document.createElement('article');
        this.panelContent.style.height = '150vh';
        this.panelContent.innerHTML = ``;
        this.panel.appendChild(this.panelContent);

        shadow.appendChild(this.panel);

        // create start screen
        this.startScreenContainer = document.createElement('article');
        this.startScreenContainer.id = 'welcome-container';
        this.startScreen = document.createElement('div');
        this.startScreen.setAttribute('data-id', 'd6-start-screen');
        this.startScreen.id = 'd6-start-screen';
        this.startScreen.innerHTML = `
        <p class="welcome-title">Welcome to the City of Detroit Rental Map</h5>
        <p>Please use this tool look up the status of a rental property. For more information, please visit the <a href="https://data.detroitmi.gov/datasets/residential-rental-registrations/explore" target="_blank">Detroit Open Data Portal</a>.</p>
        <p><strong>Note:</strong> For slow internet services, we recommend using our Rental Status Checker on the <a href="https://detroitmi.gov/departments/buildings-safety-engineering-and-environmental-department/bseed-divisions/property-maintenance/rental-property/rental-compliance-map" target="_blank">Rental Compliance Map</a> page.</p>
        `;
        this.closeStartScreenBtn = document.createElement('cod-button');
        this.closeStartScreenBtn.setAttribute('variant', 'primary');
        this.closeStartScreenBtn.innerText = 'Close';
        this.closeStartScreenBtn.addEventListener('click', (ev)=>{
            ev.target.parentElement.parentElement.className = 'close';
        });
        this.startScreen.appendChild(this.closeStartScreenBtn);
        this.startScreenContainer.appendChild(this.startScreen);

        shadow.appendChild(this.startScreenContainer);

        // Create map component
        let popupLayers = ["city-facilities"];
        let popupStructure = {"city-facilities":[{"type":"field-value","label":"Name:","value":"Facility"},{"type":"field-value","label":"Address:","value":"Address"}]}
        let tempMainData = {"id":"d6-business","layers":[{"name":"data-points","type":"circle","radius":7,"color":"#004445","active":true,"sort":15,"source":"data-points"}],"source":this.mainData.data,};
        this.map = document.createElement('cod-map');
        this.map.id = 'd6-map';
        this.map.setAttribute('data-parent-component', 'rental-map');
        this.map.setAttribute('data-map-mode', 'map-panel');
        this.map.setAttribute('data-center', "-83.103111,42.31103400000001");
        this.map.setAttribute('data-zoom', "11.5");
        this.map.setAttribute('data-popup-layers', JSON.stringify(popupLayers));
        this.map.setAttribute('data-popup-structure', JSON.stringify(popupStructure));
        // this.map.setAttribute('data-map-data', JSON.stringify(tempMainData));
        this.map.setAttribute('data-map-layers', JSON.stringify(this.layers.layers));
        this.map.setAttribute('data-location', this.getAttribute('data-location'));
        this.map.setAttribute('data-map-state', 'init');
        app[0].setAttribute('data-active-boundaries', 'coucil-district-6-lines');
        this.appWrapper.appendChild(this.map);

        // create geocoder component
        this.geocoderContainer = document.createElement('section');
        this.geocoderContainer.id = 'geocoder-box';
        this.geocoder = document.createElement('cod-geocoder');
        this.geocoder.setAttribute('data-parent-component', 'rental-map');
        this.geocoderContainer.appendChild(this.geocoder);

        this.appWrapper.appendChild(this.geocoderContainer);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // console.log(`App - attribute: ${name}, old: ${oldValue}, new: ${newValue}`);
        switch (name) {
            case 'data-active-filters':
                if(oldValue !== null){
                    const newFilters = newValue.split(',');
                    let url= this.buildQuery(newFilters);
                    const app = this;
                    fetch(url)
                    .then((resp) => resp.json()) // Transform the data into json
                    .then(function (data) {
                        (app.map.map.getSource('data-points')) ? app.map.map.getSource('data-points').setData(data) : 0;
                    }).catch(err => {
                    // console.log(err);
                    });
                }
                break;

            case 'data-active-boundaries':
                const oldBoundaries = oldValue.split(',');
                const newBoundaries = newValue.split(',');
                let boundariesDiff;
                if(newBoundaries.length > oldBoundaries.length){
                    boundariesDiff = this.arrayDifference(newBoundaries, oldBoundaries);
                    this.changeVisibility(boundariesDiff, 'visible', this.map);
                }else{
                    boundariesDiff = this.arrayDifference(oldBoundaries, newBoundaries);
                    this.changeVisibility(boundariesDiff, 'none', this.map);
                }
                break;
            
            case 'data-language':
                this.setAttribute('data-app-state', this.getAttribute('data-app-state'));
                break;

            case 'data-parcel-id':
                this.setAttribute('data-current-interaction', 'geocoder');
                break;

            case 'data-panel-data':
                this.setAttribute('data-current-interaction', 'map');
                break;
            
            case 'data-current-interaction':
                this.setAttribute('data-app-state', 'active-panel');
                break;

        
            default:
                this.loadApp(this);
                break;
        }
        
    }

    arrayDifference(arr1, arr2) {
        const difference = [];
     
        for (let i = 0; i < arr1.length; i++) {
            if (arr2.indexOf(arr1[i]) === -1) {
                difference.push(arr1[i]);
            }
        }
     
        return difference;
    }

    changeVisibility(layers, visibility, _map){
        layers.forEach(layer => {
          _map.map.setLayoutProperty(layer, "visibility", visibility);
        });
    }

    clearApp(app) {
        const shadow = app.shadowRoot;
        while (shadow.firstChild) {
            shadow.removeChild(shadow.firstChild);
        }
    }

    updateBoundaries(ev){
        const app = document.getElementsByTagName('rental-map');
        let boundaries = (app[0].getAttribute('data-active-boundaries') === null) ? '' : app[0].getAttribute('data-active-boundaries');
        let tempBoundaries = boundaries.split(',');
        boundaries = [];
        if(ev.target.formCheck.checked){
            boundaries = tempBoundaries;
            boundaries.push(ev.target.formCheck.value);
        }else{
            let multiLayers = ev.target.formCheck.value.split(',');
            tempBoundaries.forEach((boundary) => {
                (multiLayers.includes(boundary)) ? 0 : boundaries.push(boundary);
            });
        }
        boundaries = boundaries.join(',');
        app[0].setAttribute('data-active-boundaries', boundaries);
    }

    updateMainData(ev){
        const app = document.getElementsByTagName('rental-map');
        let filters = (app[0].getAttribute('data-active-filters') === null) ? '' : app[0].getAttribute('data-active-filters');
        let tempFilters = filters.split(',');
        filters = [];
        if(ev.target.formCheck.checked){
            filters = tempFilters;
            filters.push(ev.target.formCheck.value);
        }else{
            let multiLayers = ev.target.formCheck.value.split(',');
            tempFilters.forEach((filter) => {
                (multiLayers.includes(filter)) ? 0 : filters.push(filter);
            });
        }
        filters = filters.join(',');
        app[0].setAttribute('data-active-filters', filters);
    }

    loadApp(app) {
        const shadow = app.shadowRoot;
        const appWrapper = document.createElement('div');
        appWrapper.id = 'app-wrapper';
        const currentLanguage = app.getAttribute('data-language');
        const currenBoundaries = app.getAttribute('data-active-boundaries').split(',');
        let currenFilters = [];
        (app.getAttribute('data-active-filters') != null) ? currenFilters = app.getAttribute('data-active-filters').split(',') : 0;
        switch (app.getAttribute('data-app-state')) {
            case 'start-screen':
                break;
            case 'active-panel':
                let currentInteraction = this.getAttribute('data-current-interaction');
                //console.log(JSON.parse(this.getAttribute('data-parcel-id')));
                let tempData = null;
                //console.log(tempData);
                if(currentInteraction == 'geocoder'){
                    tempData = JSON.parse(this.getAttribute('data-parcel-id'));
                    //console.log(tempData);
                    const tempPanelHeader = this.panelHeader;
                    const tempPanelContent = this.panelContent;
                    tempPanelHeader.innerHTML = '';
                    tempPanelContent.innerHTML = `<cod-loader data-color="color-1"></cod-loader>`;
                    fetch(`https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/bseed_building_rental_compliance_public_view/FeatureServer/0/query?where=building_id%3D%27${tempData.attributes.building_id}%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=3&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=json`)
                    .then((resp) => resp.json()) // Transform the data into json
                    .then(function(rentalData) {
                        if(rentalData.features.length){
                            //console.log(rentalData);
                            if(rentalData.features[0].attributes.cofc_records){
                                tempPanelHeader.innerHTML = `<div class="panel-title">${tempData.attributes.StAddr}</div>`
                                tempPanelContent.innerHTML = `
                                <div class="group">
                                    <span class="header">COMPLIANCE STATUS</span>
                                    <p class="valid">
                                    <span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                    <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
                                    </svg>
                                    </span> APPROVED FOR RENTAL</p>
                                    <p><strong>Certificate of Compliance</strong></p>
                                    <p><strong>Record(s):</strong> ${rentalData.features[0].attributes.cofc_records}</p>
                                    <p><strong>Address:</strong> ${rentalData.features[0].attributes.cofc_addresses}</p>
                                    <p><strong>Issued:</strong> ${rentalData.features[0].attributes.current_cofc_issued_date}</p>
                                    <p><strong>Expiration:</strong> ${rentalData.features[0].current_cofc_expired_date}</p>

                                    <p><strong>Rental Registration</strong></p>
                                    <p><strong>Record(s):</strong> ${rentalData.features[0].attributes.reg_records}</p>
                                    <p><strong>Address:</strong> ${rentalData.features[0].attributes.reg_addresses}</p>
                                    <p><strong>Issued:</strong> ${rentalData.features[0].attributes.current_reg_issued_date}</p>
                                </div>
                                `;
                            }else{
                                tempPanelHeader.innerHTML = `<div class="panel-title">${tempData.attributes.StAddr}</div>`
                                tempPanelContent.innerHTML = `
                                <div class="group">
                                    <span class="header">COMPLIANCE STATUS</span>
                                    <p class="valid"><span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                    <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
                                    </svg>
                                    </span> Registered</p>
                                    <p class="invalid"><span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                                    </svg>
                                    </span> Compliance</p>

                                    <p><strong>Rental Registration</strong></p>
                                    <p><strong>Record(s):</strong> ${rentalData.features[0].attributes.reg_records}</p>
                                    <p><strong>Address:</strong> ${rentalData.features[0].attributes.reg_addresses}</p>
                                    <p><strong>Issued:</strong> ${rentalData.features[0].attributes.current_reg_issued_date}</p>
                                </div>
                                <p style="font-size:1.25em">Apply for rental escrow program by calling <a href="tel:8663132520">866-313-2520</a></p>
                                `;
                            }
                            
                        }else{
                            tempPanelHeader.innerHTML = `<div class="panel-title">${tempData.attributes.StAddr}</div>`
                            tempPanelContent.innerHTML = `
                            <div class="group">
                            <span class="header">COMPLIANCE STATUS</span>
                            <p>NOT APPROVED RENTAL</p>
                            <p class="invalid"><span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                            </svg>
                            </span> Registered</p>
                            <p class="invalid"><span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                            </svg>
                            </span> Compliance</p>
                            </div>
                            <p style="font-size:1.25em">Apply for rental escrow program by calling <a href="tel:8663132520">866-313-2520</a></p>
                            `;
                        }
                        app.map.setAttribute('data-location', JSON.stringify(tempData));
                    });
                    
                }else{
                    tempData = JSON.parse(this.getAttribute('data-panel-data'));
                    if(tempData.properties.cofc_records){
                    this.panelHeader.innerHTML = `<div class="panel-title">${tempData.properties.cofc_addresses}</div>`;
                    this.panelContent.innerHTML = `
                    <div class="group">
                        <span class="header">COMPLIANCE STATUS</span>
                        <p class="valid">
                        <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                        <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
                        </svg>
                        </span> APPROVED FOR RENTAL</p>
                        <p><strong>Certificate of Compliance</strong></p>
                        <p><strong>Record(s):</strong> ${tempData.properties.cofc_records}</p>
                        <p><strong>Address:</strong> ${tempData.properties.cofc_addresses}</p>
                        <p><strong>Issued:</strong> ${tempData.properties.current_cofc_issued_date}</p>
                        <p><strong>Expiration:</strong> ${tempData.properties.current_cofc_expired_date}</p>

                        <p><strong>Rental Registration</strong></p>
                        <p><strong>Record(s):</strong> ${tempData.properties.reg_records}</p>
                        <p><strong>Address:</strong> ${tempData.properties.reg_addresses}</p>
                        <p><strong>Issued:</strong> ${tempData.properties.current_reg_issued_date}</p>
                    </div>
                    `;
                }else{
                    const tempPanelHeader = this.panelHeader;
                    const tempPanelContent = this.panelContent;
                    tempPanelHeader.innerHTML = '';
                    tempPanelContent.innerHTML = `<cod-loader data-color="color-1"></cod-loader>`;
                    fetch(`https://services2.arcgis.com/qvkbeam7Wirps6zC/ArcGIS/rest/services/bseed_building_rental_compliance_public_view/FeatureServer/0/query?where=building_id%3D%27${tempData.properties.building_id}%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=3&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=json`)
                    .then((resp) => resp.json()) // Transform the data into json
                    .then(function(rentalData) {
                        if(rentalData.features.length){
                            //console.log(rentalData);
                            if(rentalData.features[0].attributes.cofc_records){
                                tempPanelHeader.innerHTML = `<div class="panel-title">${rentalData.features[0].attributes.cofc_addresses}</div>`
                                tempPanelContent.innerHTML = `
                                <div class="group">
                                    <span class="header">COMPLIANCE STATUS</span>
                                    <p class="valid">
                                    <span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                    <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
                                    </svg>
                                    </span> APPROVED FOR RENTAL</p>
                                    <p><strong>Certificate of Compliance</strong></p>
                                    <p><strong>Record(s):</strong> ${rentalData.features[0].attributes.cofc_records}</p>
                                    <p><strong>Address:</strong> ${rentalData.features[0].attributes.cofc_addresses}</p>
                                    <p><strong>Issued:</strong> ${rentalData.features[0].attributes.current_cofc_issued_date}</p>
                                    <p><strong>Expiration:</strong> ${rentalData.features[0].current_cofc_expired_date}</p>

                                    <p><strong>Rental Registration</strong></p>
                                    <p><strong>Record(s):</strong> ${rentalData.features[0].attributes.reg_records}</p>
                                    <p><strong>Address:</strong> ${rentalData.features[0].attributes.reg_addresses}</p>
                                    <p><strong>Issued:</strong> ${rentalData.features[0].attributes.current_reg_issued_date}</p>
                                </div>
                                `;
                            }else{
                                tempPanelHeader.innerHTML = `<div class="panel-title">${rentalData.features[0].attributes.reg_addresses}</div>`
                                tempPanelContent.innerHTML = `
                                <div class="group">
                                    <span class="header">COMPLIANCE STATUS</span>
                                    <p class="valid"><span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                    <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
                                    </svg>
                                    </span> Registered</p>
                                    <p class="invalid"><span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                                    </svg></span> Compliance</p>

                                    <p><strong>Rental Registration</strong></p>
                                    <p><strong>Record(s):</strong> ${rentalData.features[0].attributes.reg_records}</p>
                                    <p><strong>Address:</strong> ${rentalData.features[0].attributes.reg_addresses}</p>
                                    <p><strong>Issued:</strong> ${rentalData.features[0].attributes.current_reg_issued_date}</p>
                                </div>
                                <p style="font-size:1.25em">Apply for rental escrow program by calling <a href="tel:8663132520">866-313-2520</a></p>
                                `;
                            }
                            
                        }else{
                            tempPanelHeader.innerHTML = `<div class="panel-title">Building ID - ${tempData.properties.building_id}</div>`
                            tempPanelContent.innerHTML = `
                            <div class="group">
                            <span class="header">COMPLIANCE STATUS</span>
                            <p>NOT APPROVED RENTAL</p>
                            <p class="invalid"><span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                            </svg>
                            </span> Registered</p>
                            <p class="invalid"><span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                            </svg>
                            </span> Compliance</p>
                            </div>
                            <p>There are no Current Certificates of Compliance found for this building. <a href="https://detroitmi.gov/departments/buildings-safety-engineering-and-environmental-department/bseed-divisions/property-maintenance/rental-property-information/rental-property-escrow">Click here for more information.</a></p>
                            `;
                        }
                    });
                }
                }
                
                this.panel.setAttribute('open', 'true');
                break;

            case 'error':
                display.setAttribute('data-display-type', 'error');
                appWrapper.appendChild(display);
                break;

            case 'print':
                display.setAttribute('data-display-type', 'print');
                appWrapper.appendChild(display);
                break;

            default:
                break;
        }
        if (shadow.firstChild == null) {
            shadow.appendChild(appWrapper);
        }
    }
}
