'use strict';
const moment = require('moment');
export default class Panel {
  constructor() {
  }

  creatPanel(type, controller, data = null, active = false, certified = false){
    let markup = '';
    switch (type) {
      case 'initial':
        document.querySelector('.info-container .info').innerHTML = `Welcome to the Detroit Rental Dashboard. Please use this tool
        look up the status of a rental property. For more information, please
        visit the <a href="https://data.detroitmi.gov/resource/vphr-kg52" target="_blank">Detroit Open Data Portal</a>.`;
        document.querySelector('.info-container > .rental').innerHTML = ``;
        break;
      case 'district':

        break;
      case 'parcel':
        markup = controller.panel.createMarkup(type, controller, data, active, certified);
        document.querySelector('.info-container .info').innerHTML = '';
        break;
      case 'rental':
        markup = controller.panel.createMarkup(type, controller, data, active, certified);
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
  createMarkup(type, controller, data, active, certified){
    let tempHTML = null;
    switch (type) {
      case 'rental':
        tempHTML = `
        <article class="info-items">
          <span>COMPLIANCE STATUS</span>
          ${certified != false ? `<img src="img/done.png" alt="x"> <item>APPROVED FOR RENTAL</item>` : `NOT APPROVED RENTAL<br><img src="img/done.png" alt="check"> <item>Registered on ${moment(data.properties.csa_date3).format('MMM Do,YYYY')}</item><br><img src="img/cancel.png" alt="x"> <item>Compliance</item></article>`}
        </article>
        `;
        document.querySelector('.info-container > .rental').innerHTML = `<a href="https://app.smartsheet.com/b/form/efa41296fdc646dcadc3cbca2d6fd6ac" target="_blank"><article class="form-btn">SUBMIT RENTAL COMPLAINT</article></a>`;

        document.querySelector('.parcel-data.owner').innerHTML = '<div class="data-view-btn" data-view="owner">OWNER INFORMATION <span>&#10095;</span></div>';

        document.querySelector('.parcel-data.building').innerHTML = '<div class="data-view-btn" data-view="building">PROPERTY INFORMATION <span>&#10095;</span></div>';

        document.querySelector('.street-name').innerText = controller.parcelData.propstreetcombined;
        break;
      case 'parcel':
        tempHTML = `
        <article class="info-items">
          <span>COMPLIANCE STATUS</span>
          ${certified == true ? `<img src="img/done.png" alt="x"> <item>APPROVED FOR RENTAL</item>` : `NOT APPROVED RENTAL<br>${data.register == true ? `<img src="img/done.png" alt="check"> <item>Registered on ${data.registrationDate}</item><br>`:`<img src="img/cancel.png" alt="x"> <item>Registered</item><br>`}<img src="img/cancel.png" alt="x"> <item>Compliance</item></article>`}
        </article>
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

        document.querySelector('.street-name').innerText = controller.parcelData.propstreetcombined;
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
}
