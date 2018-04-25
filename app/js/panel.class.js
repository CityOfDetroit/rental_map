'use strict';
const moment = require('moment');
export default class Panel {
  constructor() {
  }

  creatPanel(type, controller, data = null){
    switch (type) {
      case 'initial':
        // document.getElementById('initial-loader-overlay').className = '';
        break;
      case 'district':

        break;
      case 'parcel':

        break;
      default:

    }
    // let markup = controller.panel.createMarkup(data.dataSets, controller);
    // document.querySelector('.local-address').innerText = `INFO FOR: ${data.title}`;
    // document.querySelector('#local-services-results .local-content').innerHTML = markup;
    // document.getElementById('local-services-results').className = 'active';
  }
  createMarkup(values, controller){
    let siteURL = window.location.hostname;
    let tempHTML = `
    <article class="info-section">
      <span>GOVERNMENT</span>`;
    if(Object.keys(values[0].data).length != 0 && values[0].data.constructor === Object){
      tempHTML += `
        <div>
          <p><strong>COUNCIL:</strong> <a href="${values[0].data.districtURL}" target="_blank">${values[0].data.district}</a></p>
          <p><strong>COUNCIL MEMBER:</strong> <a href="http://${siteURL}${values[0].data.council.url}" target="_blank">${values[0].data.council.name}</a></p>
          <p><strong>DISTRICT MANAGER:</strong> <a href="${values[0].data.dmanager.url}" target="_blank">${values[0].data.dmanager.name}</a></p>
          <p><strong>DISTRICT MANAGER PHONE:</strong> ${values[0].data.dmanager.phone}</p>
          <p><strong>DEPUTY MANAGER:</strong> <a href="${values[0].data.ddmanager.url}" target="_blank">${values[0].data.ddmanager.name}</a></p>
          <p><strong>DEPUTY MANAGER PHONE:</strong> ${values[0].data.ddmanager.phone}</p>
        </div>
      </article>`;
    }else{
      tempHTML += `
        <div>
          <p>NO GOVERNMENT INFO FOUND</p>
        </div>
      </article>`;
    }
    if(Object.keys(values[1].data).length != 0 && values[1].data.constructor === Object){
      tempHTML += `
      <article class="info-section">
        <span>NEIGHBORHOOD</span>
        <div>
          <p><strong>NAME:</strong> ${values[1].data.features[0].attributes.NHood_Name}</p>
        </div>
      </article>`;
    }else{
      tempHTML += `
      <article class="info-section">
        <span>NEIGHBORHOOD</span>
        <div>
          <p>NO NEIGHBORHOOD FOUND</p>
        </div>
      </article>`;
    }
    if(Object.keys(values[7].data).length != 0 && values[7].data.constructor === Object){
      tempHTML += `
      <article class="info-section">
        <span>POLICE</span>
        <div>
          <h5>NEIGHBORHOOD POLICE OFFICER (NPO)</h5>
          <p><strong>NAME:</strong> ${values[7].data.features[0].attributes.NPO_Office}</p>
          <p><strong>PHONE:</strong> ${values[7].data.features[0].attributes.Phone}</p>
          <p><strong>Email:</strong> ${values[7].data.features[0].attributes.Email}</p>
        </div>`;
      if(values[7].data.features[0].attributes.Sgt_Phone != "0"){
        tempHTML += `
        <div>
          <h5>SERGEANT</h5>
          <p><strong>NAME:</strong> ${values[7].data.features[0].attributes.Sergeant}</p>
          <p><strong>PHONE:</strong> ${values[7].data.features[0].attributes.Sgt_Phone}</p>
        </div>`;
      }
      tempHTML += `</article>`;
    }else{
      tempHTML += `
      <article class="info-section">
        <span>POLICE</span>
        <div>
          <p>NO POLICE INFO FOUND</p>
        </div>
      </article>`;
    }
    if(Object.keys(values[9].data).length != 0 && values[9].data.constructor === Object){
      let contractorInfo = {
        name: null,
        url: null,
        phone: null
      };
      if(values[9].data.next_pickups.trash.contractor === 'gfl'){
        contractorInfo.name = 'GFL';
        contractorInfo.url =  'http://gflusa.com/residential/detroit/';
        contractorInfo.phone = '(844) 464-3587';
      }else{
        contractorInfo.name = 'ADVANCED';
        contractorInfo.url =  'http://www.advanceddisposal.com/mi/detroit/detroit-residential-collection';
        contractorInfo.phone = ' (844) 233-8764';
      }
      tempHTML += `
      <article class="info-section">
        <span>TRASH & RECYCLING</span>
        <div>
          <p><strong>PROVIDER:</strong> <a href="${contractorInfo.url}" target="_blank">${contractorInfo.name}</a> ${contractorInfo.phone}</p>
          <p><strong>NEXT TRASH:</strong> ${moment(values[9].data.next_pickups.trash.next_pickup).format('MMM DD, YYYY')}</p>
          <p><strong>NEXT RECYCLING:</strong> ${moment(values[9].data.next_pickups.recycling.next_pickup).format('MMM DD, YYYY')}</p>
          <p><strong>NEXT BULK:</strong> ${moment(values[9].data.next_pickups.bulk.next_pickup).format('MMM DD, YYYY')}</p>`;
      if('yard waste' in values[9].data.next_pickups){
        tempHTML += `<p><strong>NEXT YARD:</strong> ${moment(values[9].data.next_pickups['yard waste'].next_pickup).format('MMM DD, YYYY')}</p>`;
      }
      tempHTML += `</div>
      <h4><a href="http://www.detroitmi.gov/publicworks" target="_blank">MORE INFO</a></h4>
      </article>`;
    }else{
      tempHTML += `
      <article class="info-section">
        <span>TRASH & RECYCLING</span>
        <div>
          <p>NO TRASH & RECYCLING INFO FOUND</p>
        </div>
      </article>`;
    }
    if(Object.keys(values[2].data).length != 0 && values[2].data.constructor === Object){
      let property = {
        year: null,
        value: null,
        floor: null,
        buildingClass: null
      }
      tempHTML += `
      <article class="info-section">
        <span>OWNER</span>
        <div>
          <p><strong>NAME:</strong> ${values[2].data.ownername1}</p>
          <p><strong>CITY:</strong> ${values[2].data.ownercity}</p>
          <p><strong>STATE:</strong> ${values[2].data.ownerstate}</p>
          <p><strong>ADDRESS:</strong> ${values[2].data.ownerstreetaddr}</p>
          <p><strong>ZIP:</strong> ${values[2].data.ownerzip}</p>
        </div>
      </article>`;
      if(values[2].data.resb_bldgclass === 0){
        property.year = values[2].data.cib_yearbuilt;
        property.value = values[2].data.cib_value;
        property.floor = values[2].data.cib_yearbuilt;
        property.buildingClass = values[2].data.cib_yearbuilt;
      }else{
        property.year = values[2].data.resb_yearbuilt;
        property.value = values[2].data.resb_value;
        property.floor = values[2].data.resb_floorarea;
        property.buildingClass = values[2].data.resb_bldgclass;
      }
      tempHTML += `
      <article class="info-section">
        <span>PROPERTY</span>
        <div>
          <p><strong>PARCEL NUMBER:</strong> ${values[2].data.pnum}</p>
          <p><strong>YEAR BUILD:</strong> ${property.year}</p>
          <p><strong>CALCULATED VALUE:</strong> $${property.value.toLocaleString()}</p>
          <p><strong>FLOOR AREA:</strong> ${property.floor.toLocaleString()} SQFT</p>
          <p><strong>BUILDING CLASS:</strong> ${property.buildingClass}</p>
        </div>
      </article>
      <article class="info-section">
      <span>BLIGHT TICKETS</span>`;
    }else{
      tempHTML += `
      <article class="info-section">
        <span>OWNER</span>
        <div>
          <p>NO OWNER INFO</p>
        </div>
      </article>
      <article class="info-section">
        <span>PROPERTY</span>
        <div>
          <p>NO PROPERTY INFO FOUND</p>
        </div>
      </article>
      <article class="info-section">
      <span>BLIGHT TICKETS</span>`;
    }
    if(values[4].data.length){
      values[4].data.forEach(function(value){
        tempHTML += `
        <div>
          <p><strong>TICKET ID:</strong> ${value.ticket_id}</p>
          <p><strong>FINE AMOUNT:</strong> $${value.fine_amount}</p>
          <p><strong>AGENCY NAME:</strong> ${value.agency_name}</p>
          <p><strong>DISPOSITION:</strong> ${value.disposition}</p>
          <p><strong>DESCRIPTION:</strong> ${value.violation_description}</p>
          <p><strong>HEARING DATE:</strong> ${moment(value.hearing_date).format('MMM DD, YYYY')}</p>
          <p><strong>HEARING TIME:</strong> ${value.hearing_time}</p>
        </div>
        `;
      });
      tempHTML += `<h4><a href="https://data.detroitmi.gov/resource/s7hj-n86v" target="_blank">MORE INFO</a></h4>`;
    }else{
      tempHTML += `
      <div>
        <p>NO BLIGHT TICKETS FOUND</p>
      </div>`;
    }
    tempHTML += `</article>
    <article class="info-section">
    <span>PROPERTY SALES HISTORY</span>`;
    if(values[5].data.length){
      values[5].data.forEach(function(value){
        tempHTML += `
        <div>
          <p><strong>SALE DATE:</strong> ${moment(value.sale_date).format('MMM DD, YYYY')}</p>
          <p><strong>SALE PRICE:</strong> $${parseInt(value.sale_price).toLocaleString()}</p>
          <p><strong>GRANTEE:</strong> ${value.grantee}</p>
          <p><strong>GRANTOR:</strong> ${value.grantor}</p>
        </div>
        `;
      });
      tempHTML += `<h4><a href="https://data.detroitmi.gov/resource/9xku-658c" target="_blank">MORE INFO</a></h4>`;
    }else{
      tempHTML += `
      <div>
        <p>NO PROPERTY SALES HISTORY FOUND</p>
      </div>`;
    }
    tempHTML += `</article>
    <article class="info-section">
    <span>BUILDING PERMITS</span>`;
    if(values[3].data.length){
      values[3].data.forEach(function(value){
        tempHTML += `
        <div>
          <p><strong>PERMIT NUMBER:</strong> ${value.permit_no}</p>
          <p><strong>PERMIT TYPE:</strong> ${value.bld_permit_type}</p>
          <p><strong>PERMIT BUILDING TYPE:</strong> ${value.residential}</p>
          <p><strong>PERMIT STATUS:</strong> ${value.permit_status}</p>
          <p><strong>PERMIT ISSUED:</strong> ${moment(value.permit_issued).format('MMM DD, YYYY')}</p>
          <p><strong>PERMIT EXPIRED:</strong> ${moment(value.permit_expire).format('MMM DD, YYYY')}</p>
          <p><strong>PERMIT DESCRIPTION:</strong> ${value.bld_permit_desc}</p>
        </div>
        `;
      });
      tempHTML += `<h4><a href="https://data.detroitmi.gov/resource/but4-ky7y" target="_blank">MORE INFO</a></h4>`;
    }else{
      tempHTML += `
      <div>
        <p>NO BUILDING PERMITS FOUND</p>
      </div>`;
    }
    tempHTML += `</article>
    <article class="info-section">
    <span>DEMOLITIONS</span>`;
    if(values[6].data.length){
      values[6].data.forEach(function(value){
        tempHTML += `
        <div>
          <p><strong>ADDRESS:</strong> ${value.address}</p>
          <p><strong>COMMERCIAL:</strong> ${value.commercial}</p>
          <p><strong>PRICE:</strong> $${parseInt(value.price).toLocaleString()}</p>
          <p><strong>PARCEL:</strong> ${value.parcel_id}</p>
          <p><strong>CONTRACTOR:</strong> ${value.contractor_name}</p>
          <p><strong>COUNCIL DISTRICT:</strong> ${value.council_district}</p>
          <p><strong>NEIGHBORHOOD:</strong> ${value.neighborhood}</p>
          <p><strong>DATE:</strong> ${moment(value.demolition_date).format('MMM DD, YYYY')}</p>
        </div>`;
      });
      tempHTML += `
      <h4><a href="https://data.detroitmi.gov/resource/nfx3-ihbp" target="_blank">MORE INFO</a></h4>
      </article>`;
    }else{
      tempHTML += `
      <div>
        <p>NO DEMOLITIONS FOUND</p>
      </div>
      </article>`;
    }
    if(values[8].data.length){
      tempHTML += `
      <article class="info-section">
      <span>IMPROVE DETROIT</span>`;
      values[8].data.forEach(function(value){
        tempHTML += `
        <div>
          <p><strong>ID:</strong> <a href="${value.web_url}" target="_blank">${value.id}</a></p>
          <p><strong>TYPE:</strong> ${value.request_type_title}</p>
          <p><strong>STATUS:</strong> ${value.status}</p>
          <p><strong>REPORTED ON:</strong> ${moment(value.created_at).format('MMM DD, YYYY')}</p>
          <p><strong>DESCRIPTION:</strong> ${value.description}</p>
        </div>`;
      });
      tempHTML += `
      <h4><a href="https://seeclickfix.com/enhanced_watch_areas/674" target="_blank">MORE INFO</a></h4>
      </article>`;
    }else{
      tempHTML += `
      <article class="info-section">
      <span>IMPROVE DETROIT</span>
      <div>
        <p>NO IMPROVE DETROIT ISSUES</p>
      </div>
      </article>`;
    }
    return tempHTML;
  }
}
