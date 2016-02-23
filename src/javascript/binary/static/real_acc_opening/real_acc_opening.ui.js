var RealAccOpeningUI = (function(){
  "use strict";

  function checkValidity(){
    var errorCounter = 0;

    var letters = Content.localize().textLetters,
        numbers = Content.localize().textNumbers,
        space   = Content.localize().textSpace,
        hyphen  = Content.localize().textHyphen,
        period  = Content.localize().textPeriod,
        apost   = Content.localize().textApost;

    var elementObj = {
        title     : document.getElementById('title'),
        fname     : document.getElementById('fname'),
        lname     : document.getElementById('lname'),
        dobdd     : document.getElementById('dobdd'),
        dobmm     : document.getElementById('dobmm'),
        dobyy     : document.getElementById('dobyy'),
        residence : document.getElementById('residence-disabled'),
        address1  : document.getElementById('address1'),
        address2  : document.getElementById('address2'),
        town      : document.getElementById('address-town'),
        state     : document.getElementById('address-state'),
        postcode  : document.getElementById('address-postcode'),
        tel       : document.getElementById('tel'),
        question  : document.getElementById('secret-question'),
        answer    : document.getElementById('secret-answer'),
        tnc       : document.getElementById('tnc')
    };

    var errorObj = {
        title     : document.getElementById('error-title'),
        fname     : document.getElementById('error-fname'),
        lname     : document.getElementById('error-lname'),
        birthdate : document.getElementById('error-birthdate'),
        residence : document.getElementById('error-residence'),
        address1  : document.getElementById('error-address1'),
        address2  : document.getElementById('error-address2'),
        town      : document.getElementById('error-town'),
        state     : document.getElementById('error-state'),
        postcode  : document.getElementById('error-postcode'),
        tel       : document.getElementById('error-tel'),
        question  : document.getElementById('error-question'),
        answer    : document.getElementById('error-answer'),
        tnc       : document.getElementById('error-tnc')
    };

    var key;
    for (key in errorObj) {
      if (errorObj[key].offsetParent !== null) {
        errorObj[key].setAttribute('style', 'display:none');
      }
    }

    AccountOpening.checkFname(elementObj['fname'], errorObj['fname']);
    AccountOpening.checkLname(elementObj['lname'], errorObj['lname']);
    AccountOpening.checkDate(elementObj['dobdd'], elementObj['dobmm'], elementObj['dobyy'], errorObj['dobdd']);
    AccountOpening.checkAddress(elementObj['address1'], errorObj['address1'], elementObj['address2'], errorObj['address2']);
    AccountOpening.checkTown(elementObj['town'], errorObj['town']);
    AccountOpening.checkPostcode(elementObj['postcode'], errorObj['postcode']);

    if (residence.value === 'gb' && /^$/.test(Trim(postcode.value))){
      errorPostcode.innerHTML = Content.errorMessage('req');
      Validate.displayErrorMessage(errorPostcode);
      errorCounter++;
    }

    AccountOpening.checkTel(elementObj['tel'], errorObj['tel']);
    AccountOpening.checkAnswer(elementObj['answer'], errorObj['answer']);

    for (key in elementObj){
      if (elementObj[key].offsetParent !== null && key !== 'address2' && key !== 'postcode' && key !== 'state') {
        if (/^$/.test(Trim(elementObj[key].value)) && elementObj[key].type !== 'checkbox'){
          errorObj[key].innerHTML = Content.errorMessage('req');
          Validate.displayErrorMessage(errorObj[key]);
          errorCounter++;
        }
        if (elementObj[key].type === 'checkbox' && !elementObj[key].checked){
          errorObj[key].innerHTML = Content.errorMessage('req');
          Validate.displayErrorMessage(errorObj[key]);
          errorCounter++;
        }
      }
    }

    if (errorCounter === 0) {
      RealAccOpeningData.getRealAcc(arr);
      hideAllErrors(allErrors);
      return 1;
    }
    return 0;
  }

  return {
    checkValidity: checkValidity
  };
})();
