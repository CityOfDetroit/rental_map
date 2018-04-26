'use strict';
const moment = require('moment');
export default class Panel {
  constructor() {
  }

  creatPanel(type, controller, data = null, active = false, certified = false){
    let markup = null;
    switch (type) {
      case 'initial':
        // document.getElementById('initial-loader-overlay').className = '';
        break;
      case 'district':

        break;
      case 'parcel':
        console.log(active);
        console.log(data);
        document.querySelector('.info-container .info').innerHTML = '';
        document.querySelector('.info-container .parcel-info.rental-info').innerHTML = markup;
        break;
      case 'rental':
        console.log(active);
        console.log(data);
        markup = controller.panel.createMarkup(type, controller, data, active, certified);
        document.querySelector('.info-container .info').innerHTML = '';
        document.querySelector('.info-container .parcel-info.rental-info').innerHTML = markup;
        break;
      default:

    }
    console.log(markup);
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
        break;
      case rental:
        tempHTML = `

        `;
        break;
      default:

    }
    return tempHTML;
  }
}
