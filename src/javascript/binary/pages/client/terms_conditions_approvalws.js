var TNCApproval = (function() {
    "use strict";

    var terms_conditions_version,
        client_tnc_status,
        hiddenClass,
        isReal;


    var init = function() {
        hiddenClass = 'invisible';
        showLoadingImage($('#tnc-loading'));

        BinarySocket.send({"get_settings"   : "1"});
        BinarySocket.send({"website_status" : "1"});

        $('#btn-accept').click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            BinarySocket.send({"tnc_approval" : "1"});
        });
    };

    var showTNC = function() {
        if(!terms_conditions_version || !client_tnc_status) {
            return;
        }

        if(terms_conditions_version === client_tnc_status) {
            redirectToMyAccount();
            return;
        }

        $('#tnc-loading').addClass(hiddenClass);
        $('#tnc_approval').removeClass(hiddenClass);
        $('#tnc-message').html(
            text.localize('[_1] has updated its <a class="pjaxload" href="[_2]">Terms & Conditions</a>. By clicking OK, you confirm that you have read and accepted the updated <a class="pjaxload" href="[_2]">Terms & Conditions</a>.')
                .replace('[_1]', page.client.get_storage_value('landing_company_name'))
                .replace('[_2]', page.url.url_for('/terms-and-conditions'))
        );
        $('#btn-accept').text(text.localize('OK'));
    };

    var responseTNCApproval = function(response) {
        if(response.tnc_approval === '1') {
            redirectToMyAccount();
        }
        else {
            $('#err_message').html(response.error.message).removeClass(hiddenClass);
        }
    };

    var redirectToMyAccount = function() {
        window.location.href = page.url.url_for('/user/my_accountws');
    };

    var apiResponse = function(response) {
        isReal = !TUser.get().is_virtual;
        if(!isReal) {
            redirectToMyAccount();
        }

        switch(response.msg_type) {
            case 'website_status':
                terms_conditions_version = response.website_status.terms_conditions_version;
                showTNC();
                break;
            case 'get_settings':
                client_tnc_status = response.get_settings.client_tnc_status || '-';
                showTNC();
                break;
            case 'tnc_approval':
                responseTNCApproval(response);
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



pjax_config_page("terms_conditions_approvalws", function() {
    return {
        onLoad: function() {
            if (!$.cookie('login')) {
                window.location.href = page.url.url_for('login');
                return;
            }

            BinarySocket.init({
                onmessage: function(msg) {
                    var response = JSON.parse(msg.data);
                    if (response) {
                        TNCApproval.apiResponse(response);
                    }
                }
            });

            Content.populate();
            TNCApproval.init();
        }
    };
});
