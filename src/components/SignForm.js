import './SignForm.scss';
export default class SignForm {
    constructor() {
        this.form = document.createElement('form');
        this.form.className = 'sms-sign-up';
    }

    buildForm(_panel){
        // Create phone input
        let input = document.createElement('input');
        input.type = 'phone';
        input.placeholder = 'Enter phone - numbers only.';
        input.setAttribute('id', 'phone');
        input.setAttribute('minlength', 13);
        input.setAttribute('required', true);
        input.addEventListener('keyup', (ev)=>{
            _panel.signup.phoneFormat(ev, _panel.signup);
        });
        let inputLabel = document.createElement('label');
        inputLabel.innerText = "Phone";
        inputLabel.setAttribute("for", "phone"); 
        let inputContainer = document.createElement('div');
        inputContainer.className = "container-box";
        inputContainer.appendChild(inputLabel);
        inputContainer.appendChild(input);
        // Create service selection
        let checkBoxTrash = document.createElement('input');
        checkBoxTrash.type = 'checkbox';
        checkBoxTrash.setAttribute('id', 'trash');
        checkBoxTrash.value = _panel.data.next_pickups.trash.route;
        checkBoxTrash.name = "service-signup";
        checkBoxTrash.setAttribute('checked', true);
        let checkBoxTrashLabel = document.createElement('label');
        checkBoxTrashLabel.innerText = "Garbage";
        checkBoxTrashLabel.setAttribute("for", "trash");
        let checkboxContainerTrash = document.createElement('div');
        checkboxContainerTrash.className = "checkbox-container-box";
        checkboxContainerTrash.appendChild(checkBoxTrash);
        checkboxContainerTrash.appendChild(checkBoxTrashLabel); 

        let checkBoxRecycle = document.createElement('input');
        checkBoxRecycle.type = 'checkbox';
        checkBoxRecycle.setAttribute('id', 'recycling');
        checkBoxRecycle.value = _panel.data.next_pickups.recycling.route;
        checkBoxRecycle.name = "service-signup";
        checkBoxRecycle.setAttribute('checked', true);
        let checkBoxRecycleLabel = document.createElement('label');
        checkBoxRecycleLabel.innerText = "Recycle";
        checkBoxRecycleLabel.setAttribute("for", "recycling");
        let checkboxContainerRecycle = document.createElement('div');
        checkboxContainerRecycle.className = "checkbox-container-box";
        checkboxContainerRecycle.appendChild(checkBoxRecycle);
        checkboxContainerRecycle.appendChild(checkBoxRecycleLabel); 

        let checkBoxBulk = document.createElement('input');
        checkBoxBulk.type = 'checkbox';
        checkBoxBulk.setAttribute('id', 'bulk');
        checkBoxBulk.value = _panel.data.next_pickups.bulk.route;
        checkBoxBulk.name = "service-signup";
        checkBoxBulk.setAttribute('checked', true);
        let checkBoxBulkLabel = document.createElement('label');
        checkBoxBulkLabel.innerText = "Bulk/Yard Waste";
        checkBoxBulkLabel.setAttribute("for", "bulk");
        let checkboxContainerBulk = document.createElement('div');
        checkboxContainerBulk.className = "checkbox-container-box";
        checkboxContainerBulk.appendChild(checkBoxBulk);
        checkboxContainerBulk.appendChild(checkBoxBulkLabel); 

        let checkboxContainers = document.createElement('div');
        checkboxContainers.className = "checkbox-container-group-box";
        checkboxContainers.appendChild(checkboxContainerTrash);
        checkboxContainers.appendChild(checkboxContainerRecycle);
        checkboxContainers.appendChild(checkboxContainerBulk);
        // Create message section
        let alertMessage = document.createElement('div');
        alertMessage.className = "alert-message-box";
        // Create submit button
        let signupButton = document.createElement('button');
        signupButton.innerText = "SIGN ME UP FOR REMINDERS";
        // Load form with components
        _panel.signup.form = document.createElement('form');
        _panel.signup.form.appendChild(checkboxContainers);
        _panel.signup.form.appendChild(inputContainer);
        _panel.signup.form.appendChild(alertMessage);
        _panel.signup.form.appendChild(signupButton);
        _panel.signup.form.addEventListener('submit', (ev) => {
            ev.preventDefault();
            _panel.signup.validatePhone(ev, _panel);
        });
    }

