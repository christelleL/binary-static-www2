var MyAccountWS = (function() {
    "use strict";

    var loginid,
        isReal;
    var hiddenClass,
        welcomeTextID,
        virtualTopupID,
        authButtonID;

    var init = function() {
        hiddenClass    = 'invisible';
        welcomeTextID  = '#welcome_text';
        virtualTopupID = '#VRT_topup_link';
        authButtonID   = '#authenticate_button';

        loginid = page.client.loginid || $.cookie('loginid');

        BinarySocket.send({"get_settings": 1});
        BinarySocket.send({"get_account_status": 1});

        //checkDisabledAccount();
    };

    var responseGetSettings = function(response) {
        var get_settings = response.get_settings;

        showWelcomeMessage();
        if(!isReal) {
            showTopUpLink();
        }
        else {
            if(get_settings.is_authenticated_payment_agent) {
                $('#payment_agent').removeClass(hiddenClass);
            }
            showNoticeMsg();
        }

        addGTMDataLayer(get_settings);
    };

    var responseAccountStatus = function(response) {
        if(response.get_account_status[0] === 'unwelcome'){
            $(authButtonID).removeClass(hiddenClass);
        }

        $('#loading').remove();
    };

    var showWelcomeMessage = function() {
        var landing_company = page.client.get_storage_value('landing_company_name');
        $(welcomeTextID)
            .text(
                (text.localize(
                    isReal ? 
                        "You're currently logged in to your real money account with %1" : 
                        "You're currently logged in to your virtual money account"
                ).replace('%1', landing_company || '') + 
                ' (' + loginid + ').').replace(/\s\s+/g, ' ')
            )
            .removeClass(hiddenClass);
    };

    var showTopUpLink = function() {
        if(TUser.get().balance < 1000) {
            $(virtualTopupID + ' a')
                .text(
                    (text.localize('Deposit %1 virtual money into your account ') + loginid)
                    .replace('%1', TUser.get().currency + ' 10000')
                );
            $(virtualTopupID).removeClass(hiddenClass);
        }
    };

    var showNoticeMsg = function() {
        var loginid_list = $.cookie('loginid_list');
        var res = loginid_list.split('+');
        if(res.length === 2 && (/MLT/.test(res[0]) || /MLT/.test(res[1]))) {
            $('#investment_message').removeClass(hiddenClass);
        }
    };

    var addGTMDataLayer = function(get_settings) {
        var is_login = page.url.param('login'),
            is_newaccount = page.url.param('newaccounttype');
        if(is_login || is_newaccount) {
            var oldUrl = window.location.href;
            var newUrl = oldUrl.replace(/(login=true&|newaccounttype=real&|newaccounttype=virtual&)/gi, '');
            var data   = {};
            var affiliateToken = $.cookie('affiliate_tracking');
            if (affiliateToken) {
                dataLayer.push({'bom_affiliate_token': affiliateToken});
            }
            data['bom_country'] = get_settings.country;
            data['bom_email']   = get_settings.email;
            data['url']         = oldUrl;
            data['bom_today']   = Math.floor(Date.now() / 1000);
            data['event']       = is_newaccount ? 'new_account' : 'log_in';

            if(is_newaccount) {
                data['bom_date_joined'] = data['bom_today'];
            }

            if(isReal) {
                data['bom_age']       = parseInt((moment(str).unix() - get_settings.date_of_birth) / 31557600);
                data['bom_firstname'] = get_settings.first_name;
                data['bom_lastname']  = get_settings.last_name;
                data['bom_phone']     = get_settings.phone;
            }

            GTM.push_data_layer(data);

            window.history.replaceState('My Account', title, newUrl);
        }
    };

    var checkDisabledAccount = function() {
        var disabledAccount = [];
        page.user.loginid_array.map(function(loginObj) {
            if (loginObj.disabled && loginObj.real) {
                disabledAccount.push(loginObj.id);
            }
        });

        if(disabledAccount.length > 0) {
            var msgSingular = text.localize('Your %1 account is unavailable. For any questions please contact <a href="%2">Customer Support</a>.'),
                msgPlural   = text.localize('Your %1 accounts are unavailable. For any questions please contact <a href="%2">Customer Support</a>.');
            $('<p/>', {class: 'notice-msg'})
                .html(
                    (disabledAccount.length === 1 ? msgSingular : msgPlural)
                        .replace('%1', disabledAccount.join(', '))
                        .replace('%2', page.url.url_for('contact'))
                )
                .insertAfter($(welcomeTextID));
        }
    };

    var apiResponse = function(response) {
        if('error' in response){
            if('message' in response.error) {
                console.log(response.error.message);
            }
            return false;
        }

        isReal = !TUser.get().is_virtual;

        switch(response.msg_type) {
            case 'get_account_status':
                responseAccountStatus(response);
                break;
            case 'get_settings':
                responseGetSettings(response);
                break;
            case 'landing_company_details':
                showWelcomeMessage();
                break;
            default:
                break;
        }
    };

    return {
        init : init,
        apiResponse : apiResponse
    };
}());


pjax_config_page("user/my_accountws", function() {
    return {
        onLoad: function() {
            if (!getCookieItem('login')) {
                window.location.href = page.url.url_for('login');
                return;
            }

            showLoadingImage($('<div/>', {id: 'loading'}).insertAfter('#welcome'));

            if(page.url.param('login')) {
                page.client.clear_storage_values();
            }

            BinarySocket.init({
                onmessage: function(msg) {
                    var response = JSON.parse(msg.data);
                    if (response) {
                        MyAccountWS.apiResponse(response);
                    }
                }
            });

            Content.populate();
            MyAccountWS.init();
        }
    };
});
