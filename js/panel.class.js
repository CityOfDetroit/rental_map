'use strict';
const moment = require('moment');
export default class Panel {
  constructor() {
  }

  creatPanel(type, controller, data = null, active = false, certified = false, occupied = false){
    let markup = '';
    switch (type) {
      case 'initial':
        document.querySelector('.info-container .info').innerHTML = `Welcome to the Detroit Rental Dashboard. Please use this tool
        look up the status of a rental property. For more information, please
        visit the <a href="https://data.detroitmi.gov/datasets/rental-registrations" target="_blank">Detroit Open Data Portal</a>.`;
        document.querySelector('.info-container > .rental').innerHTML = ``;
        break;
      case 'district':

        break;
      case 'parcel':
        markup = controller.panel.createMarkup(type, controller, data, active, certified, occupied);
        document.querySelector('.info-container .info').innerHTML = '';
        break;
      case 'rental':
        markup = controller.panel.createMarkup(type, controller, data, active, certified, occupied);
        document.querySelector('.info-container .info').innerHTML = '';
        break;
      default:

    }
    // console.log(markup);
    document.querySelector('.info-container .parcel-info.rental-info').innerHTML = markup;
    let parcelDataBtns = document.querySelectorAll('.data-view-btn');
    if(parcelDataBtns.length){
      parcelDataBtns.forEach(function(btn){
        btn.addEventListener('click', function(e){
          controller.switchParcelDataViews(e, controller);
        });
      });
    }
    document.querySelector('#info').className = 'active';
  }
  createMarkup(type, controller, data, active, certified, occupied){
    // console.log(data);
    let tempHTML = null;
    switch (type) {
      case 'rental':
        console.log('rental');
        tempHTML = `
        <article class="info-items">
          <span>COMPLIANCE STATUS</span>
          ${certified != false ? `<i class="far fa-check-circle"></i> <item>APPROVED FOR RENTAL</item>` : `NOT APPROVED RENTAL<br><i class="far fa-check-circle"></i>" alt="check"> <item>Registered on ${moment(data.properties.csa_date3).format('MMM Do,YYYY')}</item><br><i class="far fa-times-circle"></i> <item>Compliance</item></article>`}
        </article>
        ${controller.defaultSettings.escrows.includes(data.zipcode) ? `escrow`:`not escrow`}
         ${data.zipcode === '48215' ? `
         <article class="info-items">
          <span>ENFORCEMENT DATES</span>
          <item>Must be Registered by May 1st, 2018</item><br>
          <item>Must be Compliant by Aug 1st, 2018</item>
         </article>` : ``}
         ${data.zipcode === '48224' ? `
         <article class="info-items">
          <span>ENFORCEMENT DATES</span>
          <item>Must be Registered by Jun 1st, 2018</item><br>
          <item>Must be Compliant by Sep 1st, 2018</item>
         </article>` : ``}
         ${data.zipcode === '48223' ? `
         <article class="info-items">
          <span>ENFORCEMENT DATES</span>
          <item>Must be Registered by Aug 1st, 2018</item><br>
          <item>Must be Compliant by Nov 1st, 2018</item>
         </article>` : ``}
         ${data.zipcode === '48219' ? `
         <article class="info-items">
          <span>ENFORCEMENT DATES</span>
          <item>Must be Registered by Sep 1st, 2018</item><br>
          <item>Must be Compliant by Dec 1st, 2018</item>
         </article>` : ``}
         ${data.zipcode === '48209' ? `
         <article class="info-items">
          <span>ENFORCEMENT DATES</span>
          <item>Must be Registered by Oct 1st, 2018</item><br>
          <item>Must be Compliant by Jan 1st, 2019</item>
         </article>` : ``}
         ${data.zipcode === '48210' ? `
         <article class="info-items">
          <span>ENFORCEMENT DATES</span>
          <item>Must be Registered by Nov 1st, 2018</item><br>
          <item>Must be Compliant by Feb 1st, 2019</item>
         </article>` : ``}
         `;
        document.querySelector('.info-container > .rental').innerHTML = `<a href="https://app.smartsheet.com/b/form/efa41296fdc646dcadc3cbca2d6fd6ac" target="_blank"><article class="form-btn">SUBMIT RENTAL COMPLAINT</article></a>`;

        document.querySelector('.parcel-data.owner').innerHTML = '<div class="data-view-btn" data-view="owner">OWNER INFORMATION <span>&#10095;</span></div>';

        document.querySelector('.parcel-data.building').innerHTML = '<div class="data-view-btn" data-view="building">PROPERTY INFORMATION <span>&#10095;</span></div>';

        document.querySelector('.street-name').innerText = controller.parcelData.propaddr;
        break;
      case 'parcel':
        // console.log('parcel');
        // console.log(occupied);
        tempHTML = `
        <article class="info-items">
          <span>COMPLIANCE STATUS</span>
          ${certified == true ? `<i class="far fa-check-circle"></i> <item>APPROVED FOR RENTAL</item>` : `${occupied ? `${data.register ? `<i class="far fa-check-circle"></i> <item>APPROVED FOR RENTAL</item>`:`NOT APPROVED RENTAL<br><i class="far fa-times-circle"></i> <item>Registered</item>`}`:`NOT APPROVED RENTAL<br>${data.register == true ? `<i class="far fa-check-circle"></i> <item>Registered</item><br>`:`<i class="far fa-times-circle"></i> <item>Registered</item><br>`}<i class="far fa-times-circle"></i> <item>Compliance</item></article>`}`}
        </article>
        ${data.zipcode === '48215' ? `
        <article class="info-items">
         <span>ENFORCEMENT DATES</span>
         <item>Must be Registered by May 1st, 2018</item><br>
         <item>Must be Compliant by Aug 1st, 2018</item>
         ${!certified ? `${occupied ? `${data.register ? ``: `<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:`<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:``}
        </article>` : ``}
        ${data.zipcode === '48224' ? `
        <article class="info-items">
         <span>ENFORCEMENT DATES</span>
         <item>Must be Registered by Jun 1st, 2018</item><br>
         <item>Must be Compliant by Sep 1st, 2018</item>
         ${!certified ? `${occupied ? `${data.register ? ``: `<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:`<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:``}
        </article>` : ``}
        ${data.zipcode === '48223' ? `
        <article class="info-items">
         <span>ENFORCEMENT DATES</span>
         <item>Must be Registered by Oct 4th, 2018</item><br>
         <item>Must be Compliant by Jan 2nd, 2019</item>
         ${!certified ? `${occupied ? `${data.register ? ``: `<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:`<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:``}
        </article>` : ``}
        ${data.zipcode === '48219' ? `
        <article class="info-items">
         <span>ENFORCEMENT DATES</span>
         <item>Must be Registered by Nov 3rd, 2018</item><br>
         <item>Must be Compliant by Feb 1st, 2019</item>
         ${!certified ? `${occupied ? `${data.register ? ``: `<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:`<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:``}
        </article>` : ``}
        ${data.zipcode === '48209' ? `
        <article class="info-items">
         <span>ENFORCEMENT DATES</span>
         <item>Must be Registered by Jan 31st, 2019</item><br>
         <item>Must be Compliant by May 1st, 2019</item>
         ${!certified ? `${occupied ? `${data.register ? ``: `<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:`<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:``}
        </article>` : ``}
        ${data.zipcode === '48210' ? `
        <article class="info-items">
         <span>ENFORCEMENT DATES</span>
         <item>Must be Registered by Mar 5th, 2019</item><br>
         <item>Must be Compliant by Jun 3rd, 2019</item>
         ${!certified ? `${occupied ? `${data.register ? ``: `<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:`<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:``}
        </article>` : ``}
        ${data.zipcode === '48206' ? `
        <article class="info-items">
         <span>ENFORCEMENT DATES</span>
         <item>Must be Registered by Jun 5th, 2019</item><br>
         <item>Must be Compliant by Sep 3rd, 2019</item>
         ${!certified ? `${occupied ? `${data.register ? ``: `<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:`<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:``}
        </article>` : ``}
        ${data.zipcode === '48214' ? `
        <article class="info-items">
         <span>ENFORCEMENT DATES</span>
         <item>Must be Registered by Jun 5th, 2019</item><br>
         <item>Must be Compliant by Sep 3rd, 2019</item>
         ${!certified ? `${occupied ? `${data.register ? ``: `<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:`<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:``}
        </article>` : ``}
        ${data.zipcode === '48202' ? `
        <article class="info-items">
         <span>ENFORCEMENT DATES</span>
         <item>Must be Registered by Jul 3rd, 2019</item><br>
         <item>Must be Compliant by Oct 1st, 2019</item>
         ${!certified ? `${occupied ? `${data.register ? ``: `<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:`<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:``}
        </article>` : ``}
        ${data.zipcode === '48204' ? `
        <article class="info-items">
         <span>ENFORCEMENT DATES</span>
         <item>Must be Registered by Jul 3rd, 2019</item><br>
         <item>Must be Compliant by Oct 1st, 2019</item>
         ${!certified ? `${occupied ? `${data.register ? ``: `<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:`<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:``}
        </article>` : ``}
        ${data.zipcode === '48213' ? `
        <article class="info-items">
         <span>ENFORCEMENT DATES</span>
         <item>Must be Registered by Oct 4th, 2019</item><br>
         <item>Must be Compliant by Jan 2nd, 2020</item>
         ${!certified ? `${occupied ? `${data.register ? ``: `<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:`<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:``}
        </article>` : ``}
        ${data.zipcode === '48238' ? `
        <article class="info-items">
         <span>ENFORCEMENT DATES</span>
         <item>Must be Registered by Oct 4th, 2019</item><br>
         <item>Must be Compliant by Jan 2nd, 2020</item>
         ${!certified ? `${occupied ? `${data.register ? ``: `<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:`<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:``}
        </article>` : ``}
        ${data.zipcode === '48203' ? `
        <article class="info-items">
         <span>ENFORCEMENT DATES</span>
         <item>Must be Registered by Nov 3rd, 2019</item><br>
         <item>Must be Compliant by Feb 1st, 2020</item>
         ${!certified ? `${occupied ? `${data.register ? ``: `<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:`<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:``}
        </article>` : ``}
        ${data.zipcode === '48211' ? `
        <article class="info-items">
         <span>ENFORCEMENT DATES</span>
         <item>Must be Registered by Nov 3rd, 2019</item><br>
         <item>Must be Compliant by Feb 1st, 2020</item>
         ${!certified ? `${occupied ? `${data.register ? ``: `<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:`<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:``}
        </article>` : ``}
        ${data.zipcode === '48208' ? `
        <article class="info-items">
         <span>ENFORCEMENT DATES</span>
         <item>Must be Registered by Feb 1st,2020</item><br>
         <item>Must be Compliant by May 1st, 2020</item>
         ${!certified ? `${occupied ? `${data.register ? ``: `<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:`<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:``}
        </article>` : ``}
        ${data.zipcode === '48212' ? `
        <article class="info-items">
         <span>ENFORCEMENT DATES</span>
         <item>Must be Registered by Feb 1st,2020</item><br>
         <item>Must be Compliant by May 1st, 2020</item>
         ${!certified ? `${occupied ? `${data.register ? ``: `<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:`<a href="http://www.detroitmi.gov/Government/Departments-and-Agencies/BSEED/Rental-Property-Escrow" target="_blank"><article class="form-btn">APPLY FOR RENTAL ESCROW PROGRAM</article></a>`}`:``}
        </article>` : ``}
        `;
        if(active){
          if (data.register) {
            document.querySelector('.info-container > .rental').innerHTML = `<a href="https://app.smartsheet.com/b/form/efa41296fdc646dcadc3cbca2d6fd6ac" target="_blank"><article class="form-btn">SUBMIT RENTAL COMPLAINT</article></a>`;
          }else{
            document.querySelector('.info-container > .rental').innerHTML = `<a href="https://app.smartsheet.com/b/form/91c0d55e47064373835ce198802764e2" target="_blank"><article class="form-btn">REPORT SUSPECTED RENTAL</article></a>`;
          }
        }else{
          document.querySelector('.info-container > .rental').innerHTML = `<a href="http://www.detroitmi.gov/Portals/0/docs/BSEE/Rental-Property-Compliance-Schedule.pdf" target="_blank"><article class="form-btn">CHECK COMPLIANCE SCHEDULE</article></a>`;
        }
        document.querySelector('.parcel-data.owner').innerHTML = '<div class="data-view-btn" data-view="owner">OWNER INFORMATION <span>&#10095;</span></div>';

        document.querySelector('.parcel-data.building').innerHTML = '<div class="data-view-btn" data-view="building">PROPERTY INFORMATION <span>&#10095;</span></div>';

        let addresss = null;
        (controller.parcelData.propaddr) ? addresss = controller.parcelData.propaddr : addresss = controller.parcelData.features[0].attributes.address;
        document.querySelector('.street-name').innerText = addresss;
        break;
      default:

    }
    return tempHTML;
  }
  clearPanel(){
    document.querySelector('.street-name').innerHTML = `LOADING<span class="dot-1">.</span><span class="dot-2">.</span><span class="dot-3">.</span>`;
    document.querySelector('.info').innerHTML = '';
    document.querySelector('.rental').innerHTML = '';
    document.querySelector('.parcel-info.rental-info').innerHTML = '';
    document.querySelector('.parcel-data.btn-type.owner').innerHTML = '';
    document.querySelector('.parcel-data.btn-type.building').innerHTML = '';
    document.querySelector('.parcel-info.display-section').innerHTML = '';
    document.querySelector('.mapboxgl-ctrl-geocoder.mapboxgl-ctrl input').value = '';
  }
  suggestedAddress(info, controller){
    document.querySelector('.info').innerHTML = '';
    document.querySelector('.mapboxgl-ctrl-geocoder.mapboxgl-ctrl input').value = '';
    document.querySelector('.info-container > .street-name').innerHTML = info.old;
    document.querySelector('.parcel-info.rental-info').innerHTML = `<article class="info-items"><span>SEARCH STATUS</span> NO DATA FOUND<br><br>Did you mean?<br><initial><i id="suggested-addr"  data-lng="${info.lng}" data-lat="${info.lat}">${info.new}</i></initial></article>`;

    document.getElementById('suggested-addr').addEventListener('click', function(e){
      controller.loadSuggestedAddr(e, controller);
    });
  }
}