    phoneFormat(ev){
        let numbers = ev.target.value.replace(/\D/g, ''),
        char = {0:'(',3:')',6:'-'};
        ev.target.value = '';
        for (var i = 0; i < numbers.length; i++) {
            ev.target.value += (char[i]||'') + numbers[i];
        }
    }

    signUpUser(url, data, ev, _panel, success){
        let params = typeof data == 'string' ? data : Object.keys(data).map(
                function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]); }
            ).join('&');
        // console.log(params);
        let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        xhr.open('POST', url);
        xhr.onload  = function() {
          if (xhr.readyState>3 && Math.trunc(xhr.status / 100) == 2) {
            success(ev, _panel, xhr.responseText);
          }else{
            _panel.signup.buildMessage(ev, 'error', _panel);
          }
        };
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.addEventListener("error", function(e){
          console.log(e);
        });
        xhr.send(params);
        return xhr;
    }
    
    stripPhoneNumber(number){
        let newNumber = '';
        newNumber = number.split('(')[1];
        newNumber = newNumber.split(')')[0] + newNumber.split(')')[1];
        newNumber = newNumber.split('-')[0] + newNumber.split('-')[1];
        return newNumber;
    }

    closeSection(ev){
        let tempClass = ev.target.parentNode.className;
        tempClass = tempClass.split(' ');
        ev.target.parentNode.className = tempClass[0];
        try {
            while (ev.target.parentNode.firstChild) {
                ev.target.parentNode.removeChild(ev.target.parentNode.firstChild);
            }
        } catch (error) {
            
        }
    }

    buildMessage(ev, type, _panel){
        while (ev.target.childNodes[2].firstChild) {
            ev.target.childNodes[2].removeChild(ev.target.childNodes[2].firstChild);
        }
        let closeBtn = document.createElement('button');
        closeBtn.innerText = 'x';
        closeBtn.className = 'close-section-btn';
        closeBtn.addEventListener("click", function(e){
            e.preventDefault();
            _panel.signup.closeSection(e);
        });
        let msg = document.createElement('p');
        msg.innerText = null;
        ev.target.childNodes[2].appendChild(closeBtn);
        ev.target.childNodes[2].appendChild(msg);
        ev.target.childNodes[2].className = null;
        switch (type) {
            case 'invalid':
                msg.innerText = 'Invalid phone number. Please enter a valid number.';
                ev.target.childNodes[2].className = 'alert-message-box active error';
                break;

            case 'missing':
                msg.innerText = 'Plese select one or more services to recive reminders.';
                ev.target.childNodes[2].className = 'alert-message-box active error';
                break;

            case 'error':
                msg.innerText = 'There was an error with your request. Please try again.';
                ev.target.childNodes[2].className = 'alert-message-box active error';
                break;
        
            default:
                msg.innerText = 'Check your phone for a confirmation message.';
                ev.target.childNodes[2].className = 'alert-message-box active success';
                break;
        }
    }
     
    validatePhone(ev, _panel){
        let phoneNumber = ev.target[3].value;
        let a = /^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/.test(phoneNumber);
        phoneNumber = this.stripPhoneNumber(phoneNumber);
        if(a){
            let routeIDs = '';
            let servicesSignup = '';
            let serviceCheckList = document.querySelectorAll('.checkbox-container-box > input[type="checkbox"]');
            for (var i = 0; i < serviceCheckList.length; i++) {
                if(serviceCheckList[i].checked){
                routeIDs += serviceCheckList[i].value + ',';
                servicesSignup += serviceCheckList[i].id + ',';
                }
            }
            if(routeIDs !== ''){
                let data = {
                'phone_number'  : phoneNumber,
                'waste_area_ids': routeIDs,
                'service_type'  : servicesSignup,
                'address' : _panel.address,
                'latitude' :  _panel.location.lat,
                'longitude' : _panel.location.lng
                };
                this.signUpUser('https://apis.detroitmi.gov/waste_notifier/subscribe/', data, ev, _panel, function(ev,_panel,response){
                    _panel.signup.buildMessage(ev, 'success', _panel);
                });
            }else{
                this.buildMessage(ev, 'missing', _panel);
            }
        }else{
            this.buildMessage(ev, 'invalid', _panel);
        }
    }
}